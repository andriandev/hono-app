import { Hono, Context } from 'hono';
import middleware from '@middleware/default';
import routes from '@router/routes';
import { logger } from '@config/logging';
import { NotFoundPage } from '@app/view/not-found';
import { ErrorPage } from '@app/view/error';

// Config
export const app = new Hono(); // Export for testing function
const appPort = process.env.APP_PORT || 3001;
const appNode = process.env.APP_ENV || 'development';

// Middleware
app.route('/', middleware);

// Routes
app.route('/', routes);

// Custom Not Found Message
app.notFound((c: Context) => {
  return c.html(NotFoundPage(), 404);
});

// Error handling
app.onError(async (err, c: Context) => {
  if (appNode == 'production') {
    logger.error(`${c.req.method} ${c.req.path} => ${err?.message}`);
    err.message = 'Internal server error';
  }

  return c.html(ErrorPage({ message: err?.message }), 500);
});

// Run serve
const appOptions = {
  fetch: app.fetch,
  port: appPort,
};

export default appOptions;
