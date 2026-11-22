import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const systemWorkflowNames = new Set([
  'send-email',
  'approval-request',
  'approval-decision',
  'ai-decision',
]);

export function isSystemWorkflow(workflow) {
  return systemWorkflowNames.has(workflow?.name?.trim().toLowerCase());
}
