import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { app } from '../src/app';
import { resetState } from '../src/gateways/db/automation-store.adapter';

vi.mock('axios');

describe('Logs Domain Routes (/api/v1/logs)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
  });

  it('GET /api/v1/logs - returns n8n execution history', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'execution-1',
            workflowId: 'workflow-1',
            status: 'success',
            startedAt: '2026-11-22T12:00:00.000Z',
          },
        ],
        nextCursor: 'cursor-2',
      },
    });

    const res = await app.request('/api/v1/logs');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.logs).toHaveLength(1);
    expect(data.logs[0].id).toBe('execution-1');
    expect(data.nextCursor).toBe('cursor-2');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/executions'),
      expect.objectContaining({
        params: { limit: 100, includeData: false },
      }),
    );
  });
});
