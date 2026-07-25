import { z } from '@hono/zod-openapi';

export const createWorkflowResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Workflow created' }),
    result: z.record(z.string(), z.any()).openapi({ description: 'Created workflow object' }),
  })
  .openapi('CreateWorkflowResponse');

export type CreateWorkflowResponseSchema = z.infer<typeof createWorkflowResponseSchema>;
