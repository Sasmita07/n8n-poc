# Project Roadmap & Future Vision

This roadmap uses the phase numbering in the corresponding files under `issues/`. “POC implemented” means demonstrated locally; it does not imply production readiness.

## Phase 1 — Real n8n Workflows: POC Implemented

The dashboard and service create/list/activate basic webhook and schedule workflows, and send email through an n8n workflow. See [Phase 1 issue](../../issues/phase-1-real-n8n-workflows.md).

## Phase 2 — Human-in-the-Loop Automation: POC Implemented

The dashboard creates approval records, sends notifications, and dispatches approved/rejected events to a separate n8n decision workflow. The selected business workflow ID is a correlation reference only; this design does not pause or resume a single n8n execution. Approval state is in-memory and reviewer identity is not authenticated. See [Phase 2 setup and limitations](../setup/workflow-setup-api.md#approval-workflow-integration) and [Phase 2 issue](../../issues/phase-2-human-in-the-loop-automation.md).

## Phase 3 — AI-Assisted Triage: POC Implemented

A server-configured OpenAI-compatible chat-completions provider returns a validated advisory recommendation. The dashboard can hand that result to a human approval request. AI output does not authorize business actions. A compatible local endpoint may be configured, but provider-specific native adapters are not included. See [Phase 3 setup](../setup/workflow-setup-api.md#phase-3-ai-decision-integration) and [Phase 3 issue](../../issues/phase-3-ai-agentic-workflows.md).

## Phase 4 — Persistent Storage: Planned

Replace volatile process-memory state with durable storage for approval records, retry events, workflow metadata, and history. See [Phase 4 issue](../../issues/phase-4-persistent-storage.md).

## Phase 5 — Authentication & Authorization: Planned

Add authenticated users, role checks, and server-verified approver identity before relying on approvals for sensitive actions. See [Phase 5 issue](../../issues/phase-5-authentication.md).

## Phase 6 — Dashboard: POC Implemented

The dashboard provides workflow setup/listing, execution summaries, AI Review, and Approvals. Production UX, authorization, error recovery, and durable history remain follow-up work. See [Phase 6 issue](../../issues/phase-6-dashboard.md).

## Phase 7 — Real-Time Monitoring: Planned

The current Execution Logs tab polls n8n's executions API every three seconds; it is not push-based real-time monitoring. Add WebSockets or Server-Sent Events for live updates. See [Phase 7 issue](../../issues/phase-7-real-time-monitoring.md).

## Phase 8 — Scheduling: Basic POC Implemented

The app creates a basic n8n schedule-trigger workflow. Advanced schedule management and production scheduling guarantees remain future work. See [Phase 8 issue](../../issues/phase-8-scheduling.md).

## Phase 9 — Notifications: Basic POC Implemented

Email is sent through an n8n Send Email workflow using a credential stored in n8n. Rich notification management and delivery recovery remain future work. See [Phase 9 issue](../../issues/phase-9-notifications.md).

## Phase 10 — Docker Deployment: Local POC Only

Compose scaffolding is available for local development. Its current defaults disable n8n authentication and are not production-safe. See [Phase 10 issue](../../issues/phase-10-docker-deployment.md).

## Phase 11 — Retry & Recovery: Partially Implemented

The POC supports manual retry for failed decision and AI n8n handoffs, but not general automatic retry policies or a dead-letter queue. See [Phase 11 issue](../../issues/phase-11-retry-recovery.md).

## Phase 12 — Observability: Planned

Prometheus metrics, Grafana dashboards, and structured operational logs remain future work. The current execution view fetches n8n execution summaries; it is not a full observability platform. See [Phase 12 issue](../../issues/phase-12-observability.md).

## Phase 13 — Custom n8n Node: Planned

See [Phase 13 issue](../../issues/phase-13-custom-n8n-node.md).

## Phase 14 — Multi-Tenant Support: Planned

See [Phase 14 issue](../../issues/phase-14-multi-tenant-support.md).

## Production Readiness Priorities

1. Durable approval, AI retry, and audit storage.
2. Authentication, authorization, and verified approver identity.
3. Secure deployment configuration and managed secrets.
4. A true approval-gated execution design if business workflows must pause until a decision.
5. Idempotent downstream effects, recoverable notifications, and operational observability.

See the [End-to-End Business Flow](../architecture/end-to-end-business-flow.md) for what the current POC does and does not execute.
