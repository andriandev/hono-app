import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { Shortlink } from '@controller/service';
import { FlushCache } from '@app/controller/cache';

const app = new Hono();

app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }));
app.get('/cache/flush', FlushCache);
app.get('/:alias', Shortlink);

export default app;
