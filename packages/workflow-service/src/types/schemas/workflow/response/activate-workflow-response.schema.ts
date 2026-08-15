import { z } from '@hono/zod-openapi';

export const activateWorkflowResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Workflow triggered and activated' }),
    result: z.record(z.string(), z.any()).openapi({ description: 'Activation result from n8n' }),
  })
  .openapi('ActivateWorkflowResponse');

export type ActivateWorkflowResponseSchema = z.infer<typeof activateWorkflowResponseSchema>;
