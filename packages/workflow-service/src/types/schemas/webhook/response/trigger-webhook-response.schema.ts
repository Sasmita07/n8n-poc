import { z } from '@hono/zod-openapi';

export const triggerWebhookResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    webhook: z.string().openapi({ example: 'my-automation' }),
    logId: z.number().openapi({ example: 1 }),
    n8nResult: z.any().openapi({ description: 'Response payload returned from n8n webhook' }),
  })
  .openapi('TriggerWebhookResponse');

export type TriggerWebhookResponseSchema = z.infer<typeof triggerWebhookResponseSchema>;
