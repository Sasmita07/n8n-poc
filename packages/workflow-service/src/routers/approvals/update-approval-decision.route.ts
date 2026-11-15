import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { updateApprovalDecisionUsecase } from '../../usecases/approvals/update-approval-decision/update-approval-decision.usecase';
import { updateApprovalDecisionRequestSchema } from '../../types/schemas/approvals/request/update-approval-decision-request.schema';
import { updateApprovalDecisionResponseSchema } from '../../types/schemas/approvals/response/update-approval-decision-response.schema';
import { ApprovalError } from '../../usecases/approvals/approval-error';

export const updateApprovalDecisionRoute = new OpenAPIHono();

const route = createRoute({
  method: 'post',
  path: '/api/v1/approvals/{approvalId}/decision',
  tags: ['Approvals'],
  summary: 'Approve or reject a pending approval request',
  request: {
    params: z.object({
      approvalId: z.string().openapi({
        example: 'approval-123',
        description: 'Approval request ID',
      }),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateApprovalDecisionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: updateApprovalDecisionResponseSchema,
        },
      },
      description: 'Approval decision recorded successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Approval decision update error',
    },
    400: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), error: z.string() }) } },
      description: 'Invalid decision',
    },
    403: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), error: z.string() }) } },
      description: 'Decision approver mismatch',
    },
    404: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), error: z.string() }) } },
      description: 'Approval request not found',
    },
    409: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), error: z.string() }) } },
      description: 'Approval has already been resolved',
    },
    502: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), error: z.string() }) } },
      description: 'Decision was recorded but could not be dispatched to n8n',
    },
  },
});

updateApprovalDecisionRoute.openapi(route, async (c) => {
  try {
    const { approvalId } = c.req.valid('param');
    const payload = c.req.valid('json') || {};
    const result = await updateApprovalDecisionUsecase(approvalId, payload);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Approval decision error:', error.message);
    const status = error instanceof ApprovalError ? error.statusCode : 500;
    return c.json({ success: false, error: error.message }, status);
  }
});
