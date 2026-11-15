# API Reference & Endpoints

The Gateway exposes RESTful endpoints (`/api/v1/`) for controlling workflows, inspecting states, and forwarding incoming webhooks. Interactive Swagger UI is available at `http://localhost:3000/docs`.

## Endpoints Summary

| Method   | Endpoint                         | Description                                       |
| -------- | -------------------------------- | ------------------------------------------------- |
| GET      | `/health`                        | Application health check                          |
| GET      | `/docs`                          | Interactive Swagger UI Documentation              |
| GET      | `/doc`                           | OpenAPI 3.0 JSON Specification                    |
| GET      | `/api/v1/logs`                   | Retrieve execution logs                           |
| GET      | `/api/v1/states`                 | Retrieve workflow, webhook, and approval states   |
| GET      | `/api/v1/states/:type/:id`       | Get specific workflow, webhook, or approval state |
| POST     | `/api/v1/workflows`              | Create a new workflow                             |
| POST     | `/api/v1/workflows/:id/activate` | Trigger / Activate workflow                       |
| GET      | `/api/v1/workflows`              | List workflows                                    |
| GET      | `/api/v1/workflows/:id`          | Retrieve workflow details                         |
| POST     | `/api/v1/approvals`              | Create a pending human approval request           |
| GET      | `/api/v1/approvals/:id`          | Retrieve approval state                           |
| POST     | `/api/v1/approvals/:id/decision` | Record an approved or rejected decision           |
| GET/POST | `/webhook/:path`                 | Dynamic webhook endpoint                          |

---

## Interactive Documentation

Run `workflow-service` (`npm run dev`) and visit:

- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI Spec**: `http://localhost:3000/doc`

## Human Approval Flow

Create an approval request with the process reference, requester, approver, subject, and body. The service stores the request, triggers the configured n8n request webhook, and sends the approver an email. The response includes an approval ID with `status: pending` and `canContinue: false`.

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

Submit the reviewer's decision using `approved` or `rejected`. The assigned approver email must match the request. A decision is terminal once dispatched; duplicate submissions of the same dispatched decision are idempotent, while changing a resolved decision returns `409`. Only an approved request returns `canContinue: true`. The service sends a decision event to the configured n8n continuation webhook. If that handoff fails, the decision remains recorded with `continuationStatus: failed`; repeat the same decision to retry the handoff.

```json
{
  "decision": "approved",
  "approver": "manager@example.com",
  "reason": "Approved by manager"
}
```

### n8n Event Contract

Configure active n8n webhook workflows for `N8N_APPROVAL_REQUEST_WEBHOOK_PATH` and `N8N_APPROVAL_DECISION_WEBHOOK_PATH` (defaults: `approval-request` and `approval-decision`). The request event has `event: "approval.requested"` and the approval ID/request details. The decision event has `event: "approval.decision"`, the same approval ID, decision, approver, and optional reason. Use the decision event to branch to approved business actions or rejection handling. Use `approvalId` as an idempotency key for external side effects.

These are separate n8n executions, not a suspended execution that resumes. Approval state is in-memory in this POC. The API does not authenticate the approver; matching an email field alone does not establish identity.
