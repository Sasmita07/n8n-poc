import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { app } from '../src/app';

vi.mock('axios');

describe('Email REST API Routes (/api/v1/emails)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/v1/emails - sends an email notification', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        status: 'success',
        messageId: 'msg-12345',
        timestamp: new Date().toISOString(),
      },
    });

    const payload = {
      to: 'user@example.com',
      subject: 'Test Notification',
      body: 'This is a test email.',
    };

    const res = await app.request('/api/v1/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('Email sent');
    expect(axios.post).toHaveBeenCalled();
  });

  it('POST /api/v1/emails - sends to multiple recipients', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        status: 'success',
        messageId: 'msg-12345',
      },
    });

    const payload = {
      to: ['user1@example.com', 'user2@example.com'],
      subject: 'Batch Notification',
      body: 'This email goes to multiple recipients.',
      cc: ['manager@example.com'],
    };

    const res = await app.request('/api/v1/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/webhook/send-email'),
      expect.objectContaining({
        to: expect.any(Array),
        subject: 'Batch Notification',
      }),
      expect.anything()
    );
  });

  it('POST /api/v1/emails - sends with HTML body', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        status: 'success',
        messageId: 'msg-12345',
      },
    });

    const payload = {
      to: 'user@example.com',
      subject: 'Formatted Notification',
      body: 'Plain text version',
      html: '<h1>Formatted Notification</h1><p>HTML version</p>',
    };

    const res = await app.request('/api/v1/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/webhook/send-email'),
      expect.objectContaining({
        html: expect.stringContaining('<h1>'),
      }),
      expect.anything()
    );
  });

  it('POST /api/v1/emails - validates required fields', async () => {
    const payload = {
      to: 'user@example.com',
      subject: 'Test',
      // missing body
    };

    const res = await app.request('/api/v1/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('POST /api/v1/emails - rejects invalid email addresses', async () => {
    const payload = {
      to: 'invalid-email',
      subject: 'Test',
      body: 'Test body',
    };

    const res = await app.request('/api/v1/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
