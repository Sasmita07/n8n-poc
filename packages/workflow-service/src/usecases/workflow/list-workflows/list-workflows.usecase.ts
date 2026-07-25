import { listN8nWorkflows } from '../../../gateways/external/n8n-client.adapter';

export async function listWorkflowsUsecase() {
  console.log('📋 Fetching all workflows');

  const result = await listN8nWorkflows();

  return {
    success: true,
    message: 'Workflows retrieved',
    total: Array.isArray(result) ? result.length : 0,
    result,
  };
}
