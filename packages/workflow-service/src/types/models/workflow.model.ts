export interface WorkflowModel {
  id: string;
  name: string;
  nodes?: any[];
  connections?: any;
  active?: boolean;
  storedAt: Date;
  [key: string]: any;
}
