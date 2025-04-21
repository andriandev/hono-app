import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export async function check_json(c: Context, next: Next) {
  try {
    await c.req.json();
    await next();
  } catch (err) {
    throw new HTTPException(400, {
      message: 'Invalid or empty JSON body',
    });
  }
}
