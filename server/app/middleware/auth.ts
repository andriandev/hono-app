import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import { resJSON, customJwtErrorMessage } from '@app/helpers/function';
import { APP_JWT_SECRET, APP_SECRET_KEY } from '@app/config/setting';
import { prismaClient } from '@app/config/database';

export async function is_login(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, {
      message: 'Invalid token',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = await verify(token, APP_JWT_SECRET, 'HS256');
    const userDB = await prismaClient.user.findFirst({
      where: {
        id: user.id,
      },
      omit: { password: true },
      include: {
        auth: {
          where: { token: token, user_id: user.id },
          omit: { id: true },
        },
      },
    });

    if (!userDB) {
      const resData = resJSON({
        statusCode: 401,
        message: 'User not found',
      });

      return c.json(resData, resData.status as 401);
    }

    if (!userDB?.auth[0]?.is_active) {
      const resData = resJSON({
        statusCode: 401,
        message: 'Token is no longer active',
      });

      return c.json(resData, resData.status as 401);
    }

    if (user.role == 'banned' || userDB.role == 'banned') {
      const resData = resJSON({
        statusCode: 403,
        message: 'User already banned',
      });

      return c.json(resData, resData.status as 403);
    }

    if (!user.is_active || !userDB.is_active) {
      const resData = resJSON({
        statusCode: 401,
        message: 'User not active',
      });

      return c.json(resData, resData.status as 401);
    }

    c.set('userData', userDB);

    await next();
  } catch (err) {
    if (err.name === 'JwtTokenExpired') {
      await prismaClient.auth.updateMany({
        where: {
          token: token,
        },
        data: {
          is_active: false,
        },
      });
    }

    throw new HTTPException(401, {
      message: customJwtErrorMessage(err),
    });
  }
}

export async function is_admin(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, {
      message: 'Invalid token',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = await verify(token, APP_JWT_SECRET, 'HS256');
    const userDB = await prismaClient.user.findFirst({
      where: {
        id: user.id,
      },
      omit: { password: true },
      include: {
        auth: {
          where: { token: token, user_id: user.id },
          omit: { id: true },
        },
      },
    });

    if (!userDB) {
      const resData = resJSON({
        statusCode: 401,
        message: 'User not found',
      });

      return c.json(resData, resData.status as 401);
    }

    if (!userDB?.auth[0]?.is_active) {
      const resData = resJSON({
        statusCode: 401,
        message: 'Token is no longer active',
      });

      return c.json(resData, resData.status as 401);
    }

    if (user.role == 'banned' || userDB.role == 'banned') {
      const resData = resJSON({
        statusCode: 403,
        message: 'User already banned',
      });

      return c.json(resData, resData.status as 403);
    }

    if (!user.is_active || !userDB.is_active) {
      const resData = resJSON({
        statusCode: 401,
        message: 'User not active',
      });

      return c.json(resData, resData.status as 401);
    }

    if (user.role != 'admin' || userDB.role != 'admin') {
      const resData = resJSON({
        statusCode: 403,
        message: 'Only admin can access this endpoint',
      });

      return c.json(resData, resData.status as 403);
    }

    c.set('userData', userDB);

    await next();
  } catch (err) {
    if (err.name === 'JwtTokenExpired') {
      await prismaClient.auth.updateMany({
        where: {
          token: token,
        },
        data: {
          is_active: false,
        },
      });
    }

    throw new HTTPException(401, {
      message: customJwtErrorMessage(err),
    });
  }
}

export async function is_admin_or_key(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    throw new HTTPException(401, {
      message: 'Invalid token',
    });
  }

  let token = authHeader;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (token === APP_SECRET_KEY) {
    await next();
  } else {
    if (!authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, {
        message: 'Invalid token',
      });
    }

    try {
      const user = await verify(token, APP_JWT_SECRET, 'HS256');
      const userDB = await prismaClient.user.findFirst({
        where: {
          id: user.id,
        },
        omit: { password: true },
        include: {
          auth: {
            where: { token: token, user_id: user.id },
            omit: { id: true },
          },
        },
      });

      if (!userDB) {
        const resData = resJSON({
          statusCode: 401,
          message: 'User not found',
        });

        return c.json(resData, resData.status as 401);
      }

      if (!userDB?.auth[0]?.is_active) {
        const resData = resJSON({
          statusCode: 401,
          message: 'Token is no longer active',
        });

        return c.json(resData, resData.status as 401);
      }

      if (user.role == 'banned' || userDB.role == 'banned') {
        const resData = resJSON({
          statusCode: 403,
          message: 'User already banned',
        });

        return c.json(resData, resData.status as 403);
      }

      if (!user.is_active || !userDB.is_active) {
        const resData = resJSON({
          statusCode: 401,
          message: 'User not active',
        });

        return c.json(resData, resData.status as 401);
      }

      if (user.role != 'admin' || userDB.role != 'admin') {
        const resData = resJSON({
          statusCode: 403,
          message: 'Only admin can access this endpoint',
        });

        return c.json(resData, resData.status as 403);
      }

      c.set('userData', userDB);

      await next();
    } catch (err) {
      if (err.name === 'JwtTokenExpired') {
        await prismaClient.auth.updateMany({
          where: {
            token: token,
          },
          data: {
            is_active: false,
          },
        });
      }

      throw new HTTPException(401, {
        message: customJwtErrorMessage(err),
      });
    }
  }
}
