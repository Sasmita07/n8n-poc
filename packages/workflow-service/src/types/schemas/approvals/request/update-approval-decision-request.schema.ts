import { z } from '@hono/zod-openapi';

export const updateApprovalDecisionRequestSchema = z
  .object({
    decision: z.enum(['approved', 'rejected']).openapi({
      example: 'approved',
      description: 'Approval decision made by the human reviewer',
    }),
    approver: z.email().optional().openapi({
      example: 'manager@example.com',
      description: 'Reviewer who made the decision',
    }),
    reason: z.string().optional().openapi({
      example: 'Approved by manager',
      description: 'Optional note about the approval decision',
    }),
  })
  .openapi('UpdateApprovalDecisionRequest');

export type UpdateApprovalDecisionRequestSchema = z.infer<
  typeof updateApprovalDecisionRequestSchema
>;
