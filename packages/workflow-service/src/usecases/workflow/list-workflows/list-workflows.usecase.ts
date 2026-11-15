import { listN8nWorkflows } from '../../../gateways/external/n8n-client.adapter';

export async function listWorkflowsUsecase() {
  console.log('📋 Fetching all workflows');

  const response = await listN8nWorkflows();
  const result = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  return {
    success: true,
    message: 'Workflows retrieved',
    total: result.length,
    result,
  };
}
