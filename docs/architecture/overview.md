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

### Webhook Automation
- Dynamic webhook endpoints
- Forward webhook requests to n8n
- Support event-driven automation

### Monitoring
- Execution logging
- Workflow state tracking
- States endpoints (`GET /api/v1/states` & `GET /api/v1/states/:type/:id`)
- Health check endpoint

### Error Handling
- Failed execution tracking
- Workflow state updates
- API error responses

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
- Workflow creation
- Workflow triggering
- Workflow monitoring
- Execution logging
- State management
- Error handling
