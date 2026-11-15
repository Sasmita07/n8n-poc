export type ApprovalErrorStatus = 400 | 403 | 404 | 409 | 502;

export class ApprovalError extends Error {
  constructor(message: string, public readonly statusCode: ApprovalErrorStatus) {
    super(message);
    this.name = 'ApprovalError';
  }
}
