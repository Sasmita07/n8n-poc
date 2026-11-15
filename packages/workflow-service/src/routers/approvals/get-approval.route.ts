import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { getApprovalUsecase } from '../../usecases/approvals/get-approval/get-approval.usecase';
import { getApprovalResponseSchema } from '../../types/schemas/approvals/response/get-approval-response.schema';

export const getApprovalRoute = new OpenAPIHono();

const route = createRoute({
  method: 'get',
  path: '/api/v1/approvals/{approvalId}',
  tags: ['Approvals'],
  summary: 'Get a human approval request by ID',
  request: {
    params: z.object({
      approvalId: z
        .string()
        .openapi({
          example: 'approval-123',
          description: 'Approval request ID',
        }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getApprovalResponseSchema,
        },
      },
      description: 'Approval request retrieved successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Approval fetch error',
    },
  },
});

getApprovalRoute.openapi(route, async (c) => {
  try {
    const { approvalId } = c.req.valid('param');
    const result = await getApprovalUsecase(approvalId);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Approval fetch error:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});
