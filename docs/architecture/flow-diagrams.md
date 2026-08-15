# System Architecture & Flow Diagrams

This document contains visual diagrams mapping out the automation gateway architecture, execution workflows, and webhook lifecycles.

## Gateway Architecture
The following diagram illustrates how the Express API behaves as an orchestrator between client applications and n8n:

```
                 Client Application
                         │
                         ▼
                Express REST API
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
  Workflow API       Logging        State Store
         │
         ▼
      n8n Service Layer
         │
         ▼
         n8n REST API
         │
         ▼
      Workflow Execution
```

---

## Workflow Lifecycle
The typical path from a client request down to log updates and state updates:

```
Client Request
      │
      ▼
Express API
      │
      ▼
Validate Request
      │
      ▼
Call n8n REST API
      │
      ▼
Execute Workflow
      │
      ▼
Update Logs
      │
      ▼
Update Workflow State
      │
      ▼
Return Response
```

---

## Example Webhook Integration Workflow
Visualizing how dynamic webhook paths are caught and delegated to n8n:

```
Webhook Event
    │
    ▼
Node.js API Endpoint
    │
    ▼
Trigger n8n Workflow Webhook
    │
    ▼
n8n Workflow Execution
    │
    ▼
Log Execution Status
    │
    ▼
Client Response
```
