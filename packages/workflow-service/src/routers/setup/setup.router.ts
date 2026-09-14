import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  createEmailWorkflow,
  createWebhookWorkflow,
  createScheduledWorkflow,
} from '../../usecases/workflow/setup/setup-workflows.usecase';

export const setupRouter = new OpenAPIHono();

// Setup Email Workflow
const setupEmailRoute = createRoute({
  method: 'post',
  path: '/api/v1/setup/email-workflow',
  tags: ['Setup'],
  summary: 'Initialize email webhook workflow in n8n',
  description:
    'Creates a pre-configured email workflow in n8n that can be triggered via /webhook/send-email',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            workflowId: z.string(),
            result: z.record(z.string(), z.any()),
          }),
        },
      },
      description: 'Email workflow created successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Setup error',
    },
  },
});

setupRouter.openapi(setupEmailRoute, async (c) => {
  try {
    const result = await createEmailWorkflow();
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Setup error:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Setup Webhook Workflow
const setupWebhookRoute = createRoute({
  method: 'post',
  path: '/api/v1/setup/webhook-workflow',
  tags: ['Setup'],
  summary: 'Initialize webhook trigger workflow in n8n',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional().openapi({
              example: 'my-webhook-workflow',
              description: 'Workflow name',
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            workflowId: z.string(),
            result: z.record(z.string(), z.any()),
          }),
        },
      },
      description: 'Webhook workflow created successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Setup error',
    },
  },
});

setupRouter.openapi(setupWebhookRoute, async (c) => {
  try {
    const { name } = (c.req.valid('json') || {}) as { name?: string };
    const result = await createWebhookWorkflow(name);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Setup error:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Setup Scheduled Workflow
const setupScheduledRoute = createRoute({
  method: 'post',
  path: '/api/v1/setup/scheduled-workflow',
  tags: ['Setup'],
  summary: 'Initialize scheduled trigger workflow in n8n',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional().openapi({
              example: 'daily-report',
              description: 'Workflow name',
            }),
            intervalMinutes: z.number().optional().openapi({
              example: 15,
              description: 'Schedule interval in minutes',
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            workflowId: z.string(),
            result: z.record(z.string(), z.any()),
          }),
        },
      },
      description: 'Scheduled workflow created successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Setup error',
    },
  },
});

setupRouter.openapi(setupScheduledRoute, async (c) => {
  try {
    const { name, intervalMinutes } = (c.req.valid('json') || {}) as {
      name?: string;
      intervalMinutes?: number;
    };
    const result = await createScheduledWorkflow(name, intervalMinutes);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Setup error:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});
