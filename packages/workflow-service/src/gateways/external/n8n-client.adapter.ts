import axios from 'axios';
import { envConfig } from '../../config/env.config';

function getN8nHeaders(useApiKey = true): Record<string, string> {
  const key = envConfig.n8nApiKey?.trim();
  const headers: Record<string, string> = {};

  if (key && useApiKey) {
    headers['X-N8N-API-KEY'] = key;
  }

  return headers;
}

function getN8nErrorMessage(error: any, fallback: string) {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData === 'object') {
    if (typeof responseData.message === 'string') {
      return responseData.message;
    }
    if (typeof responseData.error === 'string') {
      return responseData.error;
    }
  }

  return fallback;
}

async function retryWithoutApiKeyIfUnauthorized<T>(
  request: (headers: Record<string, string>) => Promise<T>,
) {
  try {
    return await request(getN8nHeaders(true));
  } catch (error: any) {
    if (error?.response?.status === 401 && envConfig.n8nApiKey?.trim()) {
      return await request(getN8nHeaders(false));
    }
    throw error;
  }
}

export async function createN8nWorkflow(workflowPayload: any) {
  const url = `${envConfig.n8nUrl}/api/v1/workflows`;

  console.log(`Calling: ${url}`);

  try {
    const response = await retryWithoutApiKeyIfUnauthorized(async (headers) => {
      return axios.post(url, workflowPayload, {
        headers,
        timeout: 30000,
      });
    });
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const message = getN8nErrorMessage(
      error,
      'Invalid workflow payload sent to n8n',
    );

    if (status === 400) {
      throw new Error(`Invalid workflow payload sent to n8n: ${message}`);
    }

    if (status === 401) {
      throw new Error(`n8n authentication failed: ${message}`);
    }

    throw error;
  }
}

export async function activateN8nWorkflow(workflowId: string, data: any) {
  const url = `${envConfig.n8nUrl}/api/v1/workflows/${workflowId}/activate`;

  console.log(`🔄 Activating workflow: ${url}`);

  try {
    const response = await retryWithoutApiKeyIfUnauthorized(async (headers) => {
      return axios.post(url, data, {
        headers,
        timeout: 30000,
      });
    });
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 404) {
      throw new Error(`Workflow ${workflowId} not found in n8n`);
    }

    if (status === 409) {
      const message = getN8nErrorMessage(
        error,
        `Workflow ${workflowId} could not be activated because of a conflict`,
      );
      throw new Error(`n8n workflow activation conflict: ${message}`);
    }

    throw error;
  }
}

export async function triggerN8nWebhook(
  path: string,
  method: string = 'GET',
  data: any = null,
) {
  const url = `${envConfig.n8nUrl}/webhook/${path}`;

  console.log(`➡️ Forwarding ${method} event to ${url}`);

  const response = await retryWithoutApiKeyIfUnauthorized(async (headers) => {
    return axios.request({
      method,
      url,
      data: method !== 'GET' ? data : undefined,
      headers,
      timeout: 30000,
    });
  });

  return response.data;
}

export async function getN8nWorkflowDetails(workflowId: string) {
  const url = `${envConfig.n8nUrl}/api/v1/workflows/${workflowId}`;

  console.log(`Calling: ${url}`);

  try {
    const response = await retryWithoutApiKeyIfUnauthorized(async (headers) => {
      return axios.get(url, {
        headers,
        timeout: 30000,
      });
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
    const response = await retryWithoutApiKeyIfUnauthorized(async (headers) => {
      return axios.get(url, {
        headers,
        timeout: 30000,
      });
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}
