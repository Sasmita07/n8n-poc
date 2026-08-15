import { OpenAPIHono } from '@hono/zod-openapi';
import { createWorkflowRoute } from './create-workflow.route';
import { activateWorkflowRoute } from './activate-workflow.route';
import { getWorkflowRoute } from './get-workflow.route';
import { listWorkflowsRoute } from './list-workflows.route';

export const workflowRouter = new OpenAPIHono();

workflowRouter.route('/', createWorkflowRoute);
workflowRouter.route('/', activateWorkflowRoute);
workflowRouter.route('/', getWorkflowRoute);
workflowRouter.route('/', listWorkflowsRoute);
