import { z } from '@hono/zod-openapi';

export const getStatesResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    states: z.record(
      z.string(),
      z.object({
        status: z.string().openapi({ example: 'completed' }),
        logId: z.number().optional(),
        error: z.string().optional(),
        updatedAt: z.string().optional(),
      })
    ).openapi({ description: 'Map of workflow and webhook tracking states' }),
  })
  .openapi('GetStatesResponse');

export type GetStatesResponseSchema = z.infer<typeof getStatesResponseSchema>;
