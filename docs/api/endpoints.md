# API Reference & Endpoints

The Gateway exposes RESTful endpoints (`/api/v1/`) for controlling workflows, inspecting states, and forwarding incoming webhooks. Interactive Swagger UI is available at `http://localhost:3000/docs`.

## Endpoints Summary

| Method   | Endpoint                           | Description                                                        |
| -------- | ---------------------------------- | ------------------------------------------------------------------ |
| GET      | `/health`                          | Application health check                                           |
| GET      | `/docs`                            | Interactive Swagger UI Documentation                               |
| GET      | `/doc`                             | OpenAPI 3.0 JSON Specification                                     |
| GET      | `/api/v1/logs`                     | Retrieve up to 100 recent n8n executions (summary data)            |
| GET      | `/api/v1/states`                   | Retrieve gateway's in-memory workflow, webhook, and approval state |
| GET      | `/api/v1/states/:type/:id`         | Get specific gateway state                                         |
| POST     | `/api/v1/workflows`                | Create a new workflow                                              |
| POST     | `/api/v1/workflows/:id/activate`   | Activate a workflow; does not execute it immediately               |
| GET      | `/api/v1/workflows`                | List workflows                                                     |
| GET      | `/api/v1/workflows/:id`            | Retrieve workflow details                                          |
| POST     | `/api/v1/setup/email-workflow`     | Create or reuse and activate the `send-email` integration workflow |
| POST     | `/api/v1/setup/webhook-workflow`   | Create and activate a generic POST webhook workflow                |
| POST     | `/api/v1/setup/scheduled-workflow` | Create and activate a scheduled workflow                           |
| POST     | `/api/v1/approvals`                | Create a pending human approval request                            |
| GET      | `/api/v1/approvals/:id`            | Retrieve approval state                                            |
| POST     | `/api/v1/approvals/:id/decision`   | Record an approved or rejected decision                            |
| POST     | `/api/v1/ai/decisions`             | Generate an advisory AI recommendation and dispatch it to n8n      |
| POST     | `/api/v1/ai/decisions/:id/retry`   | Retry a failed n8n AI decision handoff without another model call  |
| GET/POST | `/webhook/:path`                   | Dynamic webhook endpoint                                           |

There is no dedicated approval-list route in this POC. The dashboard builds the Approvals inbox by reading `/api/v1/states` and filtering keys with the `approval:` prefix.

---

## Interactive Documentation

Run `workflow-service` (`npm run dev`) and visit:

- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI Spec**: `http://localhost:3000/doc`

## Human Approval Flow

Create an approval request with a workflow/process reference, requester, approver, subject, and body. The dashboard's **Create linked approval** action opens the approval form with the selected workflow ID preselected. Submitting the form stores that ID as correlation metadata, triggers the configured n8n request webhook, and sends the approver an email. Multiple approvals may reference the same workflow. The response includes an approval ID with `status: pending` and `canContinue: false`.

**Linking is not execution gating:** the selected business workflow is not modified, paused, resumed, or automatically started by this operation. The decision webhook starts a separate n8n execution. Configure that decision workflow to route the event and run any desired business action. The notification email contains request details and an ID; approval/rejection is performed in the dashboard, not through an email action link.

```json
{
  "workflowId": "wf-approval-1",
  "type": "expense",
  "requester": "alice@example.com",
  "approver": "manager@example.com",
  "subject": "Expense approval required",
  "body": "Please review the travel request."
}
```

Submit the reviewer's decision using `approved` or `rejected`. The assigned approver email must match the request, but this POC does not authenticate the reviewer; matching a string is not proof of identity. A decision is terminal once dispatched; duplicate submissions of the same dispatched decision are idempotent, while changing a resolved decision returns `409`. Only an approved request returns `canContinue: true`. This flag is a state indicator, not proof that the linked business workflow ran. The service sends a decision event to the configured n8n decision webhook. If that handoff fails, the decision remains recorded with `continuationStatus: failed`; repeat the same decision to retry the handoff.

If the request webhook accepts the event but the subsequent email delivery fails, the approval is marked failed and the create request returns an error. This POC does not provide a separate retry action for request/notification failures; check n8n Executions and the approval state before submitting again to avoid duplicate downstream work.

```json
{
  "decision": "approved",
  "approver": "manager@example.com",
  "reason": "Approved by manager"
}
```

### n8n Event Contract

Configure active n8n webhook workflows for `N8N_APPROVAL_REQUEST_WEBHOOK_PATH` and `N8N_APPROVAL_DECISION_WEBHOOK_PATH` (defaults: `approval-request` and `approval-decision`). The request event has `event: "approval.requested"` and the approval ID/request details. The decision event has `event: "approval.decision"`, the same approval ID, decision, approver, and optional reason. Use the decision event to branch to approved business actions or rejection handling. Use `approvalId` as an idempotency key for external side effects.

These are separate n8n executions, not a suspended execution that resumes. Approval state is in-memory and is lost when the workflow service restarts. The service has no API authentication, and matching an email field alone does not establish approver identity. The email does not contain a decision link; use the dashboard to decide.

The approval state includes the request body. It is returned by the unauthenticated `/api/v1/states` endpoint, so do not include sensitive data or expose this POC publicly.

## AI-assisted decision flow

Configure the provider on the server using `AI_API_URL`, `AI_API_KEY`, and `AI_MODEL`, and create an active n8n webhook at `N8N_AI_DECISION_WEBHOOK_PATH` (default `ai-decision`). The API key is never accepted from the browser. The service validates structured model output, sends an `ai.decision` event to n8n, and reports whether the handoff was dispatched. The AI-decision record does not store the original prompt; however, creating an approval from the AI result copies the request and recommendation into the approval body, which is exposed through `/api/v1/states`.

```http
POST /api/v1/ai/decisions
Content-Type: application/json
```

```json
{
  "workflowId": "purchase-review",
  "request": "Review a request to purchase 25 laptops for the engineering team.",
  "context": "Purchases over $10,000 require manager approval."
}
```

The result contains `recommendation` (`approve`, `reject`, or `needs_review`), `riskLevel` (`low`, `medium`, or `high`), a summary and rationale, and `humanReviewRequired: true`. `dispatchStatus` is `dispatched` or `failed`. A failed n8n handoff can be retried with `POST /api/v1/ai/decisions/:id/retry`; the model is not called again, and an already-dispatched event is not sent twice. A provider quota/rate-limit response is returned as HTTP `429`; provider credentials, billing, and usage limits are configured separately from a ChatGPT subscription. Decision events are available only in memory and are lost on service restart.

Use the recommendation only to route advisory n8n branches or prepare a human review. It does not approve the Phase 2 request or authorize external side effects. Keep business-changing HTTP/database nodes behind the Phase 2 approval decision. Treat prompts and outputs as untrusted, constrain node credentials in n8n, and avoid sending secrets or unnecessary personal information. The API has no authentication in this POC.

For a complete sample case and expected checkpoints, see [End-to-End Business Flow](../architecture/end-to-end-business-flow.md).
