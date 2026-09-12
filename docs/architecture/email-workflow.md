# Email Workflow Architecture

## Flow Diagram

```
Frontend Dashboard
     (Send Email Form)
           ↓
    [POST /api/v1/emails]
           ↓
    Workflow Service
  (email.router.ts)
           ↓
   (sendEmailUsecase)
           ↓
  email.adapter.ts
           ↓
  [POST /webhook/send-email]
           ↓
      N8N Instance
           ↓
   ┌──────────────┐
   │   Webhook    │ (receives: to, subject, body, html)
   │   Trigger    │
   └──────────────┘
           ↓
   ┌──────────────┐
   │ Send Email   │ (uses SMTP or configured provider)
   │    Node      │
   └──────────────┘
           ↓
   ┌──────────────┐
   │   Respond    │
   │   to         │
   │  Webhook     │
   └──────────────┘
           ↓
    {status: success}
           ↓
    Return to Frontend
```

## N8N Workflow JSON (For Import)

If n8n supports JSON import, use this structure:

```json
{
  "name": "send-email",
  "nodes": [
    {
      "parameters": {
        "path": "send-email",
        "method": "POST",
        "options": {}
      },
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "fromEmail": "notifications@example.com",
        "toEmail": "={{ $json.to }}",
        "subject": "={{ $json.subject }}",
        "textBody": "={{ $json.body }}",
        "htmlBody": "={{ $json.html }}",
        "options": {}
      },
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [450, 300]
    },
    {
      "parameters": {
        "responseCode": 200,
        "options": {}
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Send Email",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send Email": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Key Fields Mapping

| Field | Source | Example |
|-------|--------|---------|
| `to` | Request body | `user@example.com` |
| `subject` | Request body | `Workflow Notification` |
| `body` | Request body | `Your workflow completed` |
| `html` | Request body (optional) | `<h1>Notification</h1>` |
| `cc` | Request body (optional) | `manager@example.com` |
| `bcc` | Request body (optional) | `audit@example.com` |

## SMTP Configuration (Optional)

If using email providers like Gmail, SendGrid, etc., configure in n8n:

1. Go to n8n Settings → Credentials
2. Add email credential (Gmail, SendGrid, SMTP, etc.)
3. In Send Email node, select the credential
4. Map `fromEmail` to the configured sender
