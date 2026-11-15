# Project Roadmap & Future Vision

This document details the roadmap phases planned to evolve this Proof of Concept into a production-ready automation orchestration platform.

## Roadmap Phases

### Phase 1 – Real n8n Workflows

- Build workflows using the n8n editor
- Email notifications
- Conditional logic
- Scheduled workflows

### Phase 2 – Human-in-the-Loop Automation — POC Complete

The dashboard creates and reviews expense, leave, purchase, or general approval requests. The service records a pending request, starts the configured n8n request webhook, and sends an email notification. When the assigned approver submits a decision in the dashboard, the service records it and starts a separate n8n decision workflow for approved or rejected business actions.

This is an event-driven handoff, not a suspended n8n execution that resumes after approval. Approval records are currently in-memory, and approver identity is not authenticated. See [Phase 2 setup and limitations](../setup/workflow-setup-api.md#approval-workflow-integration).

### Phase 3 – AI & Agentic Workflows

Integrate LLM decisions and agent architectures inside workflows.

- OpenAI / Anthropic integration
- Local LLM integrations
- Multi-agent routing

### Phase 4 – Persistent Storage

Replace current volatile, in-memory store (`automationStore.js`) with:

- **PostgreSQL** or **MongoDB** for workflow records, approval requests, log persistence, and history.
- **Redis** for transient caching and state sessions.

### Phase 5 – Authentication & Authorization

- JWT-based authentication
- API Key issuance
- OAuth2 providers
- Role-Based Access Control (RBAC)

### Phase 6 – Real-Time Monitoring & SSE

- WebSockets or Server-Sent Events (SSE) for instant, live updates in the log viewer and system indicators.

### Phase 7 – Retry, Recovery, & Dead-Letter Queue

- Automatic retry handlers for failed workflow executions.
- Dead-letter queues for capturing persistent failed actions.

---

## Future Vision

The long-term goal is to evolve this project into a complete enterprise-grade workflow orchestration platform featuring:

- Seamless visual dashboard for logs, workflows, and health.
- Built-in containerized multi-node execution profiles.
- Production-grade human-in-the-loop tasks with durable storage, authenticated approvers, and recoverable execution handoffs.
- Observability monitoring dashboards powered by Prometheus and Grafana.
