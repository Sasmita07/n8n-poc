const axios = require('axios');

async function createN8nWorkflow(workflowPayload) {
  const n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY;
  const url = `${n8nUrl}/api/v1/workflows`;

  console.log(`Calling: ${url}`);

  try {
    const response = await axios.post(url, workflowPayload, {
      headers: apiKey
        ? {
            'X-N8N-API-KEY': apiKey,
          }
        : {},
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error('Invalid workflow payload sent to n8n');
    }
    throw error;
  }
}

async function activateN8nWorkflow(workflowId, data) {
  const n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY;
  const url = `${n8nUrl}/api/v1/workflows/${workflowId}/activate`;

  console.log(`🔄 Activating workflow: ${url}`);

  try {
    const response = await axios.post(url, data, {
      headers: apiKey
        ? {
            'X-N8N-API-KEY': apiKey,
          }
        : {},
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Workflow ${workflowId} not found in n8n`);
    }
    throw error;
  }
}

async function triggerN8nWebhook(path) {
  const n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY;

  const url = `${n8nUrl}/webhook/${path}`;

  console.log(`➡️ Forwarding event to ${url}`);

  const response = await axios.get(url, {
    headers: apiKey
      ? {
          'X-N8N-API-KEY': apiKey,
        }
      : {},
    timeout: 30000,
  });

  return response.data;
}

async function getN8nWorkflowDetails(workflowId) {
  const n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY;
  const url = `${n8nUrl}/api/v1/workflows/${workflowId}`;

  console.log(`Calling: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: apiKey
        ? {
            'X-N8N-API-KEY': apiKey,
          }
        : {},
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Workflow ${workflowId} not found in n8n`);
    }
    throw error;
  }
}

async function listN8nWorkflows() {
  const n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY;
  const url = `${n8nUrl}/api/v1/workflows`;

  console.log(`Calling: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: apiKey
        ? {
            'X-N8N-API-KEY': apiKey,
          }
        : {},
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  triggerN8nWebhook,
  createN8nWorkflow,
  activateN8nWorkflow,
  getN8nWorkflowDetails,
  listN8nWorkflows,
};
