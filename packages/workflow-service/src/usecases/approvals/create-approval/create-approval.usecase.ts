import { randomUUID } from 'node:crypto';
import { setState } from '../../../gateways/db/automation-store.adapter';
import { sendEmailViaWorkflow } from '../../../gateways/external/email.adapter';
import { triggerN8nWebhook } from '../../../gateways/external/n8n-client.adapter';
import { envConfig } from '../../../config/env.config';
import type { CreateApprovalRequestDto } from '../../../types/dto/request/create-approval-request.dto';
import { ApprovalError } from '../approval-error';

export async function createApprovalUsecase(payload: CreateApprovalRequestDto) {
  const approvalId = `approval-${randomUUID()}`;

  if (!payload.approver || !payload.approver.trim()) {
    throw new Error('Approval recipient is required');
  }

  if (!payload.subject || !payload.subject.trim()) {
    throw new Error('Approval subject is required');
  }

  if (!payload.body || !payload.body.trim()) {
    throw new Error('Approval body is required');
  }

  const approval = {
    id: approvalId,
    workflowId: payload.workflowId,
    aiDecisionId: payload.aiDecisionId,
    type: payload.type ?? 'general',
    requester: payload.requester,
    approver: payload.approver,
    subject: payload.subject,
    body: payload.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    canContinue: false,
    workflowStatus: 'starting',
    notificationStatus: 'pending',
    continuationStatus: 'not_started',
  };

  const stateKey = `approval:${approvalId}`;
  setState(stateKey, {
    ...approval,
    updatedAt: new Date(),
  });

  try {
    await triggerN8nWebhook(envConfig.approvalRequestWebhookPath, 'POST', {
      event: 'approval.requested',
      approvalId,
      workflowId: approval.workflowId,
      aiDecisionId: approval.aiDecisionId,
      type: approval.type,
      requester: approval.requester,
      approver: approval.approver,
      subject: approval.subject,
      body: approval.body,
      createdAt: approval.createdAt,
    });

    setState(stateKey, {
      workflowStatus: 'started',
      updatedAt: new Date(),
    });

    await sendEmailViaWorkflow({
      to: payload.approver,
      subject: payload.subject,
      body: `${payload.body}\n\nApproval request ID: ${approvalId}`,
    });

    setState(stateKey, {
      notificationStatus: 'sent',
      updatedAt: new Date(),
    });
    approval.workflowStatus = 'started';
    approval.notificationStatus = 'sent';
    approval.updatedAt = new Date().toISOString();
  } catch (error: any) {
    setState(stateKey, {
      status: 'failed',
      workflowStatus: 'failed',
      notificationStatus: 'failed',
      error: error?.message || 'Failed to start approval workflow',
      updatedAt: new Date(),
    });
    throw new ApprovalError(
      `Approval request could not be started: ${error?.message || 'n8n integration failed'}`,
      502,
    );
  }

  return {
    success: true,
    message: 'Approval request started and sent for review',
    result: approval,
  };
}
