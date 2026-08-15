import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  n8nUrl: process.env.N8N_URL || 'http://localhost:5678',
  n8nApiKey: process.env.N8N_API_KEY || '',
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:3000/webhook',
};
