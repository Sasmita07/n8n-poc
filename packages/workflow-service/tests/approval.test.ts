import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { app } from '../src/app';
import { resetState } from '../src/gateways/db/automation-store.adapter';

vi.mock('axios');

describe('Approval workflow routes (/api/v1/approvals)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
    vi.mocked(axios.request).mockResolvedValue({ data: { accepted: true } });
  });

  it('POST /api/v1/approvals - creates a pending approval request', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        status: 'success',
        messageId: 'approval-email-1',
      },
    });

    const payload = {
      workflowId: 'wf-approval-1',
      type: 'expense',
      requester: 'alice@example.com',
      approver: 'manager@example.com',
      subject: 'Expense approval required',
      body: 'Please review the $250 travel request.',
    };

    const res = await app.request('/api/v1/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.result.status).toBe('pending');
    expect(data.result.approver).toBe('manager@example.com');
    expect(data.result.workflowStatus).toBe('started');
    expect(data.result.notificationStatus).toBe('sent');
    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/webhook/approval-request'),
        data: expect.objectContaining({
          event: 'approval.requested',
          approvalId: data.result.id,
          workflowId: 'wf-approval-1',
        }),
      }),
    );
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/webhook/send-email'),
      expect.objectContaining({
        to: 'manager@example.com',
        subject: 'Expense approval required',
      }),
      expect.anything(),
    );
  });

  it('POST /api/v1/approvals/:id/decision - updates approval state and allows continuation only after approval', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        status: 'success',
        messageId: 'approval-email-1',
      },
    });

    const createRes = await app.request('/api/v1/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId: 'wf-approval-2',
        type: 'leave',
        requester: 'bob@example.com',
        approver: 'teamlead@example.com',
        subject: 'Leave approval required',
        body: 'Please review the Friday PTO request.',
      }),
    });

    const created = await createRes.json();

    const decisionRes = await app.request(
      `/api/v1/approvals/${created.result.id}/decision`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'approved',
          approver: 'teamlead@example.com',
          reason: 'Approved by manager',
        }),
      },
    );

    expect(decisionRes.status).toBe(200);
    const decisionData = await decisionRes.json();

    expect(decisionData.success).toBe(true);
    expect(decisionData.result.status).toBe('approved');
    expect(decisionData.result.canContinue).toBe(true);
    expect(decisionData.result.continuationStatus).toBe('dispatched');
    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/webhook/approval-decision'),
        data: expect.objectContaining({
          event: 'approval.decision',
          decision: 'approved',
        }),
      }),
    );
  });

  it('does not allow a resolved approval to be changed or dispatched twice', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { status: 'success', messageId: 'approval-email-3' },
    });

    const createRes = await app.request('/api/v1/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId: 'wf-approval-4',
        type: 'purchase',
        requester: 'buyer@example.com',
        approver: 'ops@example.com',
        subject: 'Purchase approval required',
        body: 'Review the purchase request.',
      }),
    });
    const created = await createRes.json();
    const decisionPath = `/api/v1/approvals/${created.result.id}/decision`;
    const decisionRequest = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'approved', approver: 'ops@example.com' }),
    };

    const first = await app.request(decisionPath, decisionRequest);
    const duplicate = await app.request(decisionPath, decisionRequest);
    const changed = await app.request(decisionPath, {
      ...decisionRequest,
      body: JSON.stringify({ decision: 'rejected', approver: 'ops@example.com' }),
    });

    expect(first.status).toBe(200);
    expect(duplicate.status).toBe(200);
    expect(changed.status).toBe(409);
    expect(axios.request).toHaveBeenCalledTimes(2);
  });

  it('allows retrying a decision when the n8n continuation webhook fails', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { status: 'success', messageId: 'approval-email-4' },
    });

    const createRes = await app.request('/api/v1/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId: 'wf-approval-5',
        requester: 'requester@example.com',
        approver: 'manager@example.com',
        subject: 'Approval required',
        body: 'Review request.',
      }),
    });
    const created = await createRes.json();
    vi.mocked(axios.request).mockRejectedValueOnce(new Error('n8n unavailable'));

    const decisionUrl = `/api/v1/approvals/${created.result.id}/decision`;
    const payload = {
      decision: 'approved',
      approver: 'manager@example.com',
    };
    const failed = await app.request(decisionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const retry = await app.request(decisionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(failed.status).toBe(502);
    expect(retry.status).toBe(200);
    const result = await retry.json();
    expect(result.result.status).toBe('approved');
    expect(result.result.continuationStatus).toBe('dispatched');
  });

  it('GET /api/v1/approvals/:id - returns the approval record from state tracking', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        status: 'success',
        messageId: 'approval-email-2',
      },
    });

    const createRes = await app.request('/api/v1/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId: 'wf-approval-3',
        type: 'purchase',
        requester: 'carol@example.com',
        approver: 'ops@example.com',
        subject: 'Purchase approval required',
        body: 'Please review the $500 vendor request.',
      }),
    });

    const created = await createRes.json();

    const res = await app.request(`/api/v1/approvals/${created.result.id}`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.result.status).toBe('pending');
    expect(data.result.workflowId).toBe('wf-approval-3');
  });
});
