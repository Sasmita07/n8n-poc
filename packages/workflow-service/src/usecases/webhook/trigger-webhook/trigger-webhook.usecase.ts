import { addLog, updateLog, setState } from '../../../gateways/db/automation-store.adapter';
import { triggerN8nWebhook } from '../../../gateways/external/n8n-client.adapter';

export async function triggerWebhookUsecase(path: string, method: string = 'GET', body: any = null) {
  let log: any;
  let n8nResult: any = null;

  try {
    log = addLog(body, `webhook/${path}`);

    setState(`webhook:${path}`, {
      status: 'received',
      logId: log.id,
    });

    console.log(`📬 Webhook received: ${method} ${path}`);

    setState(`webhook:${path}`, {
      status: 'running',
      logId: log.id,
      updatedAt: new Date(),
    });

    n8nResult = await triggerN8nWebhook(path, method, body);

    if (log) {
      updateLog(log.id, {
        status: 'completed',
      });
    }

    setState(`webhook:${path}`, {
      status: 'completed',
      logId: log.id,
      updatedAt: new Date(),
    });

    return {
      success: true,
      webhook: path,
      logId: log.id,
      n8nResult,
    };
  } catch (error: any) {
    n8nResult = { error: 'n8n unreachable', message: error.message };
    console.error(error);

    if (log) {
      updateLog(log.id, {
        status: 'failed',
        error: error.message,
      });
    }

    setState(`webhook:${path}`, {
      status: 'failed',
      error: error.message,
      updatedAt: new Date(),
    });

    throw error;
  }
}
