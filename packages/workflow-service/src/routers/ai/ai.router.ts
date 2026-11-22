import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { AiProviderError } from '../../gateways/external/ai-provider.adapter';
import {
  AiDecisionError,
  createAiDecisionUsecase,
  retryAiDecisionDispatchUsecase,
} from '../../usecases/ai/create-ai-decision.usecase';
import { createAiDecisionRequestSchema } from '../../types/schemas/ai/request/create-ai-decision-request.schema';
import { aiDecisionResponseSchema } from '../../types/schemas/ai/response/ai-decision-response.schema';

export const aiRouter = new OpenAPIHono();

const errorSchema = z.object({ success: z.boolean(), error: z.string() });

const createDecisionRoute = createRoute({
  method: 'post',
  path: '/api/v1/ai/decisions',
  tags: ['AI Decisions'],
  summary: 'Generate an advisory AI recommendation and dispatch it to n8n',
  description:
    'Calls the configured server-side OpenAI-compatible provider, validates its structured response, and emits an ai.decision event to the configured n8n webhook. AI output never authorizes business actions; human review is always required.',
  request: {
    body: {
      content: {
        'application/json': { schema: createAiDecisionRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: aiDecisionResponseSchema } },
      description:
        'Recommendation generated; dispatchStatus reports n8n handoff.',
    },
    400: {
      content: { 'application/json': { schema: errorSchema } },
      description: 'Invalid input.',
    },
    429: {
      content: { 'application/json': { schema: errorSchema } },
      description: 'AI provider rate limit or usage quota reached.',
    },
    502: {
      content: { 'application/json': { schema: errorSchema } },
      description: 'AI provider failed.',
    },
    503: {
      content: { 'application/json': { schema: errorSchema } },
      description: 'AI provider is not configured.',
    },
  },
});

aiRouter.openapi(createDecisionRoute, async (c) => {
  try {
    const result = await createAiDecisionUsecase(c.req.valid('json'));
    return c.json({ success: true, result }, 200);
  } catch (error) {
    const statusCode =
      error instanceof AiProviderError || error instanceof AiDecisionError
        ? error.statusCode
        : 502;
    const message =
      error instanceof Error ? error.message : 'AI analysis failed';
    return c.json(
      { success: false, error: message },
      statusCode as 400 | 429 | 502 | 503,
    );
  }
});

const retryDecisionRoute = createRoute({
  method: 'post',
  path: '/api/v1/ai/decisions/{id}/retry',
  tags: ['AI Decisions'],
  summary:
    'Retry dispatching an analyzed decision to n8n without calling the AI provider again',
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: aiDecisionResponseSchema } },
      description: 'Stored recommendation and current n8n dispatch status.',
    },
    400: {
      content: { 'application/json': { schema: errorSchema } },
      description: 'Invalid decision ID.',
    },
    404: {
      content: { 'application/json': { schema: errorSchema } },
      description: 'Decision is not available in memory.',
    },
    500: {
      content: { 'application/json': { schema: errorSchema } },
      description: 'Unexpected retry error.',
    },
  },
});

aiRouter.openapi(retryDecisionRoute, async (c) => {
  try {
    const { id } = c.req.valid('param');
    const result = await retryAiDecisionDispatchUsecase(id);
    return c.json({ success: true, result }, 200);
  } catch (error) {
    const statusCode =
      error instanceof AiDecisionError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : 'AI decision retry failed';
    if (statusCode === 404) {
      return c.json({ success: false, error: message }, 404);
    }
    return c.json({ success: false, error: message }, 500);
  }
});
