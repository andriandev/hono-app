import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { Shortlink, Post } from '@controller/service';
import { FlushCache } from '@app/controller/cache';

const app = new Hono();

app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }));

app.get('/cache/flush', FlushCache);

app.get('/post/:hash_id', Post);

app.get('/:alias', Shortlink);

export default app;
