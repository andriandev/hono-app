import { Context } from 'hono';
import { cache } from '@app/config/cache';
import { resJSON } from '@app/helpers/function';

export function DeleteCache(c: Context) {
  const cacheKey = c.req.param('key');
  const secretKey = c.req.query('key');
  const authHeader = c.req.header('Authorization');
  let message = '';

  if (secretKey !== process.env.APP_SECRET_KEY && !authHeader) {
    const resData = resJSON({
      statusCode: 401,
      message: 'Access denied, wrong key or no auth',
    });

    return c.json(resData, resData.status as 401);
  }

  if (cache.has(cacheKey)) {
    cache.del(cacheKey);
    message = `Successfully delete cache ${cacheKey}`;
  } else {
    message = `No cache ${cacheKey}`;
  }

  const resData = resJSON({
    message,
  });

  return c.json(resData, resData.status as 200);
}

export function FlushCache(c: Context) {
  const secretKey = c.req.query('key');

  if (secretKey !== process.env.APP_SECRET_KEY) {
    const resData = resJSON({
      statusCode: 401,
      message: 'Access denied, wrong key',
    });

    return c.json(resData, resData.status as 401);
  }

  cache.flushAll();

  const resData = resJSON({
    message: 'Successfully cleared all cache',
  });

  return c.json(resData, resData.status as 200);
}
