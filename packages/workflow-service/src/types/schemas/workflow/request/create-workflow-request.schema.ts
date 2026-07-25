import { z } from '@hono/zod-openapi';

export const createWorkflowRequestSchema = z
  .object({
    name: z.string().openapi({
      example: 'Scheduled Webhook Caller Workflow',
      description: 'Name of the n8n automation workflow',
    }),
    nodes: z
      .array(
        z.object({
          id: z.string().optional().openapi({ example: 'http-node-1' }),
          name: z.string().openapi({ example: 'Call Webhook' }),
          type: z.string().openapi({ example: 'n8n-nodes-base.httpRequest' }),
          typeVersion: z.number().openapi({ example: 4 }),
          position: z.array(z.number()).openapi({ example: [480, 300] }),
          parameters: z.record(z.string(), z.any()).openapi({
            description: 'Node configuration parameters',
          }),
          webhookId: z.string().optional(),
        })
      )
      .openapi({
        description: 'Array of n8n node definitions comprising the workflow pipeline',
      }),
    connections: z.record(z.string(), z.any()).openapi({
      description: 'Node interconnection graph definitions',
    }),
    settings: z.record(z.string(), z.any()).optional().openapi({
      description: 'Workflow execution settings',
    }),
  })
  .openapi('CreateWorkflowRequest', {
    example: {
      name: 'Scheduled Webhook Caller Workflow',
      nodes: [
        {
          id: 'c1a2b3c4-d5e6-4789-9a0b-111111111111',
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            rule: {
              interval: [
                {
                  field: 'minutes',
                  minutesInterval: 15,
                },
              ],
            },
          },
        },
        {
          id: 'd2e3f4a5-b6c7-4890-8b1c-222222222222',
          name: 'Call External Webhook',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [480, 300],
          parameters: {
            method: 'POST',
            url: 'http://localhost:3000/webhook/automation',
            sendBody: true,
            specifyBody: 'json',
            jsonBody: '={\n  "event": "scheduled_trigger",\n  "source": "n8n_cron",\n  "timestamp": "{{ $now.toISOString() }}"\n}',
            options: {},
          },
        },
      ],
      connections: {
        'Schedule Trigger': {
          main: [
            [
              {
                node: 'Call External Webhook',
                type: 'main',
                index: 0,
              },
            ],
          ],
        },
      },
      settings: {
        executionOrder: 'v1',
      },
    },
  });

export type CreateWorkflowRequestSchema = z.infer<typeof createWorkflowRequestSchema>;
