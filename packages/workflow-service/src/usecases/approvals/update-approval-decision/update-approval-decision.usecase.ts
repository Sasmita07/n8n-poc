import {
  getState,
  setState,
} from '../../../gateways/db/automation-store.adapter';
import { triggerN8nWebhook } from '../../../gateways/external/n8n-client.adapter';
import { envConfig } from '../../../config/env.config';
import type { UpdateApprovalDecisionRequestDto } from '../../../types/dto/request/update-approval-decision-request.dto';
import { ApprovalError } from '../approval-error';

function toApprovalResult(approvalId: string, state: ReturnType<typeof getState>) {
  return {
    id: approvalId,
    workflowId: state.workflowId ?? '',
    type: state.type ?? 'general',
    requester: state.requester ?? '',
    approver: state.approver ?? '',
    subject: state.subject ?? '',
    body: state.body ?? '',
    status: state.status,
    canContinue: state.canContinue ?? false,
    reason: state.reason,
    decision: state.decision,
    continuationStatus: state.continuationStatus,
    continuationError: state.continuationError,
    decidedAt: state.decidedAt,
  };
}

export async function updateApprovalDecisionUsecase(
  approvalId: string,
  payload: UpdateApprovalDecisionRequestDto,
) {
  const stateKey = `approval:${approvalId}`;
  const current = getState(stateKey);

  if (!current || current.status === 'not_found') {
    throw new ApprovalError(`Approval ${approvalId} not found`, 404);
  }

  const decision = payload.decision.toLowerCase();
  if (decision !== 'approved' && decision !== 'rejected') {
    throw new ApprovalError('Decision must be approved or rejected', 400);
  }
  const isRetry = current.status === decision && current.continuationStatus === 'failed';

  if (current.status !== 'pending' && !isRetry) {
    if (current.status === decision && current.continuationStatus === 'dispatched') {
      return {
        success: true,
        message: 'This decision was already recorded and dispatched',
        result: toApprovalResult(approvalId, current),
      };
    }
    throw new ApprovalError('A decision can only be recorded for a pending request', 409);
  }

  if (!payload.approver || payload.approver.toLowerCase() !== current.approver?.toLowerCase()) {
    throw new ApprovalError('Decision approver does not match the assigned approver', 403);
  }

  const canContinue = decision === 'approved';
  const decidedAt = isRetry ? current.decidedAt || new Date() : new Date();

  const updated = {
    ...current,
    id: approvalId,
    workflowId: current.workflowId ?? '',
    type: current.type ?? 'general',
    requester: current.requester ?? '',
    approver: payload.approver || current.approver || '',
    subject: current.subject ?? '',
    body: current.body ?? '',
    status: decision,
    decision,
    reason: payload.reason || current.reason,
    canContinue,
    decidedAt,
    continuationStatus: 'dispatching',
    continuationError: undefined,
    updatedAt: new Date(),
  };

  setState(stateKey, updated);

  try {
    await triggerN8nWebhook(envConfig.approvalDecisionWebhookPath, 'POST', {
      event: 'approval.decision',
      approvalId,
      workflowId: updated.workflowId,
      type: updated.type,
      requester: updated.requester,
      approver: updated.approver,
      decision,
      reason: updated.reason,
      decidedAt: updated.decidedAt,
    });
  } catch (error: any) {
    const continuationError = error?.message || 'Failed to dispatch decision to n8n';
    setState(stateKey, {
      continuationStatus: 'failed',
      continuationError,
      updatedAt: new Date(),
    });
    throw new ApprovalError(
      `Decision was recorded, but workflow continuation dispatch failed: ${continuationError}`,
      502,
    );
  }

  const dispatched = setState(stateKey, {
    continuationStatus: 'dispatched',
    updatedAt: new Date(),
  });

  return {
    success: true,
    message: canContinue
      ? 'Approval recorded and continuation workflow started'
      : 'Rejection recorded and rejection workflow started',
    result: toApprovalResult(approvalId, dispatched),
  };
}
