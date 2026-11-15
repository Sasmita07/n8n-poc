import { z } from '@hono/zod-openapi';

export const createApprovalRequestSchema = z
  .object({
    workflowId: z.string().min(1).openapi({
      example: 'wf-approval-1',
      description:
        'Workflow or process that triggered the approval requirement',
    }),
    type: z.string().optional().openapi({
      example: 'expense',
      description: 'Approval type such as expense, leave, or purchase',
    }),
    requester: z.email().openapi({
      example: 'alice@example.com',
      description: 'Person who created the approval request',
    }),
    approver: z.email().openapi({
      example: 'manager@example.com',
      description: 'Person who must approve the request',
    }),
    subject: z.string().min(1).openapi({
      example: 'Expense approval required',
      description: 'Approval email subject',
    }),
    body: z.string().min(1).openapi({
      example: 'Please review the $250 travel request.',
      description: 'Approval request details',
    }),
  })
  .openapi('CreateApprovalRequest');

export type CreateApprovalRequestSchema = z.infer<
  typeof createApprovalRequestSchema
>;
