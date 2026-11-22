# Issue: Phase 9 – Notifications

## Status

🟡 **PARTIALLY IMPLEMENTED** — Email notifications are available through the n8n `send-email` workflow. Slack, Teams, Discord, per-workflow notification settings, and general completion/failure alert policies remain planned.

## Summary

Integrate notification channels for workflow events and alerts.

## Goals

- Add Slack integration
- Add Microsoft Teams integration
- Add Discord integration
- Add email notification support

## Acceptance Criteria

- Workflow events can be sent to external messaging platforms
- Notification settings can be configured per workflow
- Alerts are delivered on workflow completion or failure

## Notes

Notifications help stakeholders stay informed about automation outcomes. Approval email setup and credential requirements are documented in the [Email Setup Guide](../docs/setup/email-setup.md).
