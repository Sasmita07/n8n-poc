import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../src/app';
import { setState, resetState } from '../src/gateways/db/automation-store.adapter';

describe('States Domain Routes (/api/v1/states)', () => {
  beforeEach(() => {
    resetState();
  });

  it('GET /api/v1/states - returns empty object initially', async () => {
    const res = await app.request('/api/v1/states');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.states).toEqual({});
  });

  it('GET /api/v1/states - returns recorded states dictionary', async () => {
    setState('webhook:automation', { status: 'completed', logId: 1 });

    const res = await app.request('/api/v1/states');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.states['webhook:automation']).toBeDefined();
    expect(data.states['webhook:automation'].status).toBe('completed');
  });

  it('GET /api/v1/states/:type/:id - retrieves state by type and id', async () => {
    setState('webhook:my-trigger', { status: 'running', logId: 42 });

    const res = await app.request('/api/v1/states/webhook/my-trigger');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.type).toBe('webhook');
    expect(data.id).toBe('my-trigger');
    expect(data.status).toBeDefined();
    expect(data.status.status).toBe('running');
  });
});
