# n8n Automation Gateway (Monorepo POC)

This project is a **local Proof of Concept (POC)** demonstrating how a React dashboard and a **Node.js/Hono** service (`workflow-service`) integrate with **n8n** for workflow creation, approval events, email notifications, AI-assisted triage, and execution monitoring.

It is structured as an npm workspaces monorepo containing a Gateway workflow service and a visual control dashboard.

---

## Workspace Structure

- **[packages/workflow-service](./packages/workflow-service)**: Hono TypeScript API service handling REST routing, n8n REST calls, provider calls, and in-memory approval/state records.
- **[packages/frontend](./packages/frontend)**: Vite dashboard for workflows, execution logs, and human approval requests.

---

## Detailed Documentation

Documentation is organized by context under the `docs/` folder:

- ⚙️ **[Setup & Installation Guide](./docs/setup/installation.md)**: Steps to install dependencies, manage environment variables, and spin up Docker containers.
- 📐 **[System Architecture & Flow Diagrams](./docs/architecture/flow-diagrams.md)**: Visual mappings of gateway orchestration flows and execution lifecycles.
- 🔁 **[End-to-End Business Flow](./docs/architecture/end-to-end-business-flow.md)**: Setup requirements, a purchase-approval scenario, expected events, verification steps, and POC limits.
- 🔌 **[API Endpoints Reference](./docs/api/endpoints.md)**: Complete list of HTTP methods, routes, parameters, and payloads.
- 🗺️ **[Roadmap & Future Vision](./docs/roadmap/future.md)**: Completed Phase 2 approval and Phase 3 AI-assisted workflow POCs, plus future production-readiness work.

---

## Quick Start

### 1. Install Workspace Dependencies

Execute npm install at the monorepo root to configure workspaces:

```bash
npm install
```

### 2. Start n8n

Start a local n8n instance at `http://localhost:5678`. The included Compose setup is for local development only and disables n8n authentication; do not expose it to a public network. See [Setup & Installation](./docs/setup/installation.md).

### 3. Configure Environment

Copy `packages/workflow-service/.env.example` to `packages/workflow-service/.env.development` and configure n8n access, an SMTP credential reference, and (if using AI) an OpenAI-compatible provider. Keep the local file private and uncommitted.

### 4. Run Development Server

To launch both the workflow-service and the Vite frontend dashboard concurrently:

```bash
npm run dev
```

- **Workflow Service**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/docs`
- **Dashboard Interface**: `http://localhost:5173`

The dashboard's setup actions create standard starter workflows. Before testing approvals, create/activate the `approval-request`, `approval-decision`, and `send-email` integration workflows; for AI Review, also configure an AI provider and activate `ai-decision`. See [Workflow Setup via API](./docs/setup/workflow-setup-api.md).

**Approval semantics:** a linked approval stores the selected workflow ID as a reference. It does not pause, resume, or start that business workflow. Approval and decision each start separate n8n executions, and the `approval-decision` workflow must be configured to perform downstream actions. Approval state is in-memory and this POC does not authenticate users; do not use it for sensitive decisions or expose it publicly.
