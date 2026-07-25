import { OpenAPIHono } from '@hono/zod-openapi';
import { healthRoute } from './health.route';

export const healthRouter = new OpenAPIHono();

healthRouter.route('/', healthRoute);
