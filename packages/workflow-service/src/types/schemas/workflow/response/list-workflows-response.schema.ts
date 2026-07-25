import { z } from '@hono/zod-openapi';

export const listWorkflowsResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Workflows retrieved' }),
    total: z.number().openapi({ example: 2 }),
    result: z.array(z.record(z.string(), z.any())).openapi({ description: 'Array of workflow objects' }),
  })
  .openapi('ListWorkflowsResponse');

export type ListWorkflowsResponseSchema = z.infer<typeof listWorkflowsResponseSchema>;
