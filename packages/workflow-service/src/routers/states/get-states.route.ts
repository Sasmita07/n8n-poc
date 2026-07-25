import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getStatesUsecase } from '../../usecases/states/get-states/get-states.usecase';
import { getStatesResponseSchema } from '../../types/schemas/states/response/get-states-response.schema';

export const getStatesRoute = new OpenAPIHono();

const route = createRoute({
  method: 'get',
  path: '/api/v1/states',
  tags: ['States'],
  summary: 'Get all workflow & webhook execution tracking states',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getStatesResponseSchema,
        },
      },
      description: 'Execution states retrieved successfully',
    },
  },
});

getStatesRoute.openapi(route, (c) => {
  return c.json(getStatesUsecase(), 200);
});
