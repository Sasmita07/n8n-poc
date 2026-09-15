import {
  activateN8nWorkflow,
  createN8nWorkflow,
  listN8nWorkflows,
} from '../../../gateways/external/n8n-client.adapter';
import { envConfig } from '../../../config/env.config';

function removeActiveFlag<T extends Record<string, any>>(payload: T): T {
  const { active, ...rest } = payload;
  return rest as T;
}

/**
 * Email workflow template for n8n
 * This creates a workflow that receives emails via webhook and sends them
 */
export async function createEmailWorkflow() {
  const senderEmail = envConfig.n8nSmtpSender || 'noreply@example.com';

  if (!envConfig.n8nSmtpCredentialId) {
    throw new Error(
      'N8N_SMTP_CREDENTIAL_ID is required. Create an SMTP credential in n8n and configure its ID and name before setting up the email workflow.',
    );
  }

  const emailWorkflowPayload = removeActiveFlag({
    name: 'send-email',
    active: true,
    nodes: [
      {
        id: 'webhook-trigger',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          path: 'send-email',
          httpMethod: 'POST',
          responseMode: 'onReceived',
          options: {},
        },
        webhookId: 'default',
      },
      {
        id: 'email-send',
        name: 'Send Email',
        type: 'n8n-nodes-base.emailSend',
        typeVersion: 2.1,
        position: [450, 300],
        parameters: {
          operation: 'send',
          fromEmail: senderEmail,
          toEmail: "={{ String($json.body?.to ?? $json.to ?? '') }}",
          subject: '={{ $json.body?.subject ?? $json.subject }}',
          emailFormat: 'both',
          text: '={{ $json.body?.body ?? $json.body }}',
          html: '={{ $json.body?.html ?? $json.html }}',
          options: {
            ccEmail: "={{ String($json.body?.cc ?? $json.cc ?? '') }}",
            bccEmail: "={{ String($json.body?.bcc ?? $json.bcc ?? '') }}",
            replyTo: '={{ $json.body?.replyTo ?? $json.replyTo }}',
          },
        },
        credentials: {
          smtp: {
            id: envConfig.n8nSmtpCredentialId,
            name: envConfig.n8nSmtpCredentialName,
          },
        },
      },
      {
        id: 'respond-webhook',
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          responseCode: 200,
          options: {},
        },
      },
    ],
    connections: {
      'Webhook Trigger': {
        main: [
          [
            {
              node: 'Send Email',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
      'Send Email': {
        main: [
          [
            {
              node: 'Respond to Webhook',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
    },
    settings: {
      executionOrder: 'v1',
    },
  });

  console.log('🔧 Setting up email workflow in n8n...');

  try {
    const workflowList = await listN8nWorkflows();
    const workflows = Array.isArray(workflowList)
      ? workflowList
      : Array.isArray(workflowList?.data)
        ? workflowList.data
        : [];
    const emailWorkflows = workflows.filter(
      (workflow: any) => workflow.name === 'send-email',
    );
    const existing =
      emailWorkflows.find((workflow: any) => workflow.active) ||
      emailWorkflows[0];

    if (existing?.id) {
      const activated = existing.active
        ? existing
        : await activateN8nWorkflow(existing.id, {});

      console.log('✅ Reusing email workflow:', existing.id);
      return {
        success: true,
        message: 'Existing email workflow reused and activated',
        workflowId: existing.id,
        result: { ...existing, ...activated },
      };
    }

    const created = await createN8nWorkflow(emailWorkflowPayload);
    const activated = await activateN8nWorkflow(created.id, {});
    console.log('✅ Email workflow created and activated:', created.id);
    return {
      success: true,
      message: 'Email workflow created and activated',
      workflowId: created.id,
      result: { ...created, ...activated },
    };
  } catch (error: any) {
    console.error('❌ Failed to create email workflow:', error.message);
    throw error;
  }
}

/**
 * Creates a webhook trigger workflow template
 */
export async function createWebhookWorkflow(
  name: string = 'webhook-trigger-workflow',
) {
  const webhookWorkflowPayload = removeActiveFlag({
    name,
    active: true,
    nodes: [
      {
        id: 'webhook-node',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          path: name.toLowerCase().replace(/\s+/g, '-'),
          httpMethod: 'POST',
          responseMode: 'onReceived',
          options: {},
        },
        webhookId: 'default',
      },
      {
        id: 'response-node',
        name: 'Send Response',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          responseCode: 200,
          options: {},
        },
      },
    ],
    connections: {
      'Webhook Trigger': {
        main: [
          [
            {
              node: 'Send Response',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
    },
    settings: {
      executionOrder: 'v1',
    },
  });

  console.log(`🔧 Creating webhook workflow: ${name}`);

  try {
    const created = await createN8nWorkflow(webhookWorkflowPayload);
    const activated = await activateN8nWorkflow(created.id, {});
    console.log(`✅ Webhook workflow created and activated: ${created.id}`);
    return {
      success: true,
      message: `Webhook workflow "${name}" created and activated`,
      workflowId: created.id,
      result: { ...created, ...activated },
    };
  } catch (error: any) {
    console.error(`❌ Failed to create webhook workflow: ${error.message}`);
    throw error;
  }
}

/**
 * Creates a scheduled trigger workflow template
 */
export async function createScheduledWorkflow(
  name: string = 'scheduled-workflow',
  scheduleInterval: number = 15,
) {
  const scheduledWorkflowPayload = removeActiveFlag({
    name,
    active: true,
    nodes: [
      {
        id: 'schedule-trigger',
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          rule: {
            interval: [
              {
                field: 'minutes',
                minutesInterval: scheduleInterval,
              },
            ],
          },
        },
      },
      {
        id: 'response-node',
        name: 'Log Execution',
        type: 'n8n-nodes-base.noOp',
        typeVersion: 1,
        position: [450, 300],
        parameters: {},
      },
    ],
    connections: {
      'Schedule Trigger': {
        main: [
          [
            {
              node: 'Log Execution',
              type: 'main',
              index: 0,
            },
          ],
        ],
      },
    },
    settings: {
      executionOrder: 'v1',
    },
  });

  console.log(
    `🔧 Creating scheduled workflow: ${name} (every ${scheduleInterval} min)`,
  );

  try {
    const created = await createN8nWorkflow(scheduledWorkflowPayload);
    const activated = await activateN8nWorkflow(created.id, {});
    console.log(`✅ Scheduled workflow created and activated: ${created.id}`);
    return {
      success: true,
      message: `Scheduled workflow "${name}" created and activated`,
      workflowId: created.id,
      result: { ...created, ...activated },
    };
  } catch (error: any) {
    console.error(`❌ Failed to create scheduled workflow: ${error.message}`);
    throw error;
  }
}
