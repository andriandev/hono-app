import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import bcrypt from 'bcryptjs';
import { UserValidation } from '@app/validation/user';
import { prismaClient } from '@app/config/database';
import { resJSON } from '@app/helpers/function';

export async function GetUser(c: Context) {
  const idUser: any = c.req.param('id');
  const rawQuery = c.req.query();
  const query = UserValidation.GET.parse(rawQuery);
  let data: any = {};

  if (idUser) {
    if (isNaN(idUser)) {
      throw new HTTPException(400, {
        message: 'User not found',
      });
    }

    const user = await prismaClient.user.findFirst({
      where: {
        id: Number(idUser),
      },
      include: { auth: { omit: { id: true, user_id: true } } },
    });

    if (!user) {
      throw new HTTPException(400, {
        message: 'User not found',
      });
    }

    data = user;
  } else {
    const limit = query.limit ? Number(query.limit) : 10;
    const offset = query.offset ? Number(query.offset) : 0;

    const allUser = await prismaClient.user.findMany({
      skip: offset,
      take: limit,
      omit: {
        password: true,
      },
    });

    if (allUser.length == 0) {
      throw new HTTPException(400, {
        message: 'User data not exist',
      });
    }

    const totalUsers = await prismaClient.user.count();
    const totalPages = Math.ceil(totalUsers / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    data.users = allUser;
    data.paging = {
      total_users: totalUsers,
      total_pages: totalPages,
      current_page: currentPage,
    };
  }

  const resData = resJSON({
    data: data,
  });

  return c.json(resData, resData.status as 200);
}

export async function CreateUser(c: Context) {
  let request = await c.req.json();

  request = UserValidation.UPDATE.parse(request);

  const checkUsername = await prismaClient.user.findFirst({
    where: {
      username: request.username,
    },
  });

  if (checkUsername) {
    throw new HTTPException(400, {
      message: 'Username is already exist',
    });
  }

  request.password = await bcrypt.hash(request.password, 10);

  const user = await prismaClient.user.create({
    data: request,
  });

  const resData = resJSON({
    data: user,
  });

  return c.json(resData, resData.status as 200);
}

export async function UpdateUser(c: Context) {
  const idUser: any = c.req.param('id');
  let request = await c.req.json();

  if (isNaN(idUser)) {
    throw new HTTPException(400, {
      message: 'User not found',
    });
  }

  request = UserValidation.UPDATE.parse(request);

  const user = await prismaClient.user.findFirst({
    where: {
      id: Number(idUser),
    },
  });

  if (!user) {
    throw new HTTPException(400, {
      message: 'User not found',
    });
  }

  if (request.password) {
    request.password = await bcrypt.hash(request?.password, 10);
  }

  const newData = await prismaClient.user.update({
    where: {
      id: Number(idUser),
    },
    data: request,
  });

  const resData = resJSON({
    data: newData,
  });

  return c.json(resData, resData.status as 200);
}

export async function DeleteUser(c: Context) {
  const idUser: any = c.req.param('id');

  try {
    await prismaClient.user.delete({
      where: {
        id: Number(idUser),
      },
    });

    const resData = resJSON({
      message: 'Deleted user successfully',
    });

    return c.json(resData, resData.status as 200);
  } catch (err) {
    const resData = resJSON({
      statusCode: 400,
      message: 'User not found',
    });

    return c.json(resData, resData.status as 400);
  }
}

export async function UserActivation(c: Context) {
  let request = await c.req.json();

  request = UserValidation.ACTIVATE.parse(request);

  try {
    const user = await prismaClient.user.update({
      where: {
        id: Number(request.id),
      },
      data: {
        is_active: request.is_active,
      },
    });

    const message = user.is_active
      ? 'User successfully activated'
      : 'User successfully deactivated';

    const resData = resJSON({
      message: message,
      data: user,
    });

    return c.json(resData, resData.status as 200);
  } catch (err) {
    // Prisma error code P2025 (record not found)
    if (err.code === 'P2025') {
      const resData = resJSON({
        status: 400,
        message: 'User not found',
      });
      return c.json(resData, resData.status as 400);
    }

    // Handle another error
    throw new HTTPException(500, {
      message: err?.message,
    });
  }
}
