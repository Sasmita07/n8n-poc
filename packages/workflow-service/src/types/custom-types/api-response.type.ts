export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  result?: T;
  [key: string]: any;
}
