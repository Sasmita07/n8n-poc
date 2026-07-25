import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { triggerWebhookUsecase } from '../../usecases/webhook/trigger-webhook/trigger-webhook.usecase';
import { triggerWebhookResponseSchema } from '../../types/schemas/webhook/response/trigger-webhook-response.schema';

export const triggerWebhookRoute = new OpenAPIHono();

const getRoute = createRoute({
  method: 'get',
  path: '/webhook/{path}',
  tags: ['Webhooks'],
  summary: 'Receive incoming webhook event via GET and forward to n8n',
  request: {
    params: z.object({
      path: z.string().openapi({ example: 'my-automation', description: 'Webhook route path' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: triggerWebhookResponseSchema,
        },
      },
      description: 'Webhook processed and forwarded to n8n',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Error triggering n8n webhook',
    },
  },
});

const postRoute = createRoute({
  method: 'post',
  path: '/webhook/{path}',
  tags: ['Webhooks'],
  summary: 'Receive incoming webhook event via POST and forward to n8n',
  request: {
    params: z.object({
      path: z.string().openapi({ example: 'my-automation', description: 'Webhook route path' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: triggerWebhookResponseSchema,
        },
      },
      description: 'Webhook processed and forwarded to n8n',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Error triggering n8n webhook',
    },
  },
});

const handleTriggerWebhook = async (c: any) => {
  const { path } = c.req.valid('param');
  const method = c.req.method.toUpperCase();
  const body = method !== 'GET' ? await c.req.json().catch(() => null) : null;
  try {
    const result = await triggerWebhookUsecase(path, method, body);
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
};

triggerWebhookRoute.openapi(getRoute, handleTriggerWebhook);
triggerWebhookRoute.openapi(postRoute, handleTriggerWebhook);
