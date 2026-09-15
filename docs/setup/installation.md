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

The workflow service relies on the following configuration values (typically set in `packages/workflow-service/.env` or a local `.env.development` file):

```ini
# Application configuration
PORT=3000
NODE_ENV=development

# n8n instance configuration
N8N_URL=http://localhost:5678
N8N_API_KEY=your_api_key
N8N_WEBHOOK_URL=http://localhost:3000/webhook

# SMTP-backed email workflow setup
N8N_SMTP_CREDENTIAL_ID=your_n8n_smtp_credential_id
N8N_SMTP_CREDENTIAL_NAME=SMTP account
N8N_SMTP_SENDER=noreply@example.com
```

The repository includes a ready-to-copy template at `packages/workflow-service/.env.example`.

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
   Create a `.env` file under `packages/workflow-service/` using the `.env.example` template.

4. **Launch Development Servers**
   To start both the workflow-service API (port 3000) and the Vite frontend dashboard (port 5173) concurrently:
   ```bash
   npm run dev
   ```

---

## Docker Deployment

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
2. **Create the `send-email` workflow** in n8n
3. **Enable the workflow** (active status)

For detailed instructions, see [Email Setup Guide](./email-setup.md).

### Quick Start

```bash
# Start n8n
docker-compose up

# In another terminal, start the application
npm run dev

# Access dashboard at http://localhost:5173
# Create a workflow and test email notifications
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
