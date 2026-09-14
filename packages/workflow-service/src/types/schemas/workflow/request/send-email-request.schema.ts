import { z } from '@hono/zod-openapi';

export const sendEmailRequestSchema = z
  .object({
    to: z.union([z.string().email(), z.array(z.string().email())]).openapi({
      example: ['user@example.com', 'admin@example.com'],
      description: 'Recipient email address(es)',
    }),
    subject: z.string().min(1).openapi({
      example: 'Workflow Notification',
      description: 'Email subject line',
    }),
    body: z.string().min(1).openapi({
      example: 'Your workflow has completed successfully.',
      description: 'Plain text email body',
    }),
    html: z.string().optional().openapi({
      example: '<p>Your <strong>workflow</strong> has completed successfully.</p>',
      description: 'Optional HTML formatted email body',
    }),
    cc: z.array(z.string().email()).optional().openapi({
      example: ['manager@example.com'],
      description: 'Carbon copy recipients',
    }),
    bcc: z.array(z.string().email()).optional().openapi({
      example: ['audit@example.com'],
      description: 'Blind carbon copy recipients',
    }),
    replyTo: z.string().email().optional().openapi({
      example: 'noreply@example.com',
      description: 'Reply-to email address',
    }),
  })
  .openapi('SendEmailRequest');

export type SendEmailRequestSchema = z.infer<typeof sendEmailRequestSchema>;
