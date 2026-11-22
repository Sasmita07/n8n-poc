# Architecture Overview

This document provides a high-level overview of the n8n Automation Gateway POC, detailing its features, project structure, and current capabilities.

## Overview

The application acts as an orchestration layer between client applications and an n8n instance, providing APIs to create, trigger, monitor, and track automation workflows. The goal is to explore workflow automation architecture while establishing a foundation that can evolve into a production-ready automation platform.

## Features

### Workflow Management

- Create n8n workflows using the n8n REST API
- Trigger and activate workflows
- Retrieve workflow details
- List available workflows
- Create or reuse preconfigured email, webhook, and scheduled workflows

### Email Notifications

- Send email through an active n8n `send-email` workflow
- Support plain text, HTML, CC, BCC, reply-to, and multiple recipients
- Attach an n8n SMTP account credential to the Send Email node
- Reuse the existing email workflow to avoid duplicate webhook conflicts

### Scheduling and Conditional Flows

- Create workflows with `n8n-nodes-base.scheduleTrigger`
- Support conditional branching through arbitrary n8n node definitions and connection graphs

### Webhook Automation

- Dynamic webhook endpoints
- Forward webhook requests to n8n
- Support event-driven automation

### Human-in-the-Loop Approvals

- Create approval requests for expense, leave, purchase, or other workflow decisions
- Start a configured n8n request workflow and send the reviewer an email
- Store request, notification, and continuation lifecycle state
- Dispatch approved or rejected decisions to a separate n8n continuation workflow
- Store the selected business `workflowId` as correlation metadata; this does not pause, resume, or start that workflow
- Expose `canContinue` as an approval-state flag; the decision webhook starts a separate n8n execution rather than resuming a suspended one
- Prevent changing a completed decision and support retry when decision dispatch fails
- Send a notification email through the separate `send-email` integration workflow; the email is not an approval-action link

### AI-Assisted Triage (Phase 3)

- Request a constrained recommendation from a server-configured OpenAI-compatible provider
- Validate the structured recommendation and risk level before dispatching an `ai.decision` event to n8n
- Branch on the advisory result in n8n and optionally create a Phase 2 human approval request from the dashboard
- Keep AI credentials server-side; never treat model output as authorization
- Retry failed n8n handoffs without repeating the provider call

### Monitoring

- Execution Logs fetch up to 100 recent n8n execution summaries (`includeData=false`) through the workflow service
- The dashboard polls execution history every three seconds; it does not receive push-based live events
- Workflow state tracking
- In-memory state endpoints (`GET /api/v1/states` & `GET /api/v1/states/:type/:id`) for workflow, webhook, and approval state; these are separate from n8n execution history
- Health check endpoint

### Error Handling

- Failed execution tracking
- Workflow state updates
- API error responses
- Detailed n8n authentication, payload, not-found, and activation-conflict errors

---

## Project Structure

The project is set up as an npm workspaces monorepo:

```
n8n-poc/
├── docs/                      # Documentation grouped by context
│   ├── api/
│   ├── architecture/
│   └── setup/
├── packages/
│   ├── workflow-service/      # Node.js/Hono TypeScript API service
│   │   └── src/
│   └── frontend/              # Vite dashboard
│       └── src/
├── Dockerfile                 # Root container build definition
├── docker-compose.yml         # Container configuration
└── package.json               # Monorepo workspaces configuration
```

---

## Current Capabilities

This Proof of Concept currently demonstrates:

- REST-based workflow orchestration (`/api/v1/`)
- Dynamic webhook handling (`/webhook/:path`)
- Email setup (`POST /api/v1/setup/email-workflow`)
- Email delivery (`POST /api/v1/emails`)
- Webhook workflow setup (`POST /api/v1/setup/webhook-workflow`)
- Scheduled workflow setup (`POST /api/v1/setup/scheduled-workflow`)
- Workflow creation
- Workflow triggering
- Workflow monitoring
- Execution logging
- State management
- Approval request and decision management
- AI-assisted business-request triage and n8n decision handoff
- Error handling

## Service Routes

The workflow service exposes these primary route groups:

| Route                  | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `/api/v1/workflows`    | Create, list, retrieve, and activate n8n workflows               |
| `/api/v1/setup/*`      | Create or reuse standard email, webhook, and scheduled workflows |
| `/api/v1/emails`       | Send an email through n8n                                        |
| `/api/v1/approvals`    | Create and resolve human approval requests                       |
| `/api/v1/ai/decisions` | Generate an advisory recommendation and dispatch it to n8n       |
| `/webhook/:path`       | Forward incoming events to n8n                                   |
| `/api/v1/states`       | Read workflow, webhook, and approval state                       |
| `/api/v1/logs`         | Read execution logs                                              |
| `/health`              | Check service health                                             |
| `/doc`                 | OpenAPI JSON specification                                       |
| `/docs` and `/swagger` | Swagger UI                                                       |

## Email Configuration

The email workflow requires an SMTP account credential created in n8n. Configure the credential reference in the workflow service environment:

```env
N8N_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
N8N_SMTP_CREDENTIAL_ID=your_n8n_smtp_credential_id
N8N_SMTP_CREDENTIAL_NAME=your_n8n_smtp_credential_name
N8N_SMTP_SENDER=noreply@example.com
```

The generated Send Email node uses n8n node version `2.1`, `operation: send`, and `emailFormat: both`. The webhook payload is mapped from `$json.body` with a fallback to top-level fields for direct webhook calls.

## Approval Architecture

The dashboard creates and reviews approval requests through the workflow service. The selected workflow ID is saved as a reference on the approval record; multiple approvals can point to the same workflow. The service stores a pending record, triggers the configured `approval-request` n8n webhook, and emails the approver using the existing `send-email` workflow. On decision, it records the approved/rejected state and triggers a second `approval-decision` webhook. The decision workflow must be configured to branch and perform the desired business action. These are separate n8n executions; the service does not pause, resume, or automatically start the selected business workflow. The email has no decision link; decisions are made in the dashboard.

Configure the webhook paths with `N8N_APPROVAL_REQUEST_WEBHOOK_PATH` and `N8N_APPROVAL_DECISION_WEBHOOK_PATH`. The event payloads include a stable `approvalId` so downstream actions can be made idempotent.

## AI Decision Architecture

The dashboard submits business request text to the workflow service. The service calls the configured provider using a server-side key, validates a constrained JSON result, stores status/route metadata in memory, and sends an `ai.decision` event to the configured n8n webhook. n8n can branch on recommendation or risk for advisory routing and review preparation. Business-changing HTTP/database actions must remain behind the Phase 2 human decision workflow. Failed n8n delivery can be retried from the dashboard without another model call. The AI-decision record does not retain the prompt, but creating an approval from the result copies the request and recommendation into the approval body, which is returned by `/api/v1/states`.

Configure `AI_API_URL`, `AI_API_KEY`, `AI_MODEL`, and `N8N_AI_DECISION_WEBHOOK_PATH`; see [Phase 3 setup](../setup/workflow-setup-api.md#phase-3-ai-decision-integration).

## POC Limitations

- Workflow records stored by the local automation store are in memory and are lost when the service restarts.
- n8n remains responsible for credential storage, workflow execution, SMTP delivery, and scheduling.
- Conditional branching is supported by passing n8n node definitions and connections; the gateway does not implement branching logic itself.
- Approval state is held in the in-memory automation store and is lost when the service restarts. The request/email partial-failure path has no dedicated retry control.
- AI decision event retry data and state are in-memory and are lost on service restart; this POC supports an OpenAI-compatible chat-completions API, not native Anthropic/local adapters or a multi-agent runtime.
- Approval request bodies (including AI request text copied into AI-originated approvals) are exposed through the unauthenticated states endpoint. Avoid secrets and unnecessary personal data, and do not expose the service publicly. Model output must not directly authorize external actions.
- Authentication/authorization is not implemented; approver identity in a decision payload is not proof of identity. Do not use this POC for sensitive approvals until authentication and role checks are added.
- n8n request and decision webhook workflows must be created and activated separately; see [Workflow Setup via API](../setup/workflow-setup-api.md#approval-workflow-integration).
