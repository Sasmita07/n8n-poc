import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { createWorkflowUsecase } from '../../usecases/workflow/create-workflow/create-workflow.usecase';
import { createWorkflowRequestSchema } from '../../types/schemas/workflow/request/create-workflow-request.schema';
import { createWorkflowResponseSchema } from '../../types/schemas/workflow/response/create-workflow-response.schema';

export const createWorkflowRoute = new OpenAPIHono();

const route = createRoute({
  method: 'post',
  path: '/api/v1/workflows',
  tags: ['Workflows'],
  summary: 'Create a new workflow in n8n',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createWorkflowRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createWorkflowResponseSchema,
        },
      },
      description: 'Workflow created successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Server error during workflow creation',
    },
  },
});

createWorkflowRoute.openapi(route, async (c) => {
  try {
    const payload = c.req.valid('json') || {};
    const result = await createWorkflowUsecase(payload);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Workflow creation error:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});
