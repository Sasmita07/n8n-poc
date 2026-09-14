import { Context } from 'hono';

/**
 * CORS Middleware - Handles cross-origin requests
 */
export async function corsMiddleware(
  context: Context,
  next: () => Promise<void>,
) {
  // Set CORS headers
  context.header('Access-Control-Allow-Origin', '*');
  context.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  );
  context.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-N8N-API-KEY',
  );
  context.header('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (context.req.method === 'OPTIONS') {
    return context.text('OK', 200);
  }

  await next();
}
