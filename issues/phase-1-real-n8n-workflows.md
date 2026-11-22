# Issue: Phase 1 – Real n8n Workflows

## Summary

Build real n8n workflows and integrate them into the Node.js orchestration layer.

## Status

✅ **COMPLETE** - Real n8n workflow creation, activation, scheduling, webhook execution, SMTP-backed email delivery, and frontend integration are working.

## Goals

- ✅ Build workflows using the n8n editor (API support added)
- ✅ Implement email notifications (API endpoint `/api/v1/emails`)
- ✅ Add conditional logic in workflows (n8n node connections supported)
- ✅ Support scheduled workflows (Cron trigger nodes supported)

## Acceptance Criteria

### ✅ n8n workflows are created and managed through the app

- **Backend**: `POST /api/v1/workflows` creates workflows in n8n
- **Backend**: `GET /api/v1/workflows` lists all workflows
- **Backend**: `GET /api/v1/workflows/:id` retrieves workflow details
- **Backend**: `POST /api/v1/workflows/:id/activate` activates workflows
- **Frontend**: Workflow form component for creating webhooks and scheduled triggers
- **Frontend**: Workflow list with status indicators and activation controls

### ✅ Workflows can trigger email notifications

- **Backend**: `POST /api/v1/emails` sends email notifications via n8n
- **Email Adapter**: `sendEmailViaWorkflow()` triggers n8n email nodes
- **Email Adapter**: `createEmailNodeConfig()` generates email node definitions
- **Frontend**: Email notification form with recipient, subject, and body fields
- **Tests**: Email routing and validation tests in `email.test.ts`
- **SMTP**: the `Send Email` node uses the configured n8n SMTP account credential
- **Workflow setup**: `POST /api/v1/setup/email-workflow` creates or reuses the `send-email` workflow and activates it
- **Webhook**: email requests are sent to `POST /webhook/send-email`
- **Payload mapping**: the workflow supports webhook payloads under `$json.body` and direct payloads under `$json`
- **Recipients**: string and array recipients are normalized for n8n's comma-separated `To Email` field

### ✅ Conditional branching is functional

- **Architecture**: n8n node connections define execution flow
- **Schema Support**: `connections` field in workflow payload supports conditional logic
- **Example**: Create workflow response nodes linked to trigger nodes

### ✅ Scheduled workflows can be created and triggered

- **Schema Example**: `n8n-nodes-base.scheduleTrigger` with cron rules
- **Frontend**: Scheduled trigger option in workflow creation form
- **API Support**: Full workflow payload for time-based automation

## Implementation Details

### Backend Changes

#### New Files Created

1. **Email Integration**
   - `src/gateways/external/email.adapter.ts` - Email gateway functions
   - `src/routers/email/email.router.ts` - Email routing endpoints
   - `src/usecases/workflow/send-email/send-email.usecase.ts` - Email business logic
   - `src/types/schemas/workflow/request/send-email-request.schema.ts` - Request validation
   - `src/types/schemas/workflow/response/send-email-response.schema.ts` - Response schema
   - `src/types/dto/request/send-email-request.dto.ts` - Data transfer object
   - `tests/email.test.ts` - Email endpoint tests

2. **Modified Files**
   - `src/app.ts` - Imported and mounted email router

### Frontend Changes

#### New Files Created

1. **Hooks**
   - `src/hooks/useWorkflowApi.js` - API interaction hook with methods for CRUD operations

2. **Components**
   - `src/components/WorkflowForm.jsx` - Form to create workflows or send emails
   - `src/components/WorkflowList.jsx` - List workflows with activation controls
   - `src/components/ExecutionLogs.jsx` - View execution logs with auto-refresh
3. **Modified Files**
   - `src/App.jsx` - Integrated all components with tab navigation

### API Endpoints

#### Workflow Management

| Method | Path                             | Description          |
| ------ | -------------------------------- | -------------------- |
| POST   | `/api/v1/workflows`              | Create new workflow  |
| GET    | `/api/v1/workflows`              | List all workflows   |
| GET    | `/api/v1/workflows/:id`          | Get workflow details |
| POST   | `/api/v1/workflows/:id/activate` | Activate workflow    |

#### Email Notifications

| Method | Path             | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/api/v1/emails` | Send email notification |

#### Gateway State & n8n Execution History

| Method   | Path                       | Description                                |
| -------- | -------------------------- | ------------------------------------------ |
| GET      | `/api/v1/states`           | Retrieve in-memory gateway state           |
| GET      | `/api/v1/states/:type/:id` | Get specific in-memory gateway state       |
| GET      | `/api/v1/logs`             | Retrieve up to 100 n8n execution summaries |
| GET/POST | `/webhook/:path`           | Dynamic webhook endpoint                   |

### Frontend Features

1. **Create Workflow Tab**
   - Choose between webhook trigger or scheduled trigger
   - Name your workflow
   - Submit to n8n

2. **Send Email option in Create Workflow**
   - Specify recipient email(s)
   - Set subject and body
   - Send email via n8n

3. **Workflows Tab**
   - View all created workflows
   - See activation status
   - Activate inactive workflows
   - Auto-refresh capability

4. **Execution Logs Tab**
   - Fetches execution summaries from n8n through `GET /api/v1/logs`
   - Polls every 3 seconds; this is not push-based real-time monitoring
   - Shows up to 100 recent executions without execution data (`includeData=false`)
   - Gateway approval/webhook state is separate and is available through `/api/v1/states`

## Testing

### Test Coverage

- ✅ Email endpoint tests (6 test cases)
- ✅ Workflow CRUD tests
- ✅ Email validation
- ✅ Multi-recipient support
- ✅ HTML email support
- ✅ Live SMTP-backed email workflow verified through n8n

### Run Tests

```bash
cd packages/workflow-service
npm run test
```

## Working Email Configuration

Create an SMTP account credential in n8n and configure its exact ID and name in the workflow service environment:

```env
N8N_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
N8N_SMTP_CREDENTIAL_ID=your_n8n_smtp_credential_id
N8N_SMTP_CREDENTIAL_NAME=your_n8n_smtp_credential_name
N8N_SMTP_SENDER=noreply@example.com
```

The generated `n8n-nodes-base.emailSend` node uses version `2.1` with `operation: send` and `emailFormat: both`. Its key mappings are:

```text
To:      {{ String($json.body?.to ?? $json.to ?? '') }}
Subject: {{ $json.body?.subject ?? $json.subject }}
Text:    {{ $json.body?.body ?? $json.body }}
HTML:    {{ $json.body?.html ?? $json.html }}
```

The setup endpoint is idempotent. It reuses an existing active `send-email` workflow instead of creating duplicate workflows with conflicting webhook paths.

### Completion Checklist

- [x] Configure SMTP credential in n8n
- [x] Attach credential to the `Send Email` node
- [x] Save and activate the workflow
- [x] Confirm `/webhook/send-email` is reachable
- [x] Trigger a real email through the app and verify delivery

### Follow-up Work (Phase 2+)

- [x] Human approval POC (see [Phase 2](./phase-2-human-in-the-loop-automation.md))
- [x] Advisory AI triage with a human approval handoff (see [Phase 3](./phase-3-ai-agentic-workflows.md)); this does not generate workflows or authorize actions
- Persistent database storage (Phase 4)
- Authentication and verified approver identity (Phase 5)
- Push-based WebSocket/SSE monitoring (Phase 7)

## Related Documentation

- [API Endpoints Reference](../docs/api/endpoints.md)
- [Architecture Overview](../docs/architecture/overview.md)
- [Setup & Installation](../docs/setup/installation.md)
