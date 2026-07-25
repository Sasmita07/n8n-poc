import { z } from '@hono/zod-openapi';

export const activateWorkflowRequestSchema = z
  .object({
    data: z.record(z.string(), z.any()).optional().openapi({
      description: 'Activation data payload parameters',
      example: {
        active: true,
        versionId: 'v1.0.0',
      },
    }),
  })
  .openapi('ActivateWorkflowRequest', {
    example: {
      data: {
        active: true,
        versionId: 'v1.0.0',
      },
    },
  });

export type ActivateWorkflowRequestSchema = z.infer<typeof activateWorkflowRequestSchema>;
