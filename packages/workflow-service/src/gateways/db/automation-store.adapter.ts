import type { LogModel } from '../../types/models/log.model';
import type { StateModel } from '../../types/models/state.model';
import type { WorkflowModel } from '../../types/models/workflow.model';

const automationLogs: LogModel[] = [];
const trackedStates: Record<string, StateModel> = {};
const workflows: Record<string, WorkflowModel> = {};

export function resetState(): void {
  automationLogs.length = 0;
  Object.keys(trackedStates).forEach((key) => delete trackedStates[key]);
  Object.keys(workflows).forEach((key) => delete workflows[key]);
}

export function addLog(payload: any, source = 'unknown'): LogModel {
  const log: LogModel = {
    id: automationLogs.length + 1,
    source,
    payload,
    status: 'received',
    createdAt: new Date(),
  };

  automationLogs.push(log);
  return log;
}

export function updateLog(logId: number, updates: Partial<LogModel> = {}): LogModel | null {
  const log = automationLogs.find((item) => item.id === logId);

  if (!log) {
    return null;
  }

  Object.assign(log, updates, {
    updatedAt: new Date(),
  });

  return log;
}

export function getLogs(): LogModel[] {
  return automationLogs;
}

export function storeWorkflow(workflowId: string, workflowData: any): WorkflowModel {
  workflows[workflowId] = {
    ...workflowData,
    storedAt: new Date(),
  };

  return workflows[workflowId];
}

export function getWorkflow(workflowId: string): WorkflowModel | null {
  return workflows[workflowId] || null;
}

export function getAllWorkflows(): WorkflowModel[] {
  return Object.values(workflows);
}

export function setState(key: string, state: Partial<StateModel>): StateModel {
  trackedStates[key] = {
    ...(trackedStates[key] || {}),
    ...state,
    updatedAt: new Date(),
  };

  return trackedStates[key];
}

export function getState(key: string): StateModel {
  return (
    trackedStates[key] || {
      status: 'not_found',
    }
  );
}

export function getAllStates(): Record<string, StateModel> {
  return trackedStates;
}

// Aliases for compatibility
export const setWorkflowState = setState;
export const getWorkflowState = getState;
export const getAllWorkflowStates = getAllStates;
