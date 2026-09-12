# Workflow Setup via API

You can now create workflows programmatically using the new setup endpoints. No need to manually create them in the n8n UI!

## API Endpoints

### Setup Email Workflow
```bash
curl -X POST http://localhost:3000/api/v1/setup/email-workflow \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Email workflow created and activated",
  "workflowId": "12345",
  "result": { ... }
}
```

### Setup Webhook Workflow
```bash
curl -X POST http://localhost:3000/api/v1/setup/webhook-workflow \
  -H "Content-Type: application/json" \
  -d '{"name": "my-webhook"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook workflow \"my-webhook\" created and activated",
  "workflowId": "12346",
  "result": { ... }
}
```

### Setup Scheduled Workflow
```bash
curl -X POST http://localhost:3000/api/v1/setup/scheduled-workflow \
  -H "Content-Type: application/json" \
  -d '{"name": "daily-job", "intervalMinutes": 1440}'
```

**Response:**
```json
{
  "success": true,
  "message": "Scheduled workflow \"daily-job\" created and activated",
  "workflowId": "12347",
  "result": { ... }
}
```

---

## CLI Script

### Setup All Workflows (Easiest)
```bash
cd packages/workflow-service
npm run setup
# or
npm run setup all
```

This creates:
- Email workflow (`send-email`)
- Webhook workflow (`webhook-trigger`)
- Scheduled workflow (`daily-job` - runs every 24 hours)

### Setup Specific Workflows

**Email only:**
```bash
npm run setup:email
```

**Webhook only:**
```bash
npm run setup:webhook
# Creates workflow with default name "webhook-trigger-workflow"

# Or with custom name:
npx tsx scripts/setup-workflows.ts webhook my-custom-webhook
```

**Scheduled only:**
```bash
npm run setup:scheduled
# Creates workflow with default name and 15-minute interval

# Or with custom name and interval:
npx tsx scripts/setup-workflows.ts scheduled my-job 60
# (60 minutes = hourly)
```

---

## Complete Setup Workflow

### 1. Start Services
```bash
# Terminal 1: Start n8n
docker-compose up

# Terminal 2: Start application
cd packages/workflow-service
npm install
npm run dev

# Terminal 3: Start frontend
cd packages/frontend
npm run dev
```

### 2. Initialize Workflows (Run Once)
```bash
# In Terminal 2 (after workflow-service is running)
npm run setup
```

### 3. Test Email Sending
```bash
# Option A: Via Frontend Dashboard
# Go to http://localhost:5173
# Click "Email Notification" tab
# Fill in recipient, subject, body
# Click "Send Email"

# Option B: Via API
curl -X POST http://localhost:3000/api/v1/emails \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Hello",
    "body": "This is a test"
  }'
```

---

## What Gets Created

### Email Workflow Structure
```
Webhook (POST /webhook/send-email)
    ↓
Send Email Node
    ↓
Respond to Webhook
```

**Payload Format:**
```json
{
  "to": "email@example.com",           // or ["email1@", "email2@"]
  "subject": "Email Subject",
  "body": "Plain text body",
  "html": "<p>HTML version</p>",       // Optional
  "cc": ["cc@example.com"],            // Optional
  "bcc": ["bcc@example.com"],          // Optional
  "replyTo": "reply@example.com"       // Optional
}
```

### Webhook Workflow Structure
```
Webhook (POST /webhook/{name})
    ↓
Send Response (200 OK)
```

### Scheduled Workflow Structure
```
Schedule Trigger (runs every X minutes)
    ↓
Log Execution (no-op placeholder)
```

---

## Troubleshooting

### Error: Cannot connect to workflow service
- Make sure `npm run dev` is running in the workflow-service directory
- Check that port 3000 is not blocked

### Error: Cannot connect to n8n
- Make sure `docker-compose up` is running
- Wait 10-15 seconds for n8n to initialize
- Check n8n is accessible at `http://localhost:5678`

### Workflow creation fails
- Check n8n is running: `docker-compose ps`
- Check workflow-service logs: `npm run dev`
- Verify environment variables in `.env` are correct

---

## Next Steps

After setup:
1. ✅ Email workflows are active and ready
2. Test creating workflows via `POST /api/v1/workflows`
3. Test triggering webhooks via `POST /webhook/send-email`
4. Set up conditional logic by adding nodes to workflows
5. Configure scheduled execution for automation

For more details, see [Phase 1: Real n8n Workflows](../issues/phase-1-real-n8n-workflows.md)
