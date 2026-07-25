import axios from 'axios';
import { envConfig } from '../../config/env.config';

export async function createN8nWorkflow(workflowPayload: any) {
  const url = `${envConfig.n8nUrl}/api/v1/workflows`;

  console.log(`Calling: ${url}`);

  try {
    const response = await axios.post(url, workflowPayload, {
      headers: envConfig.n8nApiKey
        ? {
            'X-N8N-API-KEY': envConfig.n8nApiKey,
          }
        : {},
      timeout: 30000,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('Invalid workflow payload sent to n8n');
    }
    throw error;
  }
}

export async function activateN8nWorkflow(workflowId: string, data: any) {
  const url = `${envConfig.n8nUrl}/api/v1/workflows/${workflowId}/activate`;

  console.log(`🔄 Activating workflow: ${url}`);

  try {
    const response = await axios.post(url, data, {
      headers: envConfig.n8nApiKey
        ? {
            'X-N8N-API-KEY': envConfig.n8nApiKey,
          }
        : {},
      timeout: 30000,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Workflow ${workflowId} not found in n8n`);
    }
    throw error;
  }
}

export async function triggerN8nWebhook(path: string, method: string = 'GET', data: any = null) {
  const url = `${envConfig.n8nUrl}/webhook/${path}`;

  console.log(`➡️ Forwarding ${method} event to ${url}`);

  const response = await axios.request({
    method,
    url,
    data: method !== 'GET' ? data : undefined,
    headers: envConfig.n8nApiKey
      ? {
          'X-N8N-API-KEY': envConfig.n8nApiKey,
        }
      : {},
    timeout: 30000,
  });

  return response.data;
}

export async function getN8nWorkflowDetails(workflowId: string) {
  const url = `${envConfig.n8nUrl}/api/v1/workflows/${workflowId}`;

  console.log(`Calling: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: envConfig.n8nApiKey
        ? {
            'X-N8N-API-KEY': envConfig.n8nApiKey,
          }
        : {},
      timeout: 30000,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Workflow ${workflowId} not found in n8n`);
    }
    throw error;
  }
}

export async function listN8nWorkflows() {
  const url = `${envConfig.n8nUrl}/api/v1/workflows`;

  console.log(`Calling: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: envConfig.n8nApiKey
        ? {
            'X-N8N-API-KEY': envConfig.n8nApiKey,
          }
        : {},
      timeout: 30000,
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
