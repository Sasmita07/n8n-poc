import { z } from '@hono/zod-openapi';

export const getWorkflowResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Workflow details retrieved' }),
    workflowId: z.string().openapi({ example: 'wf-12345' }),
    result: z.record(z.string(), z.any()).openapi({ description: 'n8n workflow detail definition' }),
  })
  .openapi('GetWorkflowResponse');

export type GetWorkflowResponseSchema = z.infer<typeof getWorkflowResponseSchema>;
