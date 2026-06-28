# n8n Automation Flow with Node.js (Proof of Concept)

## Overview

This project is a **Proof of Concept (POC)** demonstrating how a **Node.js Express** application can integrate with **n8n** to manage workflow automation through REST APIs.

The application acts as an orchestration layer between client applications and an n8n instance, providing APIs to create, trigger, monitor, and track automation workflows.

The goal of this project is to explore workflow automation architecture while establishing a foundation that can evolve into a production-ready automation platform.

---

# Features

## Workflow Management

- Create n8n workflows using the n8n REST API
- Trigger and activate workflows
- Retrieve workflow details
- List available workflows

## Webhook Automation

- Dynamic webhook endpoints
- Forward webhook requests to n8n
- Support event-driven automation

## Monitoring

- Execution logging
- Workflow state tracking
- Workflow status endpoint
- Health check endpoint

## Error Handling

- Failed execution tracking
- Workflow state updates
- API error responses

---

# Project Structure

```
project/
│
├── routes/
│   └── automationRoutes.js
│
├── services/
│   └── n8nService.js
│
├── models/
│   └── automationStore.js
│
├── server.js
├── app.js (TBD)
└── package.json
```

---

# Architecture

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

# API Endpoints

| Method | Endpoint                         | Description               |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/health`                        | Application health check  |
| GET    | `/api/logs`                      | Retrieve execution logs   |
| GET    | `/api/workflow-states`           | Retrieve workflow states  |
| POST   | `/api/create-workflow`           | Create a new workflow     |
| POST   | `/api/activate-workflow`         | Trigger a workflow        |
| GET    | `/api/workflows`                 | List workflows            |
| GET    | `/api/workflows/:workflowId`     | Retrieve workflow details |
| GET    | `/api/workflow-status/:type/:id` | Get workflow status       |
| GET    | `/webhook/:path`                 | Dynamic webhook endpoint  |

---

# Workflow Lifecycle

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

# Technology Stack

- Node.js
- Express.js
- n8n
- Axios
- REST APIs
- JavaScript (ES6)

---

# Installation

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Run the server

```bash
npm start
```

Development mode

```bash
npm run dev
```

---

# Environment Variables

```
PORT=3000

N8N_URL=http://localhost:5678

N8N_API_KEY=your_api_key
```

---

# Example Workflow

```
Webhook
    │
    ▼
Node.js API
    │
    ▼
Trigger n8n Workflow
    │
    ▼
Workflow Execution
    │
    ▼
Execution Status
    │
    ▼
Response
```

---

# Current Capabilities

This Proof of Concept currently demonstrates:

- REST-based workflow orchestration
- Dynamic webhook handling
- Workflow creation
- Workflow triggering
- Workflow monitoring
- Execution logging
- State management
- Error handling

---

# Roadmap

The following enhancements are planned to evolve this POC into a production-ready automation platform.

## Phase 1 – Real n8n Workflows

- Build workflows using the n8n editor
- Email notifications
- Conditional logic
- Scheduled workflows

## Phase 2 – Human-in-the-Loop Automation

Example workflow:

```
Webhook
   │
   ▼
Create Request
   │
   ▼
Approval Email
   │
   ▼
Wait for Approval
   │
   ▼
Continue Workflow
```

Features

- Expense approvals
- Leave approvals
- Purchase approvals

---

## Phase 3 – AI & Agentic Workflows

Integrate AI models into workflow execution.

Example

```
Webhook
      │
      ▼
AI Agent
      │
      ▼
Decision Making
      │
      ▼
HTTP Request
      │
      ▼
Database
      │
      ▼
Response
```

Potential integrations

- OpenAI
- Anthropic
- Local LLMs

---

## Phase 4 – Persistent Storage

Replace the in-memory store with:

- PostgreSQL
- MongoDB
- Redis

Store

- Workflow metadata
- Execution history
- Logs
- Users

---

## Phase 5 – Authentication

- JWT Authentication
- API Keys
- OAuth
- Role-Based Access Control (RBAC)

---

## Phase 6 – Dashboard

Build a web interface for

- Workflow management
- Execution history
- Live monitoring
- Log viewer

Potential stack

- React
- Next.js

---

## Phase 7 – Real-Time Monitoring

- WebSockets
- Server-Sent Events
- Live execution updates

---

## Phase 8 – Scheduling

Support

- Cron expressions
- Delayed execution
- Recurring workflows

---

## Phase 9 – Notifications

Integrations

- Slack
- Microsoft Teams
- Discord
- Email

---

## Phase 10 – Docker Deployment

Containerize

- Node.js
- n8n
- PostgreSQL
- Redis

using Docker Compose.

---

## Phase 11 – Retry & Recovery

Implement

- Automatic retries
- Failure notifications
- Dead-letter queue

---

## Phase 12 – Observability

Integrate

- Prometheus
- Grafana
- Structured logging
- Metrics dashboard

---

## Phase 13 – Custom n8n Node

Develop a reusable n8n community node for integrating with custom business services.

---

## Phase 14 – Multi-Tenant Support

Support

- Multiple users
- Organizations
- Team workspaces
- Permissions

---

## Future Vision

The long-term goal is to evolve this project into a complete workflow automation platform featuring:

- Workflow orchestration
- AI-powered automation
- Human approval workflows
- Real-time monitoring
- Authentication & RBAC
- Workflow analytics
- Execution history
- Dashboard UI
- Containerized deployment
- Production-ready architecture

---

# License

This project is intended for educational purposes and as a proof of concept demonstrating integration between Node.js and n8n.
