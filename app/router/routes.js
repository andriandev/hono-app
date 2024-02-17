import { Hono } from 'hono';
import { Home, Page } from '../controller/home-controller.js';

const app = new Hono();

app.get('/', Home);
app.get('/:id', Page);

export default app;
