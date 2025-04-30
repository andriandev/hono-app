import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
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
