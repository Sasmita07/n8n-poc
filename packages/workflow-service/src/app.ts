import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { appConfig } from './config/app.config';
import { workflowRouter } from './routers/workflow/workflow.router';
import { webhookRouter } from './routers/webhook/webhook.router';
import { statesRouter } from './routers/states/states.router';
import { logsRouter } from './routers/logs/logs.router';
import { healthRouter } from './routers/health/health.router';

export const app = new OpenAPIHono();

// Global Middlewares
app.use('*', loggerMiddleware);

// Root Service Info Route
app.get('/', (c) => {
  return c.json({
    service: appConfig.name,
    version: appConfig.version,
    status: 'running',
    timestamp: new Date().toISOString(),
    docs: '/docs',
  });
});

// Domain Routers
app.route('/', workflowRouter);
app.route('/', webhookRouter);
app.route('/', statesRouter);
app.route('/', logsRouter);
app.route('/', healthRouter);

// OpenAPI Spec Endpoint
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'n8n Workflow Service API',
    version: appConfig.version,
    description: 'RESTful Automation Gateway Service Documentation',
  },
});

// Traditional Swagger UI
app.get('/docs', swaggerUI({ url: '/doc' }));
app.get('/swagger', swaggerUI({ url: '/doc' }));

// Global Error Handler
app.onError(errorHandlerMiddleware);
