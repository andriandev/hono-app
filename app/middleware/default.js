import { Hono } from 'hono';
import { etag } from 'hono/etag';

const app = new Hono();

// Cache code
app.use('*', etag());

app.use('*', async (c, next) => {
  // X-Response-Time header
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  c.header('X-Response-Time', `${ms}ms`);
});

export default app;
