import type { ErrorHandler } from 'hono';

export const errorHandlerMiddleware: ErrorHandler = (err, c) => {
  console.error('❌ Unhandled error:', err);
  return c.json(
    {
      success: false,
      error: err.message,
    },
    500
  );
};
