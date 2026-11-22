import { listN8nExecutions } from '../../../gateways/external/n8n-client.adapter';

export async function listExecutionsUsecase() {
  const response = await listN8nExecutions();
  const executions = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  return {
    success: true,
    message: 'n8n executions retrieved',
    total: executions.length,
    logs: executions,
    result: executions,
    nextCursor: response?.nextCursor ?? null,
  };
}
