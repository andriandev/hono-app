import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { hashId } from '@app/helpers/hashids';
import { prismaClient } from '@app/config/database';
import {
  resJSON,
  filterStringAlias,
  containsNonAlphanumeric,
} from '@app/helpers/function';
import { LinkValidation } from '@app/validation/link';

export async function GetLinkByUser(c: Context) {
  const user = c.get('userData');
  const rawQuery = c.req.query();
  const query = LinkValidation.GET.parse(rawQuery);

  const data: any = {};

  const limit = query.limit ? Number(query.limit) : 10;
  const offset = query.offset ? Number(query.offset) : 0;

  data.links = await prismaClient.link.findMany({
    where: {
      user_id: user.id,
    },
    skip: offset,
    take: limit,
    orderBy: {
      [query.order_by]: query.order,
    },
    omit: {
      user_id: true,
    },
  });

  const totalLinks = await prismaClient.link.count({
    where: {
      user_id: user.id,
    },
  });
  const totalPages = Math.ceil(totalLinks / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  data.paging = {
    total_links: totalLinks,
    total_pages: totalPages,
    current_page: currentPage,
  };

  const resData = resJSON({
    data: data,
  });

  return c.json(resData, resData.status as 200);
}

export async function GetLink(c: Context) {
  const alias: string = c.req.param('alias');

  const data = await prismaClient.link.findFirst({
    where: { alias: alias },
  });

  if (!data) {
    throw new HTTPException(400, {
      message: 'Shortlink not found',
    });
  }

  const resData = resJSON({
    data: data,
  });

  return c.json(resData, resData.status as 200);
}

export async function CreateLink(c: Context) {
  let request = await c.req.json();
  const user = c.get('userData');

  request = LinkValidation.CREATE.parse(request);

  if (request.alias) {
    request.alias = filterStringAlias(request.alias);

    if (!containsNonAlphanumeric(request.alias)) {
      const checkHash = hashId.decode(request.alias)[0];

      if (checkHash) {
        throw new HTTPException(400, {
          message: 'Alias not allowed',
        });
      }
    }

    const checkAlias = await prismaClient.link.findFirst({
      where: {
        alias: request.alias,
      },
    });

    if (checkAlias) {
      throw new HTTPException(400, {
        message: 'Alias is already exist',
      });
    }
  }

  const link = await prismaClient.link.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      alias: request.alias,
      destination: request.destination,
    },
  });

  const alias = request.alias || hashId.encode(link.id);

  const data = await prismaClient.link.update({
    where: { id: link.id },
    data: { alias: alias },
  });

  const resData = resJSON({
    data: data,
  });

  return c.json(resData, resData.status as 200);
}

export async function UpdateLink(c: Context) {
  const alias: string = c.req.param('alias');
  let request = await c.req.json();
  const user = c.get('userData');

  request = LinkValidation.UPDATE.parse(request);

  const linkData = await prismaClient.link.findFirst({
    where: {
      alias: alias,
    },
  });

  if (!linkData) {
    throw new HTTPException(400, {
      message: 'Shortlink not found',
    });
  }

  if (user.role !== 'admin') {
    if (user.id !== linkData.user_id) {
      throw new HTTPException(403, {
        message: 'Access forbidden',
      });
    }
  }

  if (request.alias) {
    request.alias = filterStringAlias(request.alias);

    if (!containsNonAlphanumeric(request.alias)) {
      const checkHash = hashId.decode(request.alias)[0];

      if (checkHash) {
        throw new HTTPException(400, {
          message: 'Alias not allowed',
        });
      }
    }

    const checkAlias = await prismaClient.link.findFirst({
      where: {
        alias: request.alias,
      },
    });

    if (checkAlias) {
      throw new HTTPException(400, {
        message: 'Alias is already exist',
      });
    }
  }

  const data = await prismaClient.link.update({
    where: {
      id: linkData.id,
    },
    data: request,
  });

  const resData = resJSON({
    data: data,
  });

  return c.json(resData, resData.status as 200);
}

export async function DeleteLink(c: Context) {
  const alias: string = c.req.param('alias');
  const user = c.get('userData');

  const linkData = await prismaClient.link.findFirst({
    where: {
      alias: alias,
    },
  });

  if (!linkData) {
    throw new HTTPException(400, {
      message: 'Shortlink not found',
    });
  }

  if (user.role !== 'admin') {
    if (user.id !== linkData.user_id) {
      throw new HTTPException(403, {
        message: 'Access forbidden',
      });
    }
  }

  await prismaClient.link.deleteMany({
    where: {
      alias: alias,
    },
  });

  const resData = resJSON({
    message: 'Deleted link successfully',
  });

  return c.json(resData, resData.status as 200);
}

export async function CountLink(c: Context) {
  const alias: string = c.req.param('alias');

  const result = await prismaClient.link.updateMany({
    where: { alias },
    data: {
      view: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw new HTTPException(400, {
      message: 'Shortlink not found',
    });
  }

  const resData = resJSON({
    message: 'Add view succesfully',
  });

  return c.json(resData, resData.status as 200);
}
