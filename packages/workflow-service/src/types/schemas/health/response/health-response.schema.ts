import { z } from '@hono/zod-openapi';

export const healthResponseSchema = z
  .object({
    status: z.string().openapi({ example: 'healthy' }),
    timestamp: z.string().openapi({ example: '2026-07-25T22:20:00.000Z' }),
    uptime: z.number().openapi({ example: 123.45 }),
  })
  .openapi('HealthResponse');

export type HealthResponseSchema = z.infer<typeof healthResponseSchema>;
