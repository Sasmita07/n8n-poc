export interface StateModel {
  id?: string;
  status: string;
  logId?: number;
  error?: string;
  updatedAt?: Date | string;
  workflowId?: string;
  type?: string;
  requester?: string;
  approver?: string;
  subject?: string;
  body?: string;
  reason?: string;
  canContinue?: boolean;
  createdAt?: Date | string;
  decidedAt?: Date | string;
  decision?: string;
  workflowStatus?: string;
  notificationStatus?: string;
  continuationStatus?: string;
  continuationError?: string;
}

export type WorkflowStateModel = StateModel;
