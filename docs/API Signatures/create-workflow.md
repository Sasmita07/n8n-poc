# POST /api/create-workflow

This endpoint is responsible for programmatically creating a new automation workflow. It validates the request body, registers the workflow with the downstream n8n service, and stores the workflow state locally.

---

## Endpoint Details

- **Method**: `POST`
- **Path**: `/api/create-workflow`
- **Content-Type**: `application/json`
- **Description**: Creates a new automation workflow both locally in the gateway database and dynamically registers it in the downstream n8n automation engine.

---

## Request Body Fields

| Field Name | Type | Mandatory / Optional | Description | Default |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | **Optional** | The user-defined display name of the workflow. | `"New workflow"` |
| `nodes` | `array` | **Mandatory** | A list of node definition objects that perform actions or trigger tasks. | `[]` |
| `connections` | `object` | **Mandatory** | A connections mapping object defining the execution links between nodes. | `{}` |
| `settings` | `object` | **Optional** | Configuration settings for workflow execution. | `{}` |
| `staticData` | `object` | **Optional** | Persistent data state container shared across executions. | `null` |
| `meta` | `object` | **Optional** | UI and positioning metadata used by the editor/canvas. | `null` |
| `tags` | `array` | **Optional** | Array of tag strings/IDs associated with the workflow. | `[]` |
| `active` | `boolean` | **Optional** | Whether the workflow is currently enabled/active. | `false` |
| `pinData` | `object` | **Optional** | Mock test data mapped to specific nodes. | `null` |

---

## Detailed Payload Schemas

### 1. Node Schema (`nodes[]`)
Each object in the `nodes` array represents an individual block/node in the workflow and must contain:

| Field Name | Type | Mandatory / Optional | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | **Mandatory** | A unique identifier for the node (usually generated UUID/short-id). | `"4f8d9b62-11a5-4b12-9c3e-8c7a2d1f9b30"` |
| `name` | `string` | **Mandatory** | Unique name of the node within this workflow. | `"Webhook Target"` |
| `type` | `string` | **Mandatory** | The internal node type name. | `"n8n-nodes-base.webhook"` |
| `typeVersion` | `number` | **Mandatory** | The version of the node type to instantiate. | `1` |
| `position` | `array` | **Mandatory** | `[x, y]` coordinates on the canvas. | `[250, 300]` |
| `parameters` | `object` | **Mandatory** | Key-value configuration specific to the node type. | `{"path": "my-webhook-path", "options": {}}` |
| `credentials` | `object` | **Optional** | Mapped authorization/credentials for the node. | `{"gitHubApi": {"id": "1"}}` |

### 2. Connections Schema (`connections`)
Defines the control flow linkages. It is an object where:
- Keys are the source node names.
- Values represent destination maps, structured as `{"main": [[{ "node": "targetNodeName", "type": "main", "index": 0 }]]}`.

### 3. Settings Schema (`settings`)
Workflow execution behavior settings:

| Field Name | Type | Mandatory / Optional | Description | Default |
| :--- | :--- | :--- | :--- | :--- |
| `saveExecutionProgress` | `boolean` | **Optional** | Whether to save execution progress step-by-step. | `false` |
| `saveManualExecutions` | `boolean` | **Optional** | Whether to log manual testing runs. | `false` |
| `saveDataErrorExecution` | `boolean` | **Optional** | Save state when execution fails. | `true` |
| `saveDataSuccessExecution`| `boolean` | **Optional** | Save state when execution succeeds. | `true` |
| `executionTimeout` | `number` | **Optional** | Max execution time allowed (seconds). | `3600` |
| `timezone` | `string` | **Optional** | Timezone ID for schedule triggers. | `"America/New_York"` |

---

## OpenAPI Spec 3.0 / 3.1 Definition

Include the following spec snippet inside your OpenAPI documentation:

```yaml
paths:
  /api/create-workflow:
    post:
      summary: Create a new workflow
      description: Validates the payload structure, creates the workflow in the downstream automation engine (n8n), and stores workflow configurations locally.
      operationId: createWorkflow
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WorkflowCreateRequest'
      responses:
        '200':
          description: Workflow successfully created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WorkflowCreateResponse'
        '400':
          description: Invalid request payload
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: Downstream connection or internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    WorkflowCreateRequest:
      type: object
      required:
        - nodes
        - connections
      properties:
        name:
          type: string
          description: Name of the workflow. Defaults to "New workflow" if omitted.
          example: My Automation Workflow
        active:
          type: boolean
          description: Whether the workflow is active.
          example: false
        nodes:
          type: array
          description: List of workflow nodes.
          items:
            $ref: '#/components/schemas/WorkflowNode'
        connections:
          type: object
          description: Links between workflow nodes.
          additionalProperties:
            type: object
            properties:
              main:
                type: array
                items:
                  type: array
                  items:
                    $ref: '#/components/schemas/WorkflowConnection'
        settings:
          $ref: '#/components/schemas/WorkflowSettings'
        staticData:
          type: object
          nullable: true
          description: Static workflow state database.
        meta:
          type: object
          nullable: true
          description: Editor metadata.
        tags:
          type: array
          items:
            type: string
          description: List of tag tags/IDs.
        pinData:
          type: object
          nullable: true
          description: Mock pinned testing data.

    WorkflowNode:
      type: object
      required:
        - id
        - name
        - type
        - typeVersion
        - position
        - parameters
      properties:
        id:
          type: string
          format: uuid
          example: 4f8d9b62-11a5-4b12-9c3e-8c7a2d1f9b30
        name:
          type: string
          example: Webhook Target
        type:
          type: string
          example: n8n-nodes-base.webhook
        typeVersion:
          type: number
          example: 1
        position:
          type: array
          items:
            type: number
          minItems: 2
          maxItems: 2
          example: [250, 300]
        parameters:
          type: object
          example:
            path: my-webhook-path
            options: {}
        credentials:
          type: object
          additionalProperties:
            type: object
            properties:
              id:
                type: string
                example: "1"

    WorkflowConnection:
      type: object
      required:
        - node
        - type
        - index
      properties:
        node:
          type: string
          description: Name of the target node.
          example: Send Email Node
        type:
          type: string
          example: main
        index:
          type: number
          example: 0

    WorkflowSettings:
      type: object
      properties:
        saveExecutionProgress:
          type: boolean
          example: false
        saveManualExecutions:
          type: boolean
          example: false
        saveDataErrorExecution:
          type: boolean
          example: true
        saveDataSuccessExecution:
          type: boolean
          example: true
        executionTimeout:
          type: number
          example: 3600
        timezone:
          type: string
          example: America/New_York

    WorkflowCreateResponse:
      type: object
      required:
        - success
        - message
        - result
      properties:
        success:
          type: boolean
          example: true
        message:
          type: string
          example: Workflow created
        result:
          type: object
          description: Raw response payload from downstream n8n service.
          properties:
            id:
              type: string
              example: "12"
            name:
              type: string
              example: My Automation Workflow
            active:
              type: boolean
              example: false
            nodes:
              type: array
              items:
                type: object
            connections:
              type: object
            createdAt:
              type: string
              format: date-time
              example: "2026-07-12T11:00:00Z"
            updatedAt:
              type: string
              format: date-time
              example: "2026-07-12T11:00:00Z"

    ErrorResponse:
      type: object
      required:
        - success
        - error
      properties:
        success:
          type: boolean
          example: false
        error:
          type: string
          example: "Mandatory field 'nodes' is missing or empty"
```

---

## Sample Payloads

### Example Request Body
```json
{
  "name": "GitHub Webhook Logger Workflow",
  "active": false,
  "nodes": [
    {
      "id": "a98f12c1-23b4-4b5a-ba6c-2f3b4c5d6e7f",
      "name": "Webhook Node",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "path": "github-webhook",
        "options": {}
      }
    },
    {
      "id": "b09e23d2-34c5-5c6b-cb7d-3g4h5i6j7k8l",
      "name": "Logger Node",
      "type": "n8n-nodes-base.log",
      "typeVersion": 1,
      "position": [450, 300],
      "parameters": {
        "message": "Received payload from GitHub: {{ $json.body }}"
      }
    }
  ],
  "connections": {
    "Webhook Node": {
      "main": [
        [
          {
            "node": "Logger Node",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "timezone": "America/New_York",
    "saveDataSuccessExecution": true
  }
}
```

### Example Successful Response (`200 OK`)
```json
{
  "success": true,
  "message": "Workflow created",
  "result": {
    "id": "18",
    "name": "GitHub Webhook Logger Workflow",
    "active": false,
    "nodes": [
      {
        "id": "a98f12c1-23b4-4b5a-ba6c-2f3b4c5d6e7f",
        "name": "Webhook Node",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [250, 300],
        "parameters": {
          "path": "github-webhook",
          "options": {}
        }
      },
      {
        "id": "b09e23d2-34c5-5c6b-cb7d-3g4h5i6j7k8l",
        "name": "Logger Node",
        "type": "n8n-nodes-base.log",
        "typeVersion": 1,
        "position": [450, 300],
        "parameters": {
          "message": "Received payload from GitHub: {{ $json.body }}"
        }
      }
    ],
    "connections": {
      "Webhook Node": {
        "main": [
          [
            {
              "node": "Logger Node",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    "settings": {
      "timezone": "America/New_York",
      "saveDataSuccessExecution": true
    },
    "createdAt": "2026-07-12T11:15:32.410Z",
    "updatedAt": "2026-07-12T11:15:32.410Z"
  }
}
```

### Example Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "error": "request/body/settings must NOT have additional properties"
}
```
