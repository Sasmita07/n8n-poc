import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { activateWorkflowUsecase } from '../../usecases/workflow/activate-workflow/activate-workflow.usecase';
import { activateWorkflowRequestSchema } from '../../types/schemas/workflow/request/activate-workflow-request.schema';
import { activateWorkflowResponseSchema } from '../../types/schemas/workflow/response/activate-workflow-response.schema';

export const activateWorkflowRoute = new OpenAPIHono();

const route = createRoute({
  method: 'post',
  path: '/api/v1/workflows/{workflowId}/activate',
  tags: ['Workflows'],
  summary: 'Activate a workflow in n8n',
  request: {
    params: z.object({
      workflowId: z.string().openapi({ example: 'wf-12345', description: 'n8n Workflow ID' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: activateWorkflowRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: activateWorkflowResponseSchema,
        },
      },
      description: 'Workflow activated successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Bad request (workflowId required)',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Workflow activation error',
    },
  },
});

activateWorkflowRoute.openapi(route, async (c) => {
  try {
    const { workflowId } = c.req.valid('param');
    const body = c.req.valid('json') || {};
    const dto = {
      ...body,
      workflowId,
    };
    const result = await activateWorkflowUsecase(dto);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Workflow trigger error:', error.message);
    const status = error.message === 'workflowId required' ? 400 : 500;
    return c.json({ success: false, error: error.message }, status);
  }
});
