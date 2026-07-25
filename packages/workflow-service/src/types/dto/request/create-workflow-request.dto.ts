export interface CreateWorkflowRequestDto {
  name?: string;
  nodes?: any[];
  connections?: any;
  [key: string]: any;
}
