# Phase 1: Email Setup Guide

## Prerequisites

You must have n8n running. If using Docker, ensure it's started from the repo root:

```bash
cd n8n-poc
docker-compose up
```

This starts n8n on `http://localhost:5678` by default.

## Step 1: Verify Environment Variables

For local development, configure `packages/workflow-service/.env.development` from `.env.example`. The generated n8n Send Email node requires an SMTP credential created in n8n; setting SMTP host/password variables in the workflow-service environment does not create that credential.

```env
N8N_URL=http://localhost:5678
N8N_API_KEY=your_api_key
N8N_SMTP_CREDENTIAL_ID=your_n8n_smtp_credential_id
N8N_SMTP_CREDENTIAL_NAME=SMTP account
N8N_SMTP_SENDER=noreply@example.com
```

Keep the SMTP credential secret in n8n. The workflow service only needs the credential's ID and display name to attach it to the generated node.

The app also exposes a setup endpoint for this workflow, which is the recommended path for Phase 1:

```bash
curl -X POST http://localhost:3000/api/v1/setup/email-workflow
```

## Step 2: Create or Reuse the Email Workflow

The recommended flow is to let the app create or reuse the `send-email` workflow automatically. If you want to build it manually in n8n instead, follow the fallback steps below.

### Recommended app-based setup

1. Start the workflow service:
   ```bash
   npm run dev
   ```
2. Call the setup endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/v1/setup/email-workflow
   ```
3. The service reuses an existing active `send-email` workflow or creates and activates one with a `POST` Webhook at `send-email`.

This endpoint provisions the email workflow; it does not send a message. The dashboard's **Create Workflow → Send Email** action provisions/reuses the workflow and then sends the submitted email. Approval creation also calls this webhook to notify the approver.

### Manual n8n fallback

1. Open n8n at `http://localhost:5678`
2. Click **+ Workflow** to create a new one
3. Name it: `send-email`
4. Add nodes in this order:

### Node 1: Webhook Trigger

- **Type**: `Webhook`
- **Method**: `POST`
- **Path**: `send-email`
- **Response**: respond immediately or connect a Respond to Webhook node

### Node 2: Email Node

- **Type**: `Send Email`
- **Important**: this node requires SMTP credentials in n8n. If you see the error `Credentials for Send Email are not set`, configure an SMTP credential in n8n first.
- **From Email**: Your sender address, supplied by `N8N_SMTP_SENDER`
- **To**: `={{ String($json.body?.to ?? $json.to ?? '') }}`
- **Subject**: `={{ $json.body?.subject ?? $json.subject }}`
- **Text**: `={{ $json.body?.body ?? $json.body }}`
- **HTML** (optional): `={{ $json.body?.html ?? $json.html }}`

#### SMTP configuration

Before triggering the workflow, set up an SMTP credential in n8n:

1. Open n8n > Credentials
2. Create a new credential for SMTP or Gmail
3. Fill in host, port, username, password, and sender
4. Attach that credential to the `Send Email` node

The generated workflow references the SMTP credential by `N8N_SMTP_CREDENTIAL_ID` and uses `N8N_SMTP_SENDER` as the sender address. For a manually configured n8n instance, create the credential in **Credentials** and select it on the Send Email node; do not copy SMTP passwords into this guide or source control. Compose-only `N8N_SMTP_*` mailer settings, if used for n8n system mail, are separate from the node credential.

The generated node maps `to`, `subject`, `body`, and optional HTML/CC/BCC/reply-to fields from the webhook payload. See [Email Workflow Architecture](../architecture/email-workflow.md) for the current generated node behavior.

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
3. Open **Create Workflow** and select **Send Email**
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

### Frontend shows an OPTIONS/CORS error

- Confirm the workflow service is running and inspect its console for the preflight request.

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
3. Configure and test the Phase 2 approval flow using [Approval Workflow Integration](./workflow-setup-api.md#approval-workflow-integration)
4. Explore future AI agent integrations
