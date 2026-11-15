import { z } from '@hono/zod-openapi';

export const createApprovalResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z
      .string()
      .openapi({ example: 'Approval request created and sent for review' }),
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
      status: z.string().openapi({ example: 'pending' }),
      createdAt: z.string().openapi({ example: '2026-09-15T00:00:00.000Z' }),
      updatedAt: z.string().openapi({ example: '2026-09-15T00:00:00.000Z' }),
      canContinue: z.boolean().openapi({ example: false }),
    }),
  })
  .openapi('CreateApprovalResponse');

export type CreateApprovalResponseSchema = z.infer<
  typeof createApprovalResponseSchema
>;
