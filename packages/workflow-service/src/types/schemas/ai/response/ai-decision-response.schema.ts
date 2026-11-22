import { z } from '@hono/zod-openapi';

export const aiDecisionResultSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  recommendation: z.enum(['approve', 'reject', 'needs_review']),
  riskLevel: z.enum(['low', 'medium', 'high']),
  summary: z.string(),
  rationale: z.string(),
  humanReviewRequired: z.literal(true),
  dispatchStatus: z.enum(['dispatched', 'failed']),
  createdAt: z.string(),
});

export const aiDecisionResponseSchema = z.object({
  success: z.boolean(),
  result: aiDecisionResultSchema,
});
