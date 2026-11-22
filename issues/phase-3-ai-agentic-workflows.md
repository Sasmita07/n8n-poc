# Issue: Phase 3 – AI & Agentic Workflows

## Summary

Add server-side AI-assisted triage to the existing n8n orchestration and Phase 2 approval flow. The AI recommendation is advisory only; human approval remains the gate for business actions.

## Status

✅ **POC COMPLETE** — The dashboard can request a structured AI recommendation, dispatch it to an n8n webhook, retry a failed handoff without repeating the model call, and create a Phase 2 approval request for human review.

## Goals

- ✅ Call a configured OpenAI-compatible chat-completions API from the workflow service
- ✅ Validate AI output into a constrained recommendation and risk-level contract
- ✅ Dispatch `ai.decision` events to n8n for advisory routing and review preparation only
- ✅ Connect the AI recommendation to the existing email-backed human approval flow
- ✅ Keep provider credentials on the server and prevent AI recommendations from authorizing actions
- ⏭️ Add Anthropic-native adapters, multi-agent routing, durable history, and direct AI-node templates in later work. OpenAI-compatible local endpoints may be configured if they support the adapter's request format.

## Acceptance Criteria

- `POST /api/v1/ai/decisions` calls the configured provider and returns a validated recommendation
- The service emits an `ai.decision` event to the configured n8n webhook; n8n can branch on `recommendation` and `riskLevel`
- The dashboard can create a Phase 2 approval from the recommendation; all results set `humanReviewRequired: true`
- Failed n8n delivery can be retried without another model call; successful events are not dispatched twice
- AI credentials are never sent to or stored in the browser
- AI decision state is tracked in memory without persisting the original request in the AI-decision record
- OpenAPI schemas describe the new endpoints and are served through the existing Swagger UI

## Notes

Set `AI_API_URL`, `AI_API_KEY`, and `AI_MODEL` on the workflow-service server, and create an active n8n `POST` Webhook at `N8N_AI_DECISION_WEBHOOK_PATH` (default `ai-decision`). See [Phase 3 setup](../docs/setup/workflow-setup-api.md#phase-3-ai-decision-integration).

This POC calls an OpenAI-compatible chat-completions endpoint from the server-side orchestration path, then sends its validated result to a separate n8n execution. It does not execute an n8n AI Agent node or include a provider-specific native Anthropic adapter; a local server can be used if it supports the request format, including JSON response format. n8n can branch on the event for advisory routing and review preparation only. Business-changing HTTP/database actions must remain behind the Phase 2 human decision workflow. When an AI result is turned into an approval, the request and recommendation are copied into the approval body and exposed by the unauthenticated states endpoint. Provider quota/rate limits may require a separately billed API account; API usage is independent of a ChatGPT subscription. The workflow service does not add a database, which remains Phase 4 scope.

Treat request text and model output as untrusted. Do not send secrets or unnecessary personal data. The implementation limits input/output sizes, validates the model response, avoids logging request content, and marks all results as advisory. The repository POC still lacks authentication/authorization and durable storage; do not expose the API publicly or use it for sensitive decisions.
