import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { app } from '../src/app';
import { resetState } from '../src/gateways/db/automation-store.adapter';

vi.mock('axios');

describe('Workflow REST API Routes (/api/v1/workflows)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
  });

  it('POST /api/v1/workflows - creates a new workflow in n8n', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        id: 'wf-999',
        name: 'New Test Workflow',
        active: false,
      },
    });

    const payload = {
      name: 'New Test Workflow',
      nodes: [],
      connections: {},
    };

    const res = await app.request('/api/v1/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.result.id).toBe('wf-999');
    expect(axios.post).toHaveBeenCalled();
  });

  it('POST /api/v1/workflows/:workflowId/activate - activates a workflow in n8n', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        id: 'wf-999',
        active: true,
      },
    });

    const res = await app.request('/api/v1/workflows/wf-999/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { versionId: 'v1.0.0' } }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('activated');
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/workflows/wf-999/activate'),
      expect.anything(),
      expect.anything()
    );
  });

  it('GET /api/v1/workflows - retrieves workflow list from n8n', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: [
        { id: 'wf-1', name: 'Workflow One' },
        { id: 'wf-2', name: 'Workflow Two' },
      ],
    });

    const res = await app.request('/api/v1/workflows', {
      method: 'GET',
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.total).toBe(2);
    expect(data.result).toHaveLength(2);
  });

  it('GET /api/v1/workflows/:workflowId - retrieves details of a specific workflow', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        id: 'wf-123',
        name: 'Detailed Workflow',
        active: true,
      },
    });

    const res = await app.request('/api/v1/workflows/wf-123', {
      method: 'GET',
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.workflowId).toBe('wf-123');
    expect(data.result.name).toBe('Detailed Workflow');
  });
});
