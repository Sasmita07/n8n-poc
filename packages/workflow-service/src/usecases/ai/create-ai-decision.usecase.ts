import { randomUUID } from 'node:crypto';
import { envConfig } from '../../config/env.config';
import { getState, setState } from '../../gateways/db/automation-store.adapter';
import {
  getAiDecisionEvent,
  storeAiDecisionEvent,
  type AiDecisionEvent,
} from '../../gateways/db/ai-decision-store.adapter';
import { triggerN8nWebhook } from '../../gateways/external/n8n-client.adapter';
import { requestAiRecommendation } from '../../gateways/external/ai-provider.adapter';

export class AiDecisionError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AiDecisionError';
  }
}

async function dispatchDecision(
  event: AiDecisionEvent,
): Promise<'dispatched' | 'failed'> {
  try {
    await triggerN8nWebhook(envConfig.aiDecisionWebhookPath, 'POST', event);
    setState(`ai:${event.decisionId}`, {
      dispatchStatus: 'dispatched',
      error: undefined,
    });
    return 'dispatched';
  } catch {
    setState(`ai:${event.decisionId}`, {
      dispatchStatus: 'failed',
      error: 'n8n AI decision webhook unavailable',
    });
    return 'failed';
  }
}

export async function createAiDecisionUsecase(input: {
  request: string;
  context?: string;
  workflowId?: string;
}) {
  let recommendation;
  try {
    recommendation = await requestAiRecommendation(
      input.request,
      input.context,
    );
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }
    throw new AiDecisionError('AI analysis failed', 502);
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const workflowId = input.workflowId || 'ai-assisted-review';
  const event: AiDecisionEvent = {
    event: 'ai.decision',
    decisionId: id,
    workflowId,
    ...recommendation,
    humanReviewRequired: true,
    createdAt,
  };

  storeAiDecisionEvent(event);
  setState(`ai:${id}`, {
    id,
    type: 'ai-decision',
    status: 'analyzed',
    workflowId,
    recommendation: event.recommendation,
    riskLevel: event.riskLevel,
    dispatchStatus: 'pending',
    createdAt,
  });

  const dispatchStatus = await dispatchDecision(event);
  return {
    id,
    workflowId,
    recommendation: event.recommendation,
    riskLevel: event.riskLevel,
    summary: event.summary,
    rationale: event.rationale,
    humanReviewRequired: true as const,
    dispatchStatus,
    createdAt,
  };
}

export async function retryAiDecisionDispatchUsecase(id: string) {
  const event = getAiDecisionEvent(id);
  if (!event) {
    throw new AiDecisionError(
      'AI decision not found or no longer available',
      404,
    );
  }

  const currentState = getState(`ai:${id}`);
  const dispatchStatus =
    currentState.dispatchStatus === 'dispatched'
      ? 'dispatched'
      : await dispatchDecision(event);
  return {
    id,
    workflowId: event.workflowId,
    recommendation: event.recommendation,
    riskLevel: event.riskLevel,
    summary: event.summary,
    rationale: event.rationale,
    humanReviewRequired: true as const,
    dispatchStatus,
    createdAt: event.createdAt,
  };
}
