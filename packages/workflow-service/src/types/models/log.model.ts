export interface LogModel {
  id: number;
  source: string;
  payload: any;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  error?: string;
}
