# Workflow Setup via API

The setup endpoints create standard starter workflows programmatically. Approval and AI integration receivers can also be created with the generic webhook setup endpoint, but business branching/actions still need to be configured in n8n.

## API Endpoints

### Setup Email Workflow

```bash
curl -X POST http://localhost:3000/api/v1/setup/email-workflow \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "success": true,
  "message": "Email workflow created and activated",
  "workflowId": "12345",
  "result": { ... }
}
```

### Setup Webhook Workflow

```bash
curl -X POST http://localhost:3000/api/v1/setup/webhook-workflow \
  -H "Content-Type: application/json" \
  -d '{"name": "my-webhook"}'
```

**Response:**

```json
{
  "success": true,
  "message": "Webhook workflow \"my-webhook\" created and activated",
  "workflowId": "12346",
  "result": { ... }
}
```

### Setup Scheduled Workflow

```bash
curl -X POST http://localhost:3000/api/v1/setup/scheduled-workflow \
  -H "Content-Type: application/json" \
  -d '{"name": "daily-job", "intervalMinutes": 1440}'
```

**Response:**

```json
{
  "success": true,
  "message": "Scheduled workflow \"daily-job\" created and activated",
  "workflowId": "12347",
  "result": { ... }
}
```

---

## CLI Script

### Setup All Workflows (Easiest)

```bash
cd packages/workflow-service
npm run setup
# or
npm run setup all
```

This creates:

- Email workflow (`send-email`)
- Webhook workflow (`webhook-trigger`)
- Scheduled workflow (`daily-job` - runs every 24 hours)

The CLI requires the workflow service to be running. `setup` creates only these standard email/webhook/scheduled workflows; it does not create the approval or AI integration webhooks. The email setup also requires `N8N_SMTP_CREDENTIAL_ID` to reference an SMTP credential already created in n8n. To provision the full approval/AI flow, use the paths and names in the sections below.

### Setup Specific Workflows

**Email only:**

```bash
npm run setup:email
```

**Webhook only:**

```bash
npm run setup:webhook
# Creates workflow with default name "webhook-trigger-workflow"

# Or with custom name:
npx tsx scripts/setup-workflows.ts webhook my-custom-webhook
```

**Scheduled only:**

```bash
npm run setup:scheduled
# Creates workflow with default name and 15-minute interval

# Or with custom name and interval:
npx tsx scripts/setup-workflows.ts scheduled my-job 60
# (60 minutes = hourly)
```

---

## Complete Setup Workflow

### 1. Start Services

```bash
# Terminal 1: Start n8n
docker-compose up

# Terminal 2: Start application
cd packages/workflow-service
npm install
npm run dev

# Terminal 3: Start frontend
cd packages/frontend
npm run dev
```

### 2. Initialize Workflows (Run Once)

```bash
# In Terminal 2 (after workflow-service is running)
npm run setup
```

### 3. Test Email Sending

```bash
# Option A: Via Frontend Dashboard
# Go to http://localhost:5173
# Open Create Workflow and select "Send Email"
# Fill in recipient, subject, body
# Click "Send Email"

# Option B: Via API
curl -X POST http://localhost:3000/api/v1/emails \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Hello",
    "body": "This is a test"
  }'
```

## Approval Workflow Integration

Phase 2 uses two active n8n webhook workflows. Configure their paths to match the workflow-service environment variables (defaults shown):

```env
N8N_APPROVAL_REQUEST_WEBHOOK_PATH=approval-request
N8N_APPROVAL_DECISION_WEBHOOK_PATH=approval-decision
```

The dashboard's **Create linked approval** action opens the approval form with the selected active business workflow ID preselected. Submitting creates an approval record correlated to that ID; multiple requests can refer to the same workflow. This is not a runtime attachment or gate: it does not pause, resume, or start the selected workflow. The decision webhook is a separate n8n execution and must explicitly route the decision and perform any desired business action. The email is a notification only; reviewers decide in the dashboard.

With the workflow service running, create and activate simple POST receivers for the request and decision events through the setup endpoint:

```bash
curl -X POST http://localhost:3000/api/v1/setup/webhook-workflow \
  -H "Content-Type: application/json" \
  -d '{"name":"approval-request"}'

curl -X POST http://localhost:3000/api/v1/setup/webhook-workflow \
  -H "Content-Type: application/json" \
  -d '{"name":"approval-decision"}'
```

These generated workflows only receive and acknowledge events. Edit the `approval-decision` workflow in n8n to branch on `decision` and perform the desired approved/rejected actions. Provision `send-email` separately as described in the [Email Setup Guide](./email-setup.md); it requires an SMTP credential created in n8n.

### Request workflow

Create and activate an n8n workflow with a **Webhook** trigger configured for `POST /webhook/approval-request`. Set its response mode to respond immediately so the API can continue sending the approval email. Add request validation or preparation nodes as needed.

The webhook receives an `approval.requested` event containing `approvalId`, `workflowId`, request `type`, requester and approver email addresses, subject, body, and creation timestamp.

### Decision workflow

Create and activate a second workflow with a **Webhook** trigger configured for `POST /webhook/approval-decision`. Add a **Switch** or **IF** node on the decision value (`{{$json.body.decision ?? $json.decision}}`) and connect:

- `approved` to the actual approved business action(s)
- `rejected` to rejection handling, such as notifying the requester or closing the request

The webhook receives `event: approval.decision`, `approvalId`, `workflowId`, request type, requester, approver, decision, reason, and decision timestamp. Use `approvalId` as an idempotency key before creating external records or performing other non-repeatable actions.

The decision workflow is a new n8n execution triggered by the decision event; this integration does not resume a previously suspended execution. If its webhook is unavailable, the dashboard displays a failed handoff and allows the same decision to be retried. Make the downstream work idempotent because a network failure can make the delivery outcome ambiguous.

### End-to-end dashboard test

1. Activate the email workflow and both approval webhook workflows.
2. Start the workflow service and frontend.
3. In the dashboard's **Approvals** tab, submit a test request using a monitored approver address.
4. Confirm the request appears as pending and the approver receives the email.
5. Approve or reject from the dashboard; confirm the decision workflow execution in n8n and the updated handoff status in the dashboard.

> Approval records are in-memory and the POC does not authenticate dashboard users or prove the approver's identity. Use test data only until durable storage and authentication/authorization are implemented.

If the request webhook accepts an event but the email workflow fails, the approval record is marked failed and the create endpoint returns an error. There is no dedicated retry for this partial request/email failure; inspect n8n Executions and the approval state before retrying. Decision-webhook failures, by contrast, can be retried by repeating the same decision.

---

## Phase 3 AI Decision Integration

The AI assistant calls the model from the workflow service and hands its validated advisory result to n8n. The provider key stays on the server and is not entered in the dashboard.

### Configure the provider

Copy the placeholders from `packages/workflow-service/.env.example` into the workflow-service environment and set:

```env
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=replace_with_your_provider_key
AI_MODEL=gpt-4o-mini
N8N_AI_DECISION_WEBHOOK_PATH=ai-decision
```

Use a server-side secret manager or local ignored environment file for the real key. Never commit it, put it in frontend configuration, or paste it into the dashboard. The configured URL must be an OpenAI-compatible chat-completions endpoint.

Create the basic receiver using the running workflow service:

```bash
curl -X POST http://localhost:3000/api/v1/setup/webhook-workflow \
  -H "Content-Type: application/json" \
  -d '{"name":"ai-decision"}'
```

This creates an active webhook receiver only. Add the advisory Switch/IF branches in n8n. If the provider returns HTTP `429`, inspect its API billing, usage, and rate limits; provider API credits are separate from a ChatGPT subscription.

### Configure the n8n decision workflow

Create and activate an n8n workflow with a **Webhook** trigger configured for `POST /webhook/ai-decision` (or the configured webhook path). Respond immediately so the API can return the recommendation to the dashboard. Add a **Switch** node using the recommendation from the event (`{{$json.body.recommendation ?? $json.recommendation}}`) and branch to the `approve`, `reject`, and `needs_review` review/preparation paths. Do not perform business-changing HTTP/database actions from this advisory event. Create those actions only in the Phase 2 decision workflow after a human approval. Keep any non-repeatable preparation idempotent on `decisionId`, since delivery outcomes can be ambiguous.

The event contract is advisory only. The request and decision webhooks from Phase 2 remain the source of truth for human approval and business actions. The event contract is:

```json
{
  "event": "ai.decision",
  "decisionId": "generated-uuid",
  "workflowId": "purchase-review",
  "recommendation": "needs_review",
  "riskLevel": "medium",
  "summary": "Purchase request requires review.",
  "rationale": "The policy context requires manager approval.",
  "humanReviewRequired": true,
  "createdAt": "2026-11-15T12:00:00.000Z"
}
```

### Use the dashboard and API

Open the dashboard's **AI Review** tab, enter a business request and optional policy context, then analyze it. The panel shows the model recommendation and n8n handoff state. If the handoff failed, use **Retry n8n handoff**; this reuses the saved result and does not call the model again. After analysis, enter the requester and approver email addresses and create a Phase 2 approval request. The approval workflow remains the gate for business actions; AI recommendations do not approve requests.

The same flow is available at `POST /api/v1/ai/decisions` and `POST /api/v1/ai/decisions/:id/retry`. Both routes appear in the generated OpenAPI specification at `/doc` and in Swagger UI at `/docs`. OpenAI-compatible local endpoints can be configured through `AI_API_URL` if they support the chat-completions request and JSON response format used by the adapter. Provider usage limits/billing are separate from ChatGPT subscriptions.

```json
{
  "workflowId": "purchase-review",
  "request": "Review a request to purchase 25 laptops for the engineering team.",
  "context": "Purchases over $10,000 require manager approval."
}
```

Decision retry data and status are kept in memory and disappear when the service restarts. This POC has no API authentication or durable database, and no provider-specific native Anthropic adapter. Approval creation copies the AI request/recommendation into the approval body, which is returned by the unauthenticated states endpoint. Avoid sending secrets or unnecessary personal data, and do not expose the service publicly.

## What Gets Created

### Email Workflow Structure

```
Webhook (POST /webhook/send-email)
    ↓
Send Email Node
    ↓
Respond to Webhook
```

**Payload Format:**

```json
{
  "to": "email@example.com", // or ["email1@", "email2@"]
  "subject": "Email Subject",
  "body": "Plain text body",
  "html": "<p>HTML version</p>", // Optional
  "cc": ["cc@example.com"], // Optional
  "bcc": ["bcc@example.com"], // Optional
  "replyTo": "reply@example.com" // Optional
}
```

### Webhook Workflow Structure

```
Webhook (POST /webhook/{name})
    ↓
Send Response (200 OK)
```

### Scheduled Workflow Structure

```
Schedule Trigger (runs every X minutes)
    ↓
Log Execution (no-op placeholder)
```

---

## Troubleshooting

### Error: Cannot connect to workflow service

- Make sure `npm run dev` is running in the workflow-service directory
- Check that port 3000 is not blocked

### Error: Cannot connect to n8n

- Make sure `docker-compose up` is running
- Wait 10-15 seconds for n8n to initialize
- Check n8n is accessible at `http://localhost:5678`

### Workflow creation fails

- Check n8n is running: `docker-compose ps`
- Check workflow-service logs: `npm run dev`
- Verify environment variables in `.env` are correct

---

## Next Steps

After setup:

1. ✅ Email workflows are active and ready
2. Test creating workflows via `POST /api/v1/workflows`
3. Test triggering webhooks via `POST /webhook/send-email`
4. Set up conditional logic by adding nodes to workflows
5. Configure scheduled execution for automation

For more details, see [Phase 1: Real n8n Workflows](../../issues/phase-1-real-n8n-workflows.md) or the [End-to-End Business Flow](../architecture/end-to-end-business-flow.md).
