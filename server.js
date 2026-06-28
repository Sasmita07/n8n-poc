const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const automationRoutes = require('./routes/automation');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------
// Middleware
// --------------------
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Health Check
// --------------------
app.get('/', (req, res) => {
  res.json({
    service: 'n8n Automation POC',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date(),
  });
});

// --------------------
// Automation Routes
// --------------------
app.use('/', automationRoutes);

// --------------------
// Global Error Handler
// --------------------
app.use(errorHandler);

// --------------------
// Start Server
// --------------------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('=======================================');
    console.log('🚀 n8n Automation Gateway Started');
    console.log('=======================================');
    console.log(`Server : http://localhost:${PORT}`);
    console.log(`n8n    : ${process.env.N8N_URL || 'http://localhost:5678'}`);
    console.log('');
    console.log('Available Endpoints');
    console.log('---------------------------------------');
    console.log('POST  /webhook/:path');
    console.log('      Receive event & forward to n8n');
    console.log('');
    console.log('POST  /api/create-workflow');
    console.log('      Create workflow in n8n');
    console.log('');
    console.log('POST  /api/trigger-workflow');
    console.log('      Activate workflow');
    console.log('');
    console.log('GET   /api/workflows');
    console.log('      List workflows');
    console.log('');
    console.log('GET   /api/workflows/:workflowId');
    console.log('      Workflow details');
    console.log('');
    console.log('GET   /api/workflow-status/:workflowId');
    console.log('      Execution status');
    console.log('');
    console.log('GET   /health');
    console.log('      Health check');
    console.log('=======================================');
  });
}

module.exports = app;
