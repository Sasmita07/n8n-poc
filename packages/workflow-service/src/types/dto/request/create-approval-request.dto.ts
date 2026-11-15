export interface CreateApprovalRequestDto {
  workflowId: string;
  type?: string;
  requester: string;
  approver: string;
  subject: string;
  body: string;
}
