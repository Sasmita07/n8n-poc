const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('combined'));
app.use(express.json());

// In-memory store for automation logs (replace with DB in production)
const automationLogs = [];
const workflowStates = {};

// ============================================
// 1. WEBHOOK ENDPOINT - Receive data from n8n
// ============================================
app.post('/webhook/automation', (req, res) => {
  try {
    const logId = uuidv4();
    const timestamp = new Date();

    console.log('📬 Received n8n webhook:', req.body);

    const log = {
      id: logId,
      timestamp,
      source: 'n8n_webhook',
      data: req.body,
      status: 'received'
    };

    automationLogs.push(log);

    // Process the automation
    const result = processAutomation(req.body, logId);

    res.json({
      success: true,
      logId,
      message: 'Automation processed',
      result
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 2. TRIGGER N8N WORKFLOW
// ============================================
app.post('/api/trigger-workflow', async (req, res) => {
  try {
    const { workflowId, data } = req.body;

    if (!workflowId) {
      return res.status(400).json({ error: 'workflowId required' });
    }

    console.log(`🚀 Triggering n8n workflow: ${workflowId}`);

    const result = await triggerN8nWorkflow(workflowId, data || {});

    res.json({
      success: true,
      message: 'Workflow triggered',
      result
    });
  } catch (error) {
    console.error('❌ Workflow trigger error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 3. GET AUTOMATION LOGS
// ============================================
app.get('/api/logs', (req, res) => {
  res.json({
    total: automationLogs.length,
    logs: automationLogs
  });
});

// ============================================
// 4. GET WORKFLOW STATUS
// ============================================
app.get('/api/workflow-status/:workflowId', (req, res) => {
  const { workflowId } = req.params;
  const status = workflowStates[workflowId] || 'not_found';

  res.json({
    workflowId,
    status,
    lastUpdate: new Date()
  });
});

// ============================================
// 5. HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Trigger n8n workflow via API
 */
async function triggerN8nWorkflow(workflowId, data) {
  const n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY;

  const url = `${n8nUrl}/api/v1/workflows/${workflowId}/execute`;

  console.log(`Calling: ${url}`);

  try {
    const response = await axios.post(url, data, {
      headers: apiKey ? { 'X-N8N-API-KEY': apiKey } : {},
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Workflow ${workflowId} not found in n8n`);
    }
    throw error;
  }
}

/**
 * Process automation data
 */
function processAutomation(data, logId) {
  console.log('⚙️ Processing automation:', data);

  // Example: Extract and transform data
  const processed = {
    id: logId,
    originalData: data,
    processedAt: new Date(),
    transformations: {
      dataCount: Object.keys(data).length,
      hasTimestamp: !!data.timestamp,
      status: 'processed'
    }
  };

  // Store workflow state
  if (data.workflowId) {
    workflowStates[data.workflowId] = 'completed';
  }

  return processed;
}

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`
✅ n8n POC Server running on http://localhost:${PORT}
`);
  console.log('Available endpoints:');
  console.log('  POST   /webhook/automation       - Receive n8n webhook data');
  console.log('  POST   /api/trigger-workflow     - Trigger n8n workflow');
  console.log('  GET    /api/logs                 - View automation logs');
  console.log('  GET    /api/workflow-status/:id  - Check workflow status');
  console.log('  GET    /health                   - Health check');
  console.log('');
});

module.exports = app;
