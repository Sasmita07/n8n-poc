export interface AiDecisionEvent {
  event: 'ai.decision';
  decisionId: string;
  workflowId: string;
  recommendation: 'approve' | 'reject' | 'needs_review';
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  rationale: string;
  humanReviewRequired: true;
  createdAt: string;
}

const aiDecisionEvents = new Map<string, AiDecisionEvent>();

export function storeAiDecisionEvent(event: AiDecisionEvent): void {
  aiDecisionEvents.set(event.decisionId, event);
}

export function getAiDecisionEvent(id: string): AiDecisionEvent | undefined {
  return aiDecisionEvents.get(id);
}

export function resetAiDecisionEvents(): void {
  aiDecisionEvents.clear();
}
