#!/bin/bash

# n8n POC - Curl Test Examples

echo "🧪 Testing n8n POC Endpoints..."

# 1. Health Check
echo "\n1️⃣ Health Check:"
curl -X GET http://localhost:3000/health | jq .

# 2. Send Webhook Data
echo "\n\n2️⃣ Send Webhook Data:"
curl -X POST http://localhost:3000/webhook/automation \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "workflow_001",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "data": {
      "userId": "user_123",
      "action": "signup",
      "email": "john@example.com"
    }
  }' | jq .

# 3. Get Logs
echo "\n\n3️⃣ Get Automation Logs:"
curl -X GET http://localhost:3000/api/logs | jq .

# 4. Check Workflow Status
echo "\n\n4️⃣ Check Workflow Status:"
curl -X GET http://localhost:3000/api/workflow-status/workflow_001 | jq .

# 5. Trigger n8n Workflow
echo "\n\n5️⃣ Trigger n8n Workflow:"
curl -X POST http://localhost:3000/api/trigger-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "123",
    "data": {
      "message": "Hello from Node.js",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }' | jq .

echo "\n\n✅ Tests completed!"