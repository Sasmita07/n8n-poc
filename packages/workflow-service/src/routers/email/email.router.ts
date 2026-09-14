import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { sendEmailUsecase } from '../../usecases/workflow/send-email/send-email.usecase';
import { sendEmailRequestSchema } from '../../types/schemas/workflow/request/send-email-request.schema';
import { sendEmailResponseSchema } from '../../types/schemas/workflow/response/send-email-response.schema';

export const emailRouter = new OpenAPIHono();

const sendEmailRoute = createRoute({
  method: 'post',
  path: '/api/v1/emails',
  tags: ['Emails'],
  summary: 'Send an email notification',
  request: {
    body: {
      content: {
        'application/json': {
          schema: sendEmailRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: sendEmailResponseSchema,
        },
      },
      description: 'Email sent successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Invalid email payload',
    },
    500: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean(), error: z.string() }),
        },
      },
      description: 'Email sending error',
    },
  },
});

emailRouter.openapi(sendEmailRoute, async (c) => {
  try {
    const payload = c.req.valid('json') || {};
    const result = await sendEmailUsecase(payload);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ Email sending error:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});
