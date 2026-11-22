import { z } from '@hono/zod-openapi';

export const createAiDecisionRequestSchema = z
  .object({
    request: z.string().trim().min(1).max(8000).openapi({
      example: 'Review a purchase request for 25 laptops.',
      description: 'Business request to classify; maximum 8,000 characters.',
    }),
    context: z.string().trim().max(2000).optional().openapi({
      example: 'Purchases over $10,000 require manager approval.',
      description:
        'Optional business policy context; maximum 2,000 characters.',
    }),
    workflowId: z.string().trim().min(1).max(100).optional().openapi({
      example: 'purchase-review',
      description: 'Process identifier included in the n8n event.',
    }),
  })
  .openapi('CreateAiDecisionRequest');

export type CreateAiDecisionRequest = z.infer<
  typeof createAiDecisionRequestSchema
>;
