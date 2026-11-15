import { z } from '@hono/zod-openapi';

export const updateApprovalDecisionResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z
      .string()
      .openapi({ example: 'Approval granted; workflow can continue' }),
    result: z.object({
      id: z.string().openapi({ example: 'approval-1234567890' }),
      workflowId: z.string().openapi({ example: 'wf-approval-1' }),
      type: z.string().optional().openapi({ example: 'expense' }),
      requester: z.email().openapi({ example: 'alice@example.com' }),
      approver: z.email().openapi({ example: 'manager@example.com' }),
      subject: z.string().openapi({ example: 'Expense approval required' }),
      body: z
        .string()
        .openapi({ example: 'Please review the $250 travel request.' }),
      status: z.string().openapi({ example: 'approved' }),
      canContinue: z.boolean().openapi({ example: true }),
      reason: z.string().optional().openapi({ example: 'Approved by manager' }),
      decision: z.string().optional().openapi({ example: 'approved' }),
      continuationStatus: z.string().optional().openapi({ example: 'dispatched' }),
      continuationError: z.string().optional(),
      decidedAt: z.union([z.string(), z.date()]).optional(),
    }),
  })
  .openapi('UpdateApprovalDecisionResponse');

export type UpdateApprovalDecisionResponseSchema = z.infer<
  typeof updateApprovalDecisionResponseSchema
>;
