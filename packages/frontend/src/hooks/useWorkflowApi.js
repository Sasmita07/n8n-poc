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

  const setupWebhookWorkflow = async (name) => {
    const response = await fetch(`${baseUrl}/setup/webhook-workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || 'Failed to create webhook workflow');
    return data;
  };

  const setupScheduledWorkflow = async (name, intervalMinutes) => {
    const response = await fetch(`${baseUrl}/setup/scheduled-workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, intervalMinutes }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || 'Failed to create scheduled workflow');
    return data;
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

  const createApproval = async (approvalData) => {
    const response = await fetch(`${baseUrl}/approvals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalData),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || 'Failed to create approval request');
    return data;
  };

  const getApprovals = async () => {
    const response = await fetch(`${baseUrl}/states`);
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || 'Failed to fetch approval requests');
    return Object.entries(data.states || {})
      .filter(([key]) => key.startsWith('approval:'))
      .map(([key, state]) => ({
        ...state,
        id: state.id || key.slice('approval:'.length),
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.updatedAt || 0) -
          new Date(a.createdAt || a.updatedAt || 0),
      );
  };

  const updateApprovalDecision = async (
    approvalId,
    decision,
    approver,
    reason,
  ) => {
    const response = await fetch(
      `${baseUrl}/approvals/${encodeURIComponent(approvalId)}/decision`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, approver, reason }),
      },
    );
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || 'Failed to record approval decision');
    return data;
  };

  const analyzeAiDecision = async (decisionData) => {
    const response = await fetch(`${baseUrl}/ai/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decisionData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'AI analysis failed');
    return data.result;
  };

  const retryAiDecision = async (decisionId) => {
    const response = await fetch(
      `${baseUrl}/ai/decisions/${encodeURIComponent(decisionId)}/retry`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'AI handoff retry failed');
    return data.result;
  };

  return {
    createWorkflow,
    listWorkflows,
    getWorkflow,
    activateWorkflow,
    setupEmailWorkflow,
    setupWebhookWorkflow,
    setupScheduledWorkflow,
    sendEmail,
    getStates,
    getState,
    createApproval,
    getApprovals,
    updateApprovalDecision,
    analyzeAiDecision,
    retryAiDecision,
  };
}
