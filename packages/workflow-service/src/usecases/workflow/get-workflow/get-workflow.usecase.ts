import { getN8nWorkflowDetails } from '../../../gateways/external/n8n-client.adapter';
import { storeWorkflow } from '../../../gateways/db/automation-store.adapter';

export async function getWorkflowUsecase(workflowId: string) {
  console.log(`📖 Fetching workflow details: ${workflowId}`);

  const result = await getN8nWorkflowDetails(workflowId);
  storeWorkflow(workflowId, result);

  return {
    success: true,
    message: 'Workflow details retrieved',
    workflowId,
    result,
  };
}
