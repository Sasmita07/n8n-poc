# Issue: Phase 2 – Human-in-the-Loop Automation

## Summary

Add approval and human decision steps to workflows for human-in-the-loop automation.

## Status

✅ POC FLOW COMPLETE - The dashboard creates/reviews requests, the service starts configured n8n request and decision workflows, and failures/decision state are visible. Durable storage and authenticated approver identity remain follow-up work.

## Goals

- ✅ Create approval requests from a workflow or API trigger
- ✅ Send approval emails to the designated stakeholder
- ✅ Capture pending, approved, and rejected decision states
- ✅ Provide dashboard controls to create, view, approve, and reject requests
- ✅ Expose a continuation gate that is true only after approval
- ✅ Trigger n8n on request creation and decision so business actions run in the corresponding event workflow
- ✅ Prevent decision changes after resolution and allow retrying a failed n8n handoff

## Acceptance Criteria

### ✅ Human approval requests can be created and tracked

- Backend endpoint: POST /api/v1/approvals creates a pending approval record
- State tracking: approval state is stored under approval:{id}
- Email notification: approval request is sent to the approver via the existing email webhook flow
- n8n handoff: the configured approval request webhook receives an `approval.requested` event

### ✅ Approval state is captured and reflected in execution state

- Each approval request records workflowId, requester, approver, subject, body, status, and timestamps
- Decision endpoint updates status and canContinue flag based on approval result
- GET /api/v1/approvals/:id returns the current approval record and decision state

### ✅ Workflow continuation is gated on approval

- Decision payload accepts approved or rejected
- Approved requests set canContinue=true
- Rejected or missing decisions remain blocked until approved
- The dashboard only enables decisions for pending requests
- Decision event: an `approval.decision` event is sent to the configured n8n decision workflow
- Failed decision dispatch is surfaced and can be retried by resubmitting the same decision
- Repeating an already-dispatched identical decision does not dispatch the downstream event again

### ✅ Approval flow is available from the dashboard

- Approvals tab provides a form to create and email an approval request
- Approval inbox lists pending and resolved requests
- Reviewer can approve or reject a pending request and see the updated status

## Implementation Details

### Backend additions

- Approval router mounted in the app at /api/v1/approvals
- New approval use cases for create, read, and decision update flows
- State persistence added to the shared automation store for approvals
- Email notification triggered when an approval request is created
- Request and decision webhook paths are configurable using `N8N_APPROVAL_REQUEST_WEBHOOK_PATH` and `N8N_APPROVAL_DECISION_WEBHOOK_PATH`
- Dashboard surfaces request/notification/continuation handoff state and supports continuation retry
- Frontend ApprovalDashboard provides the Phase 2 user interface

### API endpoints

| Method | Path                           | Description                           |
| ------ | ------------------------------ | ------------------------------------- |
| POST   | /api/v1/approvals              | Create a pending approval request     |
| GET    | /api/v1/approvals/:id          | Retrieve the approval state           |
| POST   | /api/v1/approvals/:id/decision | Record approval or rejection decision |

### n8n event contract

- `approval.requested`: delivered to the configured request webhook when a dashboard request is submitted
- `approval.decision`: delivered to the configured decision webhook after the assigned approver records an outcome
- Both events include the stable `approvalId`; n8n side effects should be idempotent on this identifier
- The decision webhook should branch to approved business actions or rejection handling

### Approval states

- pending: created and awaiting human review
- approved: decision recorded and workflow may continue
- rejected: decision recorded and continuation remains blocked

## Verification

Focused regression coverage for Phase 2 was added and passes:

- Tests: 5 passed
- Test files: 1 passed
- Commands used: `npm run build` and `npm test -- --run tests/approval.test.ts`

## Notes

This phase implements an event-driven request/decision business flow: the request and decision each start their own n8n execution. It does not resume a single suspended n8n execution. Approval state is in memory and will be lost on restart. The current POC does not authenticate approvers, enforce roles, or provide durable audit storage; do not use it for sensitive approvals until those gaps are addressed. Configure and activate both n8n webhook workflows as described in [Workflow Setup via API](../docs/setup/workflow-setup-api.md#approval-workflow-integration).
