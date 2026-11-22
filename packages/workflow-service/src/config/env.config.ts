import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

dotenv.config({
  path: path.join(
    packageDirectory,
    `.env.${process.env.NODE_ENV || 'development'}`,
  ),
});
dotenv.config();

export const envConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  n8nUrl: process.env.N8N_URL || 'http://localhost:5678',
  n8nApiKey: process.env.N8N_API_KEY?.trim(),
  approvalRequestWebhookPath:
    process.env.N8N_APPROVAL_REQUEST_WEBHOOK_PATH?.trim() || 'approval-request',
  approvalDecisionWebhookPath:
    process.env.N8N_APPROVAL_DECISION_WEBHOOK_PATH?.trim() ||
    'approval-decision',
  aiDecisionWebhookPath:
    process.env.N8N_AI_DECISION_WEBHOOK_PATH?.trim() || 'ai-decision',
  aiApiUrl:
    process.env.AI_API_URL?.trim() ||
    'https://api.openai.com/v1/chat/completions',
  aiApiKey: process.env.AI_API_KEY?.trim(),
  aiModel: process.env.AI_MODEL?.trim() || 'gpt-4o-mini',
  n8nSmtpCredentialId: process.env.N8N_SMTP_CREDENTIAL_ID?.trim(),
  n8nSmtpCredentialName:
    process.env.N8N_SMTP_CREDENTIAL_NAME?.trim() || 'SMTP account',
  n8nSmtpSender: process.env.N8N_SMTP_SENDER?.trim() || 'noreply@example.com',
};
