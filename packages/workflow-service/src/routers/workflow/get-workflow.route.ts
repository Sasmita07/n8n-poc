import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getWorkflowUsecase } from '../../usecases/workflow/get-workflow/get-workflow.usecase';
import { getWorkflowResponseSchema } from '../../types/schemas/workflow/response/get-workflow-response.schema';

export const getWorkflowRoute = new OpenAPIHono();

const route = createRoute({
  method: 'get',
  path: '/api/v1/workflows/{workflowId}',
  tags: ['Workflows'],
  summary: 'Get details of a specific workflow by ID',
  request: {
    params: z.object({
      workflowId: z.string().openapi({ example: 'wf-12345', description: 'n8n Workflow ID' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getWorkflowResponseSchema,
        },
      },
      description: 'Workflow details retrieved successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Workflow fetch error',
    },
  },
});

getWorkflowRoute.openapi(route, async (c) => {
  const { workflowId } = c.req.valid('param');
  try {
    const result = await getWorkflowUsecase(workflowId);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Workflow fetch error:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});
