import { activateN8nWorkflow } from '../../../gateways/external/n8n-client.adapter';
import { setState } from '../../../gateways/db/automation-store.adapter';
import type { ActivateWorkflowRequestDto } from '../../../types/dto/request/activate-workflow-request.dto';

export async function activateWorkflowUsecase(dto: ActivateWorkflowRequestDto) {
  const { workflowId, data } = dto;

  if (!workflowId) {
    throw new Error('workflowId required');
  }

  console.log(`🚀 Triggering n8n workflow: ${workflowId}`);

  try {
    const result = await activateN8nWorkflow(workflowId, data || {});

    setState(`workflow:${workflowId}`, {
      status: 'triggered',
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: 'Workflow triggered and activated',
      result,
    };
  } catch (error: any) {
    setState(`workflow:${workflowId}`, {
      status: 'failed',
      error: error.message,
      updatedAt: new Date(),
    });
    throw error;
  }
}
