import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { healthResponseSchema } from '../../types/schemas/health/response/health-response.schema';

export const healthRoute = new OpenAPIHono();

const route = createRoute({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Service health diagnostic check',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: healthResponseSchema,
        },
      },
      description: 'Health diagnostic response',
    },
  },
});

healthRoute.openapi(route, (c) => {
  return c.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    200
  );
});
