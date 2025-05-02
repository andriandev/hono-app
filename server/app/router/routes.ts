import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { Login, Verify } from '@controller/auth';
import { GetUser, DeleteUser } from '@app/controller/user';
import {
  GetLinkByUser,
  GetLink,
  CreateLink,
  UpdateLink,
  DeleteLink,
  CountLink,
} from '@app/controller/link';
import {
  GetPostByUser,
  GetPost,
  CreatePost,
  UpdatePost,
  DeletePost,
} from '@app/controller/post';
import { is_admin, is_login } from '@app/middleware/auth';
import { check_json } from '@app/middleware/json';

const app = new Hono();

app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }));

app.post('/auth/login', check_json, Login);
app.get('/auth/verify', is_login, Verify);

app.get('/user/:id?', is_admin, GetUser);
app.delete('/user/:id', is_admin, DeleteUser);

app.get('/link/all', is_login, GetLinkByUser);
app.get('/link/:alias', GetLink);
app.post('/link', check_json, is_login, CreateLink);
app.put('/link/:alias', check_json, is_login, UpdateLink);
app.delete('/link/:alias', is_login, DeleteLink);
app.get('/link/:alias/count', CountLink);

app.get('/post/all', is_login, GetPostByUser);
app.get('/post/:hashId', GetPost);
app.post('/post', check_json, is_login, CreatePost);
app.put('/post/:hashId', check_json, is_login, UpdatePost);
app.delete('/post/:hashId', is_login, DeletePost);

export default app;
