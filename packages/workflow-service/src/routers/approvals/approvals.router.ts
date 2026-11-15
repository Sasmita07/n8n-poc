import { OpenAPIHono } from '@hono/zod-openapi';
import { createApprovalRoute } from './create-approval.route';
import { getApprovalRoute } from './get-approval.route';
import { updateApprovalDecisionRoute } from './update-approval-decision.route';

export const approvalsRouter = new OpenAPIHono();

approvalsRouter.route('/', createApprovalRoute);
approvalsRouter.route('/', getApprovalRoute);
approvalsRouter.route('/', updateApprovalDecisionRoute);
