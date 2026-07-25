# Issue: Phase 2 – Human-in-the-Loop Automation

## Summary

Add approval and human decision steps to workflows for human-in-the-loop automation.

## Goals

- Create request workflows triggered via webhook
- Send approval emails to stakeholders
- Wait for approval responses before continuing
- Continue workflow execution after approval

## Acceptance Criteria

- Workflows can pause for human approval
- Approval state is captured and reflected in execution logs
- Workflow continues only after approval is granted

## Notes

This phase builds event-driven automation that requires human validation before completion.
