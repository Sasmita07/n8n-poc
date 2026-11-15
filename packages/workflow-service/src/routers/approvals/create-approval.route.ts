import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { createApprovalUsecase } from '../../usecases/approvals/create-approval/create-approval.usecase';
import { createApprovalRequestSchema } from '../../types/schemas/approvals/request/create-approval-request.schema';
import { createApprovalResponseSchema } from '../../types/schemas/approvals/response/create-approval-response.schema';
import { ApprovalError } from '../../usecases/approvals/approval-error';

export const createApprovalRoute = new OpenAPIHono();

const route = createRoute({
  method: 'post',
  path: '/api/v1/approvals',
  tags: ['Approvals'],
  summary: 'Create a human approval request',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createApprovalRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: createApprovalResponseSchema,
        },
      },
      description: 'Approval request created successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Approval request creation error',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Invalid approval request',
    },
    502: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'n8n approval workflow or email service unavailable',
    },
  },
});

createApprovalRoute.openapi(route, async (c) => {
  try {
    const payload = c.req.valid('json') || {};
    const result = await createApprovalUsecase(payload);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Approval create error:', error.message);
    const status =
      error instanceof ApprovalError &&
      (error.statusCode === 400 || error.statusCode === 502)
        ? error.statusCode
        : 500;
    return c.json({ success: false, error: error.message }, status);
  }
});
