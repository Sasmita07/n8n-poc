# AI Decision API Signatures

The OpenAPI schemas for these routes are registered with the workflow service and available at `GET /doc`; Swagger UI is served at `GET /docs`.

## Create an AI-assisted recommendation

`POST /api/v1/ai/decisions`

### Request

```json
{
  "workflowId": "purchase-review",
  "request": "Review a request to purchase 25 laptops for the engineering team.",
  "context": "Purchases over $10,000 require manager approval."
}
```

- `request` is required, trimmed, and limited to 8,000 characters.
- `context` is optional and limited to 2,000 characters.
- `workflowId` is optional; the default is `ai-assisted-review`.
- The dashboard normally selects an active business workflow and includes its n8n workflow ID.

### Success response

HTTP `200`:

```json
{
  "success": true,
  "result": {
    "id": "2f897aed-5074-4a63-a261-9b49089db13b",
    "workflowId": "purchase-review",
    "recommendation": "needs_review",
    "riskLevel": "medium",
    "summary": "Purchase request requires review.",
    "rationale": "The policy context requires manager approval.",
    "humanReviewRequired": true,
    "dispatchStatus": "dispatched",
    "createdAt": "2026-11-15T12:00:00.000Z"
  }
}
```

`recommendation` is `approve`, `reject`, or `needs_review`; `riskLevel` is `low`, `medium`, or `high`. The output is advisory only. Every result requires human review, regardless of the recommendation.

`dispatchStatus` is `failed` if the provider succeeded but the n8n webhook handoff failed. The result remains available in memory for retry.

### Errors

- `400`: invalid request body
- `429`: provider rate limit or usage quota reached
- `502`: provider unavailable or returned invalid structured data
- `503`: `AI_API_KEY` is not configured

## Retry n8n handoff

`POST /api/v1/ai/decisions/{id}/retry`

This retries only the n8n webhook handoff using the already validated result. It does not call the model again. A previously dispatched event is not sent again. Decision data is held in memory and is lost when the service restarts.

## Configuration and security

Configure `AI_API_URL`, `AI_API_KEY`, `AI_MODEL`, and `N8N_AI_DECISION_WEBHOOK_PATH` on the workflow-service server. The key must never be supplied by the frontend or included in a request body. Use the `decisionId` as an idempotency key in downstream n8n HTTP/database actions. The AI-decision record does not retain the original request, but creating a Phase 2 approval from the result copies the request and recommendation into the approval body, exposed through the unauthenticated `/api/v1/states` endpoint. Use test data because authentication and durable storage are not implemented.
