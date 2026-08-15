import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { listWorkflowsUsecase } from '../../usecases/workflow/list-workflows/list-workflows.usecase';
import { listWorkflowsResponseSchema } from '../../types/schemas/workflow/response/list-workflows-response.schema';

export const listWorkflowsRoute = new OpenAPIHono();

const route = createRoute({
  method: 'get',
  path: '/api/v1/workflows',
  tags: ['Workflows'],
  summary: 'List all workflows from n8n',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: listWorkflowsResponseSchema,
        },
      },
      description: 'List of workflows retrieved',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Workflows fetch error',
    },
  },
});

listWorkflowsRoute.openapi(route, async (c) => {
  try {
    const result = await listWorkflowsUsecase();
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Workflows fetch error:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});
