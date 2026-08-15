import { createN8nWorkflow } from '../../../gateways/external/n8n-client.adapter';
import { storeWorkflow } from '../../../gateways/db/automation-store.adapter';
import type { CreateWorkflowRequestDto } from '../../../types/dto/request/create-workflow-request.dto';

export async function createWorkflowUsecase(payload: CreateWorkflowRequestDto) {
  const workflowPayload = { ...payload };

  if (!workflowPayload.name) {
    workflowPayload.name = 'New workflow';
  }

  console.log('🛠️ Creating n8n workflow:', workflowPayload.name);

  const result = await createN8nWorkflow(workflowPayload);
  storeWorkflow(result.id, result);

  return {
    success: true,
    message: 'Workflow created',
    result,
  };
}
