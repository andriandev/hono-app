import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import 'dotenv/config';
import middleware from './app/middleware/default.js';
import routes from './app/router/routes.js';
import { resJSON } from './app/helpers/function.js';

// Config
const app = new Hono();
const port = process.env.APP_PORT || 3000;

// Middleware
app.route('*', middleware);

// Routes
app.route('/api', routes);

// Custom Not Found Message
app.notFound((c) => {
  const resData = resJSON({ statusCode: 404, message: 'Page not found' });
  const statusCode = resData?.status;

  return c.json(resData, statusCode);
});

// Error handling
app.onError((err, c) => {
  const resData = resJSON({
    statusCode: 500,
    message: 'Internal server error',
  });
  const statusCode = resData?.status;

  if (process.env.APP_NODE != 'production') {
    resData.message = err?.message;
  }

  return c.json(resData, statusCode);
});

// Run serve
serve({
  fetch: app.fetch,
  port,
});
