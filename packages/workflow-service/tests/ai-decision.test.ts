import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { app } from '../src/app';
import { envConfig } from '../src/config/env.config';
import { resetState } from '../src/gateways/db/automation-store.adapter';

vi.mock('axios');

const validProviderResponse = {
  recommendation: 'needs_review',
  riskLevel: 'medium',
  summary: 'The request needs a manager review.',
  rationale: 'The supplied policy requires human approval.',
};

describe('AI decision routes (/api/v1/ai/decisions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
    envConfig.aiApiKey = 'test-provider-key';
    vi.mocked(axios.request).mockResolvedValue({ data: { accepted: true } });
  });

  it('validates provider output and dispatches an advisory event to n8n', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        choices: [
          { message: { content: JSON.stringify(validProviderResponse) } },
        ],
      },
    });

    const response = await app.request('/api/v1/ai/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId: 'purchase-review',
        request: 'Review a purchase request.',
        context: 'A manager must review purchases.',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.result.recommendation).toBe('needs_review');
    expect(data.result.humanReviewRequired).toBe(true);
    expect(data.result.dispatchStatus).toBe('dispatched');
    expect(axios.post).toHaveBeenCalledWith(
      envConfig.aiApiUrl,
      expect.objectContaining({ model: envConfig.aiModel }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-provider-key',
        }),
        timeout: 30000,
      }),
    );
    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/webhook/ai-decision'),
        data: expect.objectContaining({
          event: 'ai.decision',
          decisionId: data.result.id,
          workflowId: 'purchase-review',
          recommendation: 'needs_review',
          humanReviewRequired: true,
        }),
      }),
    );
  });

  it('rejects invalid input without calling the provider', async () => {
    const response = await app.request('/api/v1/ai/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: '  ' }),
    });

    expect(response.status).toBe(400);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('returns a configuration error without exposing provider credentials', async () => {
    envConfig.aiApiKey = undefined;

    const response = await app.request('/api/v1/ai/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: 'Review this request.' }),
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      success: false,
      error: 'AI_API_KEY is not configured',
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('does not expose raw provider errors or private prompt text', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(
      new Error('provider failed with request containing private prompt text'),
    );

    const response = await app.request('/api/v1/ai/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: 'Review this request.' }),
    });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      success: false,
      error: 'AI provider request failed.',
    });
    expect(axios.request).not.toHaveBeenCalled();
  });

  it('returns a safe actionable error when provider credentials are rejected', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: 'do not expose provider details' },
      },
    });

    const response = await app.request('/api/v1/ai/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: 'Review this request.' }),
    });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      success: false,
      error:
        'AI provider rejected the API key or project access. Check AI_API_KEY and provider permissions.',
    });
  });

  it('preserves provider rate-limit responses as HTTP 429', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({
      response: { status: 429 },
      code: 'ERR_BAD_REQUEST',
    });

    const response = await app.request('/api/v1/ai/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: 'Review this request.' }),
    });

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      success: false,
      error:
        'AI provider rate limit or usage quota reached. Check provider usage and billing.',
    });
  });

  it('retries a failed n8n handoff without another model call', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        choices: [
          { message: { content: JSON.stringify(validProviderResponse) } },
        ],
      },
    });
    vi.mocked(axios.request)
      .mockRejectedValueOnce(new Error('n8n unavailable'))
      .mockResolvedValueOnce({ data: { accepted: true } });

    const createdResponse = await app.request('/api/v1/ai/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: 'Review this request.' }),
    });
    const created = await createdResponse.json();
    expect(created.result.dispatchStatus).toBe('failed');

    const retryResponse = await app.request(
      `/api/v1/ai/decisions/${created.result.id}/retry`,
      { method: 'POST' },
    );
    const retried = await retryResponse.json();

    expect(retryResponse.status).toBe(200);
    expect(retried.result.dispatchStatus).toBe('dispatched');
    expect(retried.result.id).toBe(created.result.id);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.request).toHaveBeenCalledTimes(2);
  });

  it('does not re-dispatch an event after a successful handoff', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        choices: [
          { message: { content: JSON.stringify(validProviderResponse) } },
        ],
      },
    });

    const createdResponse = await app.request('/api/v1/ai/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: 'Review this request.' }),
    });
    const created = await createdResponse.json();
    const retryResponse = await app.request(
      `/api/v1/ai/decisions/${created.result.id}/retry`,
      { method: 'POST' },
    );

    expect(retryResponse.status).toBe(200);
    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('publishes the AI decision operations in the OpenAPI specification', async () => {
    const response = await app.request('/doc');
    expect(response.status).toBe(200);
    const specification = await response.json();
    expect(specification.paths['/api/v1/ai/decisions'].post).toBeDefined();
    expect(
      specification.paths['/api/v1/ai/decisions/{id}/retry'].post,
    ).toBeDefined();
  });
});
