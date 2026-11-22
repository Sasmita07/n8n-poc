# Create a Workflow

This reference documents the implemented workflow-creation API. For the dashboard lifecycle and approval semantics, see [End-to-End Business Flow](../architecture/end-to-end-business-flow.md).

## Endpoint

- **Method:** `POST`
- **Path:** `/api/v1/workflows`
- **Content type:** `application/json`
- **Behavior:** creates a workflow in n8n and stores a local in-memory copy. n8n is the source used by the workflow-list endpoint.

The dashboard's **Create Workflow** form uses the setup endpoints for starter webhook and scheduled workflows. This endpoint is for submitting an arbitrary n8n workflow definition.

## Request body

The validated body requires `name`, `nodes`, and `connections`. `settings` is optional. Nodes and connections follow n8n's workflow definition format; refer to n8n's node documentation for node-specific parameters.

```json
{
  "name": "purchase-review-demo",
  "nodes": [
    {
      "id": "webhook-node",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "path": "purchase-review-demo",
        "httpMethod": "POST",
        "responseMode": "onReceived",
        "options": {}
      }
    }
  ],
  "connections": {},
  "settings": {
    "executionOrder": "v1"
  }
}
```

`active` is not part of this endpoint's validated request and is removed before the payload is sent to n8n. Creation does not activate or immediately execute the workflow. Activate it separately with `POST /api/v1/workflows/:id/activate`.

For a Webhook node, the **workflow ID** returned by n8n and the node's **webhook path** are different values. The path forms a URL such as `/webhook/purchase-review-demo`; activation is required before the production webhook is registered.

## Example request

```http
POST /api/v1/workflows
Content-Type: application/json
```

```json
{
  "name": "purchase-review-demo",
  "nodes": [],
  "connections": {}
}
```

An empty node list is accepted by the current schema but does not make a useful executable workflow. Provide valid n8n nodes and connections for actual behavior.

## Successful response

The service returns `{ success, message, result }`, where `result` is n8n's workflow object, including its assigned ID and activation status.

```json
{
  "success": true,
  "message": "Workflow created",
  "result": {
    "id": "n8n-generated-id",
    "name": "purchase-review-demo",
    "active": false
  }
}
```

Use the returned `id` for workflow detail and activation routes. The local service store is in-memory and is not the authoritative workflow list; `GET /api/v1/workflows` queries n8n.

## Related endpoints

| Method | Path                             | Purpose                                              |
| ------ | -------------------------------- | ---------------------------------------------------- |
| `GET`  | `/api/v1/workflows`              | List workflows from n8n                              |
| `GET`  | `/api/v1/workflows/:id`          | Retrieve workflow details                            |
| `POST` | `/api/v1/workflows/:id/activate` | Activate a workflow; does not execute it immediately |

Interactive schemas are available at `/docs` and `/doc` while the workflow service is running.
