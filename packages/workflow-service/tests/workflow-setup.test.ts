import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { app } from '../src/app';

vi.mock('axios');

describe('Workflow setup endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates and activates a webhook-triggered workflow', async () => {
    vi.mocked(axios.post)
      .mockResolvedValueOnce({
        data: { id: 'wf-webhook-1', name: 'on-demand' },
      })
      .mockResolvedValueOnce({ data: { id: 'wf-webhook-1', active: true } });

    const response = await app.request('/api/v1/setup/webhook-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'on-demand' }),
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.workflowId).toBe('wf-webhook-1');
    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/api/v1/workflows'),
      expect.objectContaining({
        name: 'on-demand',
        nodes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Webhook Trigger',
            type: 'n8n-nodes-base.webhook',
            parameters: expect.objectContaining({
              path: 'on-demand',
              httpMethod: 'POST',
            }),
          }),
        ]),
      }),
      expect.anything(),
    );
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/v1/workflows/wf-webhook-1/activate'),
      expect.anything(),
      expect.anything(),
    );
  });

  it('creates and activates a schedule-triggered workflow with the requested interval', async () => {
    vi.mocked(axios.post)
      .mockResolvedValueOnce({
        data: { id: 'wf-schedule-1', name: 'periodic-job' },
      })
      .mockResolvedValueOnce({ data: { id: 'wf-schedule-1', active: true } });

    const response = await app.request('/api/v1/setup/scheduled-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'periodic-job', intervalMinutes: 45 }),
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.workflowId).toBe('wf-schedule-1');
    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/api/v1/workflows'),
      expect.objectContaining({
        name: 'periodic-job',
        nodes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Schedule Trigger',
            type: 'n8n-nodes-base.scheduleTrigger',
            parameters: {
              rule: {
                interval: [{ field: 'minutes', minutesInterval: 45 }],
              },
            },
          }),
        ]),
      }),
      expect.anything(),
    );
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/v1/workflows/wf-schedule-1/activate'),
      expect.anything(),
      expect.anything(),
    );
  });
});
