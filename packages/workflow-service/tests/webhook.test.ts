import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { app } from '../src/app';
import { resetState } from '../src/gateways/db/automation-store.adapter';

vi.mock('axios');

describe('Webhook Automation Routes (/webhook/:path)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
  });

  it('GET /webhook/:path - forwards GET request to n8n and returns tracking log', async () => {
    vi.mocked(axios.request).mockResolvedValueOnce({
      data: { success: true, message: 'Event received' },
    });

    const res = await app.request('/webhook/automation', {
      method: 'GET',
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.webhook).toBe('automation');
    expect(data.logId).toBeDefined();
    expect(data.n8nResult).toEqual({ success: true, message: 'Event received' });

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/webhook/automation'),
      })
    );
  });

  it('POST /webhook/:path - forwards POST request with body payload to n8n', async () => {
    vi.mocked(axios.request).mockResolvedValueOnce({
      data: { success: true, processed: true },
    });

    const bodyPayload = { event: 'user.signup', userId: 'user-123' };

    const res = await app.request('/webhook/user-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.webhook).toBe('user-events');
    expect(data.n8nResult).toEqual({ success: true, processed: true });

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: expect.stringContaining('/webhook/user-events'),
        data: bodyPayload,
      })
    );
  });
});
