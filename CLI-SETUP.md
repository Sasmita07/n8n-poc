# CLI Commands to Create Workflows

No Postman? No problem! Use these commands to create workflows via CLI.

## Fastest Way - NPM Scripts

### Setup All Workflows (Recommended)
```bash
cd packages/workflow-service
npm run setup
```

This creates:
- Email workflow (`send-email`)
- Webhook workflow (`webhook-trigger`)
- Scheduled workflow (`daily-job` - daily)

### Setup Individually

**Email only:**
```bash
npm run setup:email
```

**Webhook only:**
```bash
npm run setup:webhook
```

**Scheduled only:**
```bash
npm run setup:scheduled
```

---

## Using cURL Commands

First, make sure services are running:

```bash
# Terminal 1: Start n8n
docker-compose up

# Terminal 2: Start workflow service
cd packages/workflow-service
npm run dev

# Terminal 3: Run these curl commands
```

### Create Email Workflow
```bash
curl -X POST http://localhost:3000/api/v1/setup/email-workflow \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email workflow created and activated",
  "workflowId": "12345"
}
```

### Create Webhook Workflow
```bash
curl -X POST http://localhost:3000/api/v1/setup/webhook-workflow \
  -H "Content-Type: application/json" \
  -d '{"name": "my-webhook"}'
```

### Create Scheduled Workflow
```bash
curl -X POST http://localhost:3000/api/v1/setup/scheduled-workflow \
  -H "Content-Type: application/json" \
  -d '{"name": "daily-job", "intervalMinutes": 1440}'
```

### Test Email Sending
```bash
curl -X POST http://localhost:3000/api/v1/emails \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email"
  }'
```

### List All Workflows
```bash
curl -X GET http://localhost:3000/api/v1/workflows
```

### Check Service Health
```bash
curl -X GET http://localhost:3000/health
```

---

## Complete Step-by-Step Setup

### 1️⃣ Start Docker Container (n8n)
```bash
cd /Users/sas_vsCodeWorkspace/n8n-poc
docker-compose up
```
Wait 10-15 seconds for n8n to start. You should see:
```
n8n is now available on: http://localhost:5678
```

### 2️⃣ Start Workflow Service (in new terminal)
```bash
cd /Users/sas_vsCodeWorkspace/n8n-poc/packages/workflow-service
npm install
npm run dev
```
Wait for it to say:
```
✅ Server running on http://localhost:3000
```

### 3️⃣ Create All Workflows (in new terminal)
```bash
cd /Users/sas_vsCodeWorkspace/n8n-poc/packages/workflow-service
npm run setup
```

You should see output like:
```
🔧 Setting up email workflow in n8n...
✅ Email workflow created: 12345
🔧 Creating webhook workflow: webhook-trigger
✅ Webhook workflow created: 12346
🔧 Creating scheduled workflow: daily-job (every 1440 min)
✅ Scheduled workflow created: 12347
```

### 4️⃣ Test Email Sending
```bash
curl -X POST http://localhost:3000/api/v1/emails \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "Hello from n8n POC!"
  }'
```

Should return:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "result": { ... }
}
```

### 5️⃣ Verify Workflows Created
```bash
curl -X GET http://localhost:3000/api/v1/workflows
```

---

## Command Reference Table

| Task | Command |
|------|---------|
| Setup all workflows | `npm run setup` |
| Setup email only | `npm run setup:email` |
| Setup webhook only | `npm run setup:webhook` |
| Setup scheduled only | `npm run setup:scheduled` |
| Start dev server | `npm run dev` |
| Run tests | `npm run test` |
| Start n8n | `docker-compose up` |
| Stop n8n | `docker-compose down` |

---

## Using the Bash Script

I've created a helper script you can run:

```bash
chmod +x setup-workflows.sh
./setup-workflows.sh
```

This will run all the curl commands automatically.

---

## Verification Checklist

After setup, verify:

```bash
# 1. Service is running
curl http://localhost:3000/health
# Should return: {"status":"ok"}

# 2. Workflows created
curl http://localhost:3000/api/v1/workflows
# Should list at least 1 workflow

# 3. Email workflow works
curl -X POST http://localhost:3000/api/v1/emails \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Test"}'
# Should return: {"success":true}
```

---

## Next: Test via Frontend

Once workflows are created via CLI, test via dashboard:

```bash
cd packages/frontend
npm run dev
```

Go to `http://localhost:5173` and try sending an email!

---

## Troubleshooting

### Error: Connection refused on :3000
- Make sure `npm run dev` is running in workflow-service folder

### Error: Cannot connect to n8n
- Make sure `docker-compose up` is running
- Wait 15 seconds for n8n to initialize
- Check `docker-compose ps`

### Error: No such file or directory: setup-workflows.sh
- Run: `chmod +x setup-workflows.sh`
- Make sure you're in the repo root directory

### Email sending fails
- Verify n8n is running: `docker-compose ps`
- Check workflow was created: `curl http://localhost:3000/api/v1/workflows`
- Review logs: `npm run dev` (output in terminal)
