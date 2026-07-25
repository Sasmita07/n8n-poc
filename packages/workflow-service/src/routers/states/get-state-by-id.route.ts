import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getStateByIdUsecase } from '../../usecases/states/get-state-by-id/get-state-by-id.usecase';
import { getStateByIdResponseSchema } from '../../types/schemas/states/response/get-state-by-id-response.schema';

export const getStateByIdRoute = new OpenAPIHono();

const route = createRoute({
  method: 'get',
  path: '/api/v1/states/{type}/{id}',
  tags: ['States'],
  summary: 'Get execution state of a specific resource by type and ID',
  request: {
    params: z.object({
      type: z.string().openapi({ example: 'workflow', description: 'Resource type (e.g. workflow or webhook)' }),
      id: z.string().openapi({ example: '12345', description: 'Resource ID or path' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getStateByIdResponseSchema,
        },
      },
      description: 'Resource status retrieved successfully',
    },
  },
});

getStateByIdRoute.openapi(route, (c) => {
  const { type, id } = c.req.valid('param');
  const result = getStateByIdUsecase(type, id);
  return c.json(result, 200);
});
