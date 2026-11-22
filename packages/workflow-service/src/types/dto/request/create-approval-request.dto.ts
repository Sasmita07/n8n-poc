export interface CreateApprovalRequestDto {
  workflowId: string;
  aiDecisionId?: string;
  type?: string;
  requester: string;
  approver: string;
  subject: string;
  body: string;
}
