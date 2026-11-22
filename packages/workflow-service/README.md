# Workflow Service

The TypeScript/Hono service is the backend for the n8n Automation Gateway POC. It exposes workflow, approval, AI-review, email, state, and execution-log APIs. n8n remains responsible for workflow execution and credential storage.

## Run locally

From the monorepo root, install dependencies and configure `packages/workflow-service/.env.development` from `.env.example`. Start n8n separately at `http://localhost:5678`, then start the service:

```bash
npm install
npm run dev -w workflow-service
```

The API listens at `http://localhost:3000`. Interactive OpenAPI/Swagger documentation is at `http://localhost:3000/docs`; the OpenAPI document is `http://localhost:3000/doc`.

The root `npm run dev` command starts both the workflow service and frontend. See the [installation guide](../../docs/setup/installation.md) for n8n setup and environment configuration.

## Common commands

Run these from the monorepo root:

```bash
npm run build -w workflow-service
npm test -w workflow-service
npm run setup -w workflow-service
```

`setup` requires the service and n8n to be running. It creates/reuses the standard email, webhook, and scheduled starter workflows. It does not create approval/AI integration branches; see [Workflow Setup via API](../../docs/setup/workflow-setup-api.md).

## Key routes

- `/api/v1/workflows` — create/list workflows; activation is separate and does not execute immediately.
- `/api/v1/setup/*` — provision standard email, webhook, and scheduled workflows.
- `/api/v1/approvals` — create and decide approval requests.
- `/api/v1/ai/decisions` — get an advisory AI recommendation and dispatch to n8n.
- `/api/v1/logs` — fetch up to 100 recent n8n execution summaries.
- `/api/v1/states` — read gateway state held in process memory.

See the [end-to-end flow guide](../../docs/architecture/end-to-end-business-flow.md) for the UI/API/n8n sequence and known limitations.

## POC security and behavior

This service has no API authentication. Approval and AI retry state are in memory and disappear on restart. A workflow ID on an approval is correlation metadata; the service does not pause, resume, or automatically start the selected business workflow. Do not expose the service publicly or use it for sensitive data or decisions.
