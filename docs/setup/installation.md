# Setup & Installation Guide

This document describes how to configure, install, and run the n8n Automation Gateway POC locally, within Docker containers, or when running tests.

## Technology Stack

- **Runtime**: Node.js (v18+)
- **Package Manager**: npm workspaces
- **Workflow Service framework**: Hono / @hono/zod-openapi (TypeScript)
- **Frontend framework**: Vite (React 19 / daisyUI)
- **Containerization**: Docker & Docker Compose

---

## Environment Variables

The workflow service reads `packages/workflow-service/.env.development` when `NODE_ENV=development`, falling back to `.env`. Start from `.env.example` and keep real credentials in the ignored local file only:

```ini
# Application configuration
PORT=3000
NODE_ENV=development

# n8n instance configuration
N8N_URL=http://localhost:5678
N8N_API_KEY=your_api_key
N8N_APPROVAL_REQUEST_WEBHOOK_PATH=approval-request
N8N_APPROVAL_DECISION_WEBHOOK_PATH=approval-decision
N8N_AI_DECISION_WEBHOOK_PATH=ai-decision

# SMTP-backed email workflow setup
N8N_SMTP_CREDENTIAL_ID=your_n8n_smtp_credential_id
N8N_SMTP_CREDENTIAL_NAME=SMTP account
N8N_SMTP_SENDER=noreply@example.com

# Phase 3 AI provider (server-side only; never expose or commit the real key)
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=replace_with_your_provider_key
AI_MODEL=gpt-4o-mini
```

The repository includes a ready-to-copy template at `packages/workflow-service/.env.example`. Webhook URLs are built from `N8N_URL` and the configured path. SMTP credentials themselves are stored in n8n; the service environment contains only the credential reference and sender address.
For AI-assisted triage, configure the provider key only in the workflow-service environment and activate the n8n AI decision webhook described in [Phase 3 AI Decision Integration](./workflow-setup-api.md#phase-3-ai-decision-integration).

---

## Local Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd n8n-poc
   ```

2. **Install all monorepo dependencies** (runs root npm and configures workflow-service/frontend packages)

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy `packages/workflow-service/.env.example` to `packages/workflow-service/.env.development` and set local values. Do not commit the copied file or share its secrets.

4. **Launch Development Servers**
   To start both the workflow-service API (port 3000) and the Vite frontend dashboard (port 5173) concurrently:
   ```bash
   npm run dev
   ```

---

## Docker Deployment

The Compose stack is a **local development POC only**. It disables n8n authentication; the published n8n and service ports are bound to loopback for local access. Do not remove that restriction or use these settings for production.

Before starting Compose, create `packages/workflow-service/.env.development` from `.env.example`. The `node_app` service loads that file. n8n email-node credentials are created and stored in n8n separately; the environment variables alone do not configure the credential required by the generated Send Email node.

The project comes with container support using Docker Compose:

1. **Build and launch services** (n8n & Node app)

   ```bash
   docker-compose build
   docker-compose up -d
   ```

   This will set up:
   - **n8n service** running at `http://localhost:5678`
   - **Gateway node_app** running at `http://localhost:3000`

2. **Stop services**
   ```bash
   docker-compose down
   ```

---

## Phase 1: Email Notifications Setup

To use email notifications via Phase 1 features, you **must**:

1. **Start n8n** (either via Docker or standalone)
2. Create an SMTP credential in n8n and set its ID/name in the workflow-service environment
3. Call `POST /api/v1/setup/email-workflow` to create or reuse and activate `send-email`

For detailed instructions, see [Email Setup Guide](./email-setup.md).

### Quick Start

```bash
# Start n8n
docker-compose up

# In another terminal, start the application
npm run dev

# Access dashboard at http://localhost:5173
# Use the Create Workflow tab's Send Email option to send a test email
```

---

## Verification Checklist

- ✅ Node.js v18+ installed
- ✅ npm and Docker installed
- ✅ All dependencies installed (`npm install`)
- ✅ `.env` file configured
- ✅ n8n running on port 5678
- ✅ Workflow service running on port 3000
- ✅ Frontend accessible on port 5173
- ✅ API Swagger docs at `http://localhost:3000/docs`

For more details on specific features, refer to the [Architecture documentation](../architecture/overview.md).
