// In-memory store for n8n Automation POC
const automationLogs = [];
const workflowStates = {};
const workflows = {};
/**
 * Reset store (useful for tests/demo)
 */
function resetState() {
  automationLogs.length = 0;

  Object.keys(workflowStates).forEach((key) => delete workflowStates[key]);
  Object.keys(workflows).forEach((key) => delete workflows[key]);
}

/**
 * Add incoming webhook/event log
 */
function addLog(payload, source = 'unknown') {
  const log = {
    id: automationLogs.length + 1,
    source,
    payload,
    status: 'received',
    createdAt: new Date(),
  };

  automationLogs.push(log);

  return log;
}

/**
 * Update an existing log
 */
function updateLog(logId, updates = {}) {
  const log = automationLogs.find((item) => item.id === logId);

  if (!log) {
    return null;
  }

  Object.assign(log, updates, {
    updatedAt: new Date(),
  });

  return log;
}

/**
 * Get all logs
 */
function getLogs() {
  return automationLogs;
}

/**
 * Store workflow metadata
 */
function storeWorkflow(workflowId, workflowData) {
  workflows[workflowId] = {
    ...workflowData,
    storedAt: new Date(),
  };

  return workflows[workflowId];
}

/**
 * Get workflow by ID
 */
function getWorkflow(workflowId) {
  return workflows[workflowId] || null;
}

/**
 * Get all workflows
 */
function getAllWorkflows() {
  return Object.values(workflows);
}

/**
 * Track workflow execution state
 */
function setWorkflowState(workflowId, state) {
  workflowStates[workflowId] = {
    ...(workflowStates[workflowId] || {}),
    ...state,
    updatedAt: new Date(),
  };

  return workflowStates[workflowId];
}

/**
 * Get workflow execution state
 */
function getWorkflowState(workflowId) {
  return (
    workflowStates[workflowId] || {
      status: 'not_found',
    }
  );
}

/**
 * Get all workflow states
 */
function getAllWorkflowStates() {
  return workflowStates;
}

module.exports = {
  // Logs
  addLog,
  updateLog,
  getLogs,

  // Workflow metadata
  storeWorkflow,
  getWorkflow,
  getAllWorkflows,

  // Workflow execution state
  setWorkflowState,
  getWorkflowState,
  getAllWorkflowStates,

  // Reset
  resetState,
};
