# Phase 1: Email Setup Guide

## Prerequisites

You must have n8n running. If using Docker, ensure it's started:

```bash
cd /Users/sas_vsCodeWorkspace/n8n-poc
docker-compose up
```

This starts n8n on `http://localhost:5678` by default.

## Step 1: Verify Environment Variables

Check `.env` file in `packages/workflow-service/.env`:

```env
N8N_URL=http://localhost:5678
N8N_API_KEY=your_api_key  # Optional, remove if using n8n without API keys
```

## Step 2: Create the Email Webhook Workflow in n8n

1. Open n8n at `http://localhost:5678`
2. Click **+ Workflow** to create a new one
3. Name it: `send-email`
4. Add nodes in this order:

### Node 1: Webhook Trigger

- **Type**: `Webhook`
- **Method**: `POST`
- **Path**: `send-email`
- **Authentication**: None (or use API key if configured)

### Node 2: Email Node

- **Type**: `Send Email`
- **Important**: this node requires SMTP credentials in n8n. If you see the error `Credentials for Send Email are not set`, configure an SMTP credential in n8n first.
- **From Email**: Your email (or use SMTP configuration)
- **To**: `{{ $json.to }}` (reference from webhook)
- **Subject**: `{{ $json.subject }}`
- **Text**: `{{ $json.body }}`
- **HTML** (optional): `{{ $json.html }}`

#### SMTP configuration

Before triggering the workflow, set up an SMTP credential in n8n:

1. Open n8n > Credentials
2. Create a new credential for SMTP or Gmail
3. Fill in host, port, username, password, and sender
4. Attach that credential to the `Send Email` node

Example environment values:

```env
N8N_SMTP_HOST=smtp.gmail.com
N8N_SMTP_PORT=465
N8N_SMTP_USER=N8N_SMTP_USER
N8N_SMTP_PASS=your-app-password
N8N_SMTP_SENDER=noreply@example.com
```

### Node 3: Respond to Webhook

- **Type**: `Respond to Webhook`
- **Response Body**:

```json
{
  "status": "success",
  "message": "Email sent"
}
```

### Connect the Nodes

1. Webhook → Email
2. Email → Respond to Webhook

### Save & Deploy

- Click **Save**
- Click the **Execute Workflow** button (play icon) to activate it
- You should see: `Workflow is now active`

## Step 3: Send Email from Dashboard

1. Start your development server:

```bash
npm run dev
```

2. Go to `http://localhost:5173`
3. Select **Email Notification** type
4. Enter:
   - **Recipient Email**: test@example.com
   - **Subject**: Test Email
   - **Body**: This is a test email
5. Click **📧 Send Email**

## Troubleshooting

### Error: "Email webhook not found in n8n"

- Ensure n8n is running: `docker-compose ps`
- Check workflow is deployed and active (green checkmark)
- Verify webhook path is exactly `send-email`

### Error: "Connection refused on localhost:5678"

- Start n8n: `docker-compose up`
- Wait 10-15 seconds for n8n to initialize

### Error: "Invalid email configuration"

- In n8n, configure SMTP settings or use Send Email node defaults
- Ensure the Send Email node has proper credentials

### Frontend shows 404 on OPTIONS request

- ✅ **FIXED**: CORS middleware now handles preflight requests

## Testing Email API Directly

```bash
curl -X POST http://localhost:3000/api/v1/emails \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email."
  }'
```

Expected response:

```json
{
  "success": true,
  "message": "Email sent successfully",
  "result": {
    "status": "success",
    "message": "Email sent"
  }
}
```

## Next Steps

After confirming emails work:

1. Test scheduling workflows with cron triggers
2. Test webhook triggers with conditional logic
3. Explore Phase 2 features (human-in-the-loop, AI agents)
