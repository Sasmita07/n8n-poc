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
  n8nApiKey: process.env.N8N_API_KEY?.trim() || '',
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:3000/webhook',
  n8nSmtpCredentialId: process.env.N8N_SMTP_CREDENTIAL_ID?.trim(),
  n8nSmtpCredentialName:
    process.env.N8N_SMTP_CREDENTIAL_NAME?.trim() || 'SMTP account',
  n8nSmtpSender: process.env.N8N_SMTP_SENDER?.trim() || 'noreply@example.com',
};
