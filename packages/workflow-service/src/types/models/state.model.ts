export interface StateModel {
  status: string;
  logId?: number;
  error?: string;
  updatedAt?: Date;
}

export type WorkflowStateModel = StateModel;
