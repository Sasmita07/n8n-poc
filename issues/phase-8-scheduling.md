# Issue: Phase 8 – Scheduling

## Status

🟡 **BASIC POC IMPLEMENTED** — The dashboard/setup API can create a recurring n8n Schedule Trigger with an interval. One-time delayed jobs, advanced cron management, and durable schedule administration are not implemented.

## Summary

Enable scheduled workflow execution and recurring automation.

## Goals

- Support cron expressions
- Allow delayed workflow execution
- Enable recurring workflows

## Acceptance Criteria

- Workflows can be scheduled for future execution
- Scheduled and recurring jobs are tracked reliably
- Users can view and manage schedule configurations

## Notes

Scheduling is essential for time-based automation and repeated tasks. The existing setup creates a basic recurring workflow; see [Workflow Setup via API](../docs/setup/workflow-setup-api.md#setup-scheduled-workflow).
