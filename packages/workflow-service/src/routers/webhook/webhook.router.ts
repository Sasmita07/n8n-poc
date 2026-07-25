import { OpenAPIHono } from '@hono/zod-openapi';
import { triggerWebhookRoute } from './trigger-webhook.route';

export const webhookRouter = new OpenAPIHono();

webhookRouter.route('/', triggerWebhookRoute);
