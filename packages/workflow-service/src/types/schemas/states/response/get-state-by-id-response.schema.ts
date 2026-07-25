import { z } from '@hono/zod-openapi';

export const getStateByIdResponseSchema = z
  .object({
    type: z.string().openapi({ example: 'workflow' }),
    id: z.string().openapi({ example: '123' }),
    status: z.object({
      status: z.string().openapi({ example: 'triggered' }),
      logId: z.number().optional(),
      error: z.string().optional(),
      updatedAt: z.string().optional(),
    }),
    lastUpdate: z.string().openapi({ example: '2026-07-25T22:20:00.000Z' }),
  })
  .openapi('GetStateByIdResponse');

export type GetStateByIdResponseSchema = z.infer<typeof getStateByIdResponseSchema>;
