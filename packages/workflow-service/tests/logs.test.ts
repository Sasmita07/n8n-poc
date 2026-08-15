import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../src/app';
import { addLog, resetState } from '../src/gateways/db/automation-store.adapter';

describe('Logs Domain Routes (/api/v1/logs)', () => {
  beforeEach(() => {
    resetState();
  });

  it('GET /api/v1/logs - returns execution logs list', async () => {
    addLog({ event: 'test' }, 'webhook/automation');

    const res = await app.request('/api/v1/logs');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.logs).toHaveLength(1);
    expect(data.logs[0].source).toBe('webhook/automation');
  });
});
