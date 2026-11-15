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
- Expose `canContinue` only for approved requests; the decision webhook starts a separate n8n execution rather than resuming a suspended one
- Prevent changing a completed decision and support retry when decision dispatch fails

### Monitoring

- Execution logging
- Workflow state tracking
- States endpoints (`GET /api/v1/states` & `GET /api/v1/states/:type/:id`) for workflow, webhook, and approval state
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
- Error handling

## Service Routes

The workflow service exposes these primary route groups:

| Route                  | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `/api/v1/workflows`    | Create, list, retrieve, and activate n8n workflows               |
| `/api/v1/setup/*`      | Create or reuse standard email, webhook, and scheduled workflows |
| `/api/v1/emails`       | Send an email through n8n                                        |
| `/api/v1/approvals`    | Create and resolve human approval requests                       |
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

The dashboard creates and reviews approval requests through the workflow service. The service stores a pending record, triggers the configured `approval-request` n8n webhook, and emails the approver using the existing email workflow. On decision, it records an immutable approved/rejected state and triggers a second `approval-decision` webhook. n8n branches on that event and runs the approved or rejected business path. These are separate n8n executions; the service does not resume a suspended execution.

Configure the webhook paths with `N8N_APPROVAL_REQUEST_WEBHOOK_PATH` and `N8N_APPROVAL_DECISION_WEBHOOK_PATH`. The event payloads include a stable `approvalId` so downstream actions can be made idempotent.

## POC Limitations

- Workflow records stored by the local automation store are in memory and are lost when the service restarts.
- n8n remains responsible for credential storage, workflow execution, SMTP delivery, and scheduling.
- Conditional branching is supported by passing n8n node definitions and connections; the gateway does not implement branching logic itself.
- Approval state is currently held in the in-memory automation store and is lost when the service restarts.
- Authentication/authorization is not implemented; approver identity in a decision payload is not proof of identity. Do not use this POC for sensitive approvals until authentication and role checks are added.
- n8n request and decision webhook workflows must be created and activated separately; see [Workflow Setup via API](../setup/workflow-setup-api.md#approval-workflow-integration).
