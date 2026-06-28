const express = require('express');
const {
  addLog,
  updateLog,
  getLogs,
  setWorkflowState,
  getWorkflowState,
  storeWorkflow,
  getAllWorkflowStates,
} = require('../models/automationStore');
const {
  triggerN8nWebhook,
  createN8nWorkflow,
  activateN8nWorkflow,
  getN8nWorkflowDetails,
  listN8nWorkflows,
} = require('../services/n8nService');

const router = express.Router();

router.get('/api/logs', (req, res) => {
  res.json({
    success: true,
    logs: getLogs(),
  });
});

router.get('/api/workflow-states', (req, res) => {
  res.json({
    success: true,
    states: getAllWorkflowStates(),
  });
});

router.post('/api/create-workflow', async (req, res) => {
  try {
    const workflowPayload = req.body || {};

    if (!workflowPayload.name) {
      workflowPayload.name = 'New workflow';
    }

    console.log('🛠️ Creating n8n workflow:', workflowPayload.name);

    const result = await createN8nWorkflow(workflowPayload);

    // Store workflow locally
    storeWorkflow(result.id, result);

    res.json({
      success: true,
      message: 'Workflow created',
      result,
    });
  } catch (error) {
    console.error('❌ Workflow creation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/api/activate-workflow', async (req, res) => {
  const { workflowId, data } = req.body || {};

  try {
    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'workflowId required',
      });
    }

    console.log(`🚀 Triggering n8n workflow: ${workflowId}`);

    const result = await activateN8nWorkflow(workflowId, data || {});

    setWorkflowState(`workflow:${workflowId}`, {
      status: 'triggered',
      updatedAt: new Date(),
    });

    return res.json({
      success: true,
      message: 'Workflow triggered and activated',
      result,
    });
  } catch (error) {
    console.error('❌ Workflow trigger error:', error.message);

    setWorkflowState(`workflow:${workflowId}`, {
      status: 'failed',
      error: error.message,
      updatedAt: new Date(),
    });

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/webhook/:path', async (req, res) => {
  let log;
  let n8nResult = null;
  try {
    const { path } = req.params;

    log = addLog(null, `webhook/${path}`);

    setWorkflowState(`webhook:${path}`, {
      status: 'received',
      logId: log.id,
    });

    console.log(`📬 Webhook received: ${path}`);

    setWorkflowState(`webhook:${path}`, {
      status: 'running',
      logId: log.id,
      updatedAt: new Date(),
    });

    n8nResult = await triggerN8nWebhook(path);

    if (log) {
      updateLog(log.id, {
        status: 'completed',
      });
    }

    setWorkflowState(`webhook:${path}`, {
      status: 'completed',
      logId: log.id,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      webhook: path,
      logId: log.id,
      n8nResult,
    });
  } catch (error) {
    n8nResult = { error: 'n8n unreachable', message: error.message };
    console.error(error);

    if (log) {
      updateLog(log.id, {
        status: 'failed',
        error: error.message,
      });
    }

    setWorkflowState(`webhook:${req.params.path}`, {
      status: 'failed',
      error: error.message,
      updatedAt: new Date(),
    });

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/api/workflows/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;

    console.log(`📖 Fetching workflow details: ${workflowId}`);

    const result = await getN8nWorkflowDetails(workflowId);

    // Store locally for tracking
    storeWorkflow(workflowId, result);

    res.json({
      success: true,
      message: 'Workflow details retrieved',
      workflowId,
      result,
    });
  } catch (error) {
    console.error('❌ Workflow fetch error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/api/workflows', async (req, res) => {
  try {
    console.log('📋 Fetching all workflows');

    const result = await listN8nWorkflows();

    res.json({
      success: true,
      message: 'Workflows retrieved',
      total: Array.isArray(result) ? result.length : 0,
      result,
    });
  } catch (error) {
    console.error('❌ Workflows fetch error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/api/workflow-status/:type/:id', (req, res) => {
  const { type, id } = req.params;

  const status = getWorkflowState(`${type}:${id}`);

  res.json({
    type,
    id,
    status,
    lastUpdate: new Date(),
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

module.exports = router;
