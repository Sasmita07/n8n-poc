import { z } from '@hono/zod-openapi';

export const sendEmailResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Email sent successfully' }),
    result: z.record(z.string(), z.any()).openapi({ description: 'n8n webhook response data' }),
  })
  .openapi('SendEmailResponse');

export type SendEmailResponseSchema = z.infer<typeof sendEmailResponseSchema>;
