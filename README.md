# n8n Automation Gateway (Monorepo POC)

This project is a **Proof of Concept (POC)** demonstrating how a **Node.js Hono** service (`workflow-service`) integrates with **n8n** to manage workflow automation through REST APIs.

It is structured as an npm workspaces monorepo containing a Gateway workflow service and a visual control dashboard.

---

## Workspace Structure

- **[packages/workflow-service](./packages/workflow-service)**: Hono TypeScript API service handling REST routing, n8n REST calls, and memory logs.
- **[packages/frontend](./packages/frontend)**: Vite dashboard for workflows, execution logs, and human approval requests.

---

## Detailed Documentation

Documentation is organized by context under the `docs/` folder:

- ⚙️ **[Setup & Installation Guide](./docs/setup/installation.md)**: Steps to install dependencies, manage environment variables, and spin up Docker containers.
- 📐 **[System Architecture & Flow Diagrams](./docs/architecture/flow-diagrams.md)**: Visual mappings of gateway orchestration flows and execution lifecycles.
- 🔌 **[API Endpoints Reference](./docs/api/endpoints.md)**: Complete list of HTTP methods, routes, parameters, and payloads.
- 🗺️ **[Roadmap & Future Vision](./docs/roadmap/future.md)**: Completed Phase 2 approval POC and future work (durable storage, authentication, real-time monitoring, and AI agents).

---

## Quick Start

### 1. Install Workspace Dependencies

Execute npm install at the monorepo root to configure workspaces:

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file under `packages/workflow-service/` using the template at `packages/workflow-service/.env.example`.

### 3. Run Development Server

To launch both the workflow-service and the Vite frontend dashboard concurrently:

```bash
npm run dev
```

- **Workflow Service**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/docs`
- **Dashboard Interface**: `http://localhost:5173`

The dashboard includes an **Approvals** tab for creating requests and recording approval decisions. Configure and activate the n8n approval request and decision webhook workflows before testing the full flow; see [Approval Workflow Integration](./docs/setup/workflow-setup-api.md#approval-workflow-integration).
