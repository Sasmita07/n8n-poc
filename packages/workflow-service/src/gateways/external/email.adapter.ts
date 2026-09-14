import axios from 'axios';
import { envConfig } from '../../config/env.config';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
}

/**
 * Sends an email by triggering an n8n workflow with email node
 * @param emailPayload Email configuration
 * @returns Response from n8n
 */
export async function sendEmailViaWorkflow(emailPayload: EmailPayload) {
  const url = `${envConfig.n8nUrl}/webhook/send-email`;

  console.log(`📧 Sending email via n8n webhook:`, {
    to: Array.isArray(emailPayload.to)
      ? emailPayload.to.join(',')
      : emailPayload.to,
    subject: emailPayload.subject,
  });

  try {
    const response = await axios.post(url, emailPayload, {
      headers: envConfig.n8nApiKey
        ? {
            'X-N8N-API-KEY': envConfig.n8nApiKey,
          }
        : {},
      timeout: 30000,
    });
    console.log('✅ Email sent successfully');
    return response.data;
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    if (error.response?.status === 404) {
      throw new Error(
        'Email webhook not found in n8n - ensure send-email workflow is deployed',
      );
    }
    throw error;
  }
}

/**
 * Creates an email node configuration for use in workflow definitions
 * @param to Recipient email address(es)
 * @param subject Email subject
 * @param body Plain text body
 * @param html HTML body (optional)
 * @returns Email node configuration object
 */
export function createEmailNodeConfig(
  to: string | string[],
  subject: string,
  body: string,
  html?: string,
) {
  return {
    id: `email-${Date.now()}`,
    name: 'Send Email',
    type: 'n8n-nodes-base.emailSend',
    typeVersion: 2,
    position: [800, 300],
    parameters: {
      toEmail: Array.isArray(to) ? to.join(',') : to,
      subject,
      textBody: body,
      htmlBody: html || undefined,
      options: {
        replyTo: undefined,
        ccEmail: undefined,
        bccEmail: undefined,
      },
    },
  };
}

/**
 * Creates a webhook trigger configuration for email notifications
 * @param webhookPath Path for the webhook endpoint
 * @returns Webhook node configuration object
 */
export function createEmailWebhookTriggerConfig(
  webhookPath: string = 'send-email',
) {
  return {
    id: `webhook-${Date.now()}`,
    name: 'Webhook Trigger',
    type: 'n8n-nodes-base.webhook',
    typeVersion: 1,
    position: [250, 300],
    parameters: {
      path: webhookPath,
      options: {},
    },
  };
}
