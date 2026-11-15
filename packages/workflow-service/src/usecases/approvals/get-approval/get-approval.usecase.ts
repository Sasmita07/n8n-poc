import { getState } from '../../../gateways/db/automation-store.adapter';

export function getApprovalUsecase(approvalId: string) {
  const state = getState(`approval:${approvalId}`);

  if (!state || state.status === 'not_found') {
    throw new Error(`Approval ${approvalId} not found`);
  }

  return {
    success: true,
    result: {
      id: approvalId,
      workflowId: state.workflowId ?? '',
      type: state.type ?? 'general',
      requester: state.requester ?? '',
      approver: state.approver ?? '',
      subject: state.subject ?? '',
      body: state.body ?? '',
      status: state.status || 'pending',
      canContinue: state.canContinue ?? false,
      reason: state.reason,
      decision: state.decision,
      workflowStatus: state.workflowStatus,
      notificationStatus: state.notificationStatus,
      continuationStatus: state.continuationStatus,
      continuationError: state.continuationError,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
      decidedAt: state.decidedAt,
    },
  };
}
