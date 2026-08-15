import { serve } from '@hono/node-server';
import { app } from './app';
import { envConfig } from './config/env.config';

serve(
  {
    fetch: app.fetch,
    port: envConfig.port,
  },
  (info) => {
    console.log('=======================================');
    console.log('🚀 n8n Automation Gateway (Hono) Started');
    console.log('=======================================');
    console.log(`Server : http://localhost:${info.port}`);
    console.log(`n8n    : ${envConfig.n8nUrl}`);
    console.log(`Docs   : http://localhost:${info.port}/docs`);
    console.log(`Spec   : http://localhost:${info.port}/doc`);
    console.log('');
    console.log('Available RESTful Endpoints (v1)');
    console.log('---------------------------------------');
    console.log('GET/POST /webhook/:path');
    console.log('         Receive event & forward to n8n');
    console.log('');
    console.log('POST     /api/v1/workflows');
    console.log('         Create workflow in n8n');
    console.log('');
    console.log('POST     /api/v1/workflows/:workflowId/activate');
    console.log('         Activate workflow');
    console.log('');
    console.log('GET      /api/v1/workflows');
    console.log('         List workflows');
    console.log('');
    console.log('GET      /api/v1/workflows/:workflowId');
    console.log('         Workflow details');
    console.log('');
    console.log('GET      /api/v1/states');
    console.log('         All execution states');
    console.log('');
    console.log('GET      /api/v1/states/:type/:id');
    console.log('         Specific execution status');
    console.log('');
    console.log('GET      /api/v1/logs');
    console.log('         Execution logs');
    console.log('');
    console.log('GET      /health');
    console.log('         Health check');
    console.log('=======================================');
  }
);
