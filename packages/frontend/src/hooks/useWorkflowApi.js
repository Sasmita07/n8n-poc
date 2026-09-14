/**
 * Custom hook for workflow API interactions
 */
export function useWorkflowApi() {
  const baseUrl = 'http://localhost:3000/api/v1';

  const createWorkflow = async (workflowData) => {
    const response = await fetch(`${baseUrl}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflowData),
    });
    if (!response.ok) throw new Error('Failed to create workflow');
    return response.json();
  };

  const listWorkflows = async () => {
    const response = await fetch(`${baseUrl}/workflows`);
    if (!response.ok) throw new Error('Failed to fetch workflows');
    return response.json();
  };

  const getWorkflow = async (workflowId) => {
    const response = await fetch(`${baseUrl}/workflows/${workflowId}`);
    if (!response.ok) throw new Error('Failed to fetch workflow');
    return response.json();
  };

  const activateWorkflow = async (workflowId) => {
    const response = await fetch(
      `${baseUrl}/workflows/${workflowId}/activate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { versionId: 'v1.0.0' } }),
      },
    );
    if (!response.ok) throw new Error('Failed to activate workflow');
    return response.json();
  };

  const setupEmailWorkflow = async () => {
    const response = await fetch(`${baseUrl}/setup/email-workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to create email workflow');
    return response.json();
  };

  const sendEmail = async (emailData) => {
    const response = await fetch(`${baseUrl}/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
    if (!response.ok) throw new Error('Failed to send email');
    return response.json();
  };

  const getStates = async () => {
    const response = await fetch(`${baseUrl}/logs`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  };

  const getState = async (type, id) => {
    const response = await fetch(`${baseUrl}/states/${type}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch state');
    return response.json();
  };

  return {
    createWorkflow,
    listWorkflows,
    getWorkflow,
    activateWorkflow,
    setupEmailWorkflow,
    sendEmail,
    getStates,
    getState,
  };
}
