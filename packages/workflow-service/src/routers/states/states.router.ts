import { OpenAPIHono } from '@hono/zod-openapi';
import { getStatesRoute } from './get-states.route';
import { getStateByIdRoute } from './get-state-by-id.route';

export const statesRouter = new OpenAPIHono();

statesRouter.route('/', getStatesRoute);
statesRouter.route('/', getStateByIdRoute);
