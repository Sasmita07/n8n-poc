#!/usr/bin/env node

/**
 * CLI Script to initialize workflows in n8n
 * Usage: npx ts-node scripts/setup-workflows.ts
 */

import axios from 'axios';

const WORKFLOW_SERVICE_URL = process.env.WORKFLOW_SERVICE_URL || 'http://localhost:3000';

interface SetupResult {
  success: boolean;
  message: string;
  workflowId?: string;
}

async function setupEmailWorkflow(): Promise<SetupResult> {
  try {
    console.log('📧 Setting up email workflow...');
    const response = await axios.post(`${WORKFLOW_SERVICE_URL}/api/v1/setup/email-workflow`);
    console.log('✅ Email workflow created:', response.data.workflowId);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to setup email workflow:', error.message);
    throw error;
  }
}

async function setupWebhookWorkflow(name: string): Promise<SetupResult> {
  try {
    console.log(`🔗 Setting up webhook workflow: ${name}...`);
    const response = await axios.post(`${WORKFLOW_SERVICE_URL}/api/v1/setup/webhook-workflow`, {
      name,
    });
    console.log('✅ Webhook workflow created:', response.data.workflowId);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to setup webhook workflow:', error.message);
    throw error;
  }
}

async function setupScheduledWorkflow(name: string, intervalMinutes?: number): Promise<SetupResult> {
  try {
    console.log(`⏰ Setting up scheduled workflow: ${name}...`);
    const response = await axios.post(
      `${WORKFLOW_SERVICE_URL}/api/v1/setup/scheduled-workflow`,
      {
        name,
        intervalMinutes,
      }
    );
    console.log('✅ Scheduled workflow created:', response.data.workflowId);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to setup scheduled workflow:', error.message);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 n8n Workflow Setup Utility\n');
  console.log(`📍 Connecting to: ${WORKFLOW_SERVICE_URL}\n`);

  try {
    // Check if service is running
    await axios.get(`${WORKFLOW_SERVICE_URL}/health`);
    console.log('✅ Workflow service is running\n');
  } catch (error: any) {
    console.error(
      `❌ Cannot connect to workflow service at ${WORKFLOW_SERVICE_URL}\n`,
      'Make sure the service is running: npm run dev\n'
    );
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  try {
    switch (command) {
      case 'email':
        await setupEmailWorkflow();
        break;

      case 'webhook':
        const webhookName = args[1] || 'webhook-trigger-workflow';
        await setupWebhookWorkflow(webhookName);
        break;

      case 'scheduled':
        const scheduledName = args[1] || 'scheduled-workflow';
        const interval = args[2] ? parseInt(args[2]) : 15;
        await setupScheduledWorkflow(scheduledName, interval);
        break;

      case 'all':
        console.log('Setting up all workflows...\n');
        await setupEmailWorkflow();
        console.log('');
        await setupWebhookWorkflow('webhook-trigger');
        console.log('');
        await setupScheduledWorkflow('daily-job', 1440); // Daily (1440 minutes)
        break;

      case 'help':
        console.log(`
Usage: npx ts-node scripts/setup-workflows.ts [command] [options]

Commands:
  all                    Setup all default workflows
  email                  Setup email workflow only
  webhook [name]         Setup webhook workflow with optional name
  scheduled [name] [min] Setup scheduled workflow with optional name and interval

Examples:
  npx ts-node scripts/setup-workflows.ts all
  npx ts-node scripts/setup-workflows.ts email
  npx ts-node scripts/setup-workflows.ts webhook my-webhook
  npx ts-node scripts/setup-workflows.ts scheduled daily-job 60
        `);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Use "help" to see available commands');
        process.exit(1);
    }

    console.log('\n✅ Setup complete!\n');
  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
