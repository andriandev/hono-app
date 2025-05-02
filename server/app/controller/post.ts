import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { prismaClient } from '@app/config/database';
import { PostValidation } from '@app/validation/post';
import { resJSON, orderResponsePost } from '@app/helpers/function';
import { hashIdPost } from '@app/helpers/hashids';

export async function GetPostByUser(c: Context) {
  const user = c.get('userData');
  const rawQuery = c.req.query();
  const query = PostValidation.GETBYUSER.parse(rawQuery);

  const data: any = {};

  const limit = query.limit ? Number(query.limit) : 10;
  const offset = query.offset ? Number(query.offset) : 0;

  data.posts = await prismaClient.post.findMany({
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

  data.posts = data.posts.map((post: any) => {
    return orderResponsePost(post);
  });

  const totalPosts = await prismaClient.post.count({
    where: {
      user_id: user.id,
    },
  });
  const totalPages = Math.ceil(totalPosts / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  data.paging = {
    total_posts: totalPosts,
    total_pages: totalPages,
    current_page: currentPage,
  };

  const resData = resJSON({
    data: data,
  });

  return c.json(resData, resData.status as 200);
}

export async function GetPost(c: Context) {
  const hashId: string = c.req.param('hashId');

  const request = PostValidation.GET.parse({ hash_id: hashId });

  const idPost = hashIdPost.decode(request.hash_id)[0];

  const post = await prismaClient.post.findFirst({
    where: { id: Number(idPost) },
  });

  if (!post) {
    throw new HTTPException(400, {
      message: 'Post not found',
    });
  }

  const resData = resJSON({
    data: orderResponsePost(post),
  });

  return c.json(resData, resData.status as 200);
}

export async function CreatePost(c: Context) {
  const rawData = c.get('jsonData');
  const user = c.get('userData');

  const request = PostValidation.CREATE.parse(rawData);

  const post = await prismaClient.post.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      title: request.title,
      content: request.content,
      status: request.status,
    },
  });

  const resData = resJSON({
    data: orderResponsePost(post),
  });

  return c.json(resData, resData.status as 200);
}

export async function UpdatePost(c: Context) {
  const rawData = c.get('jsonData');
  const user = c.get('userData');
  const hashId: string = c.req.param('hashId');

  const request = PostValidation.UPDATE.parse(
    Object.assign(rawData, { hash_id: hashId })
  );

  const idPost = hashIdPost.decode(hashId)[0];

  const postData = await prismaClient.post.findFirst({
    where: {
      id: Number(idPost),
    },
  });

  if (!postData) {
    throw new HTTPException(400, {
      message: 'Post not found',
    });
  }

  if (user.role !== 'admin') {
    if (user.id !== postData.user_id) {
      throw new HTTPException(403, {
        message: 'Access forbidden',
      });
    }
  }

  const { hash_id, ...dataRequest } = request;

  const post = await prismaClient.post.update({
    where: {
      id: Number(idPost),
    },
    data: dataRequest,
  });

  const resData = resJSON({
    data: orderResponsePost(post),
  });

  return c.json(resData, resData.status as 200);
}

export async function DeletePost(c: Context) {
  const hashId: string = c.req.param('hashId');
  const user = c.get('userData');

  const request = PostValidation.DELETE.parse({ hash_id: hashId });

  const idPost = hashIdPost.decode(request.hash_id)[0];

  const postData = await prismaClient.post.findFirst({
    where: {
      id: Number(idPost),
    },
  });

  if (!postData) {
    throw new HTTPException(400, {
      message: 'Post not found',
    });
  }

  if (user.role !== 'admin') {
    if (user.id !== postData.user_id) {
      throw new HTTPException(403, {
        message: 'Access forbidden',
      });
    }
  }

  await prismaClient.post.delete({
    where: {
      id: Number(idPost),
    },
  });

  const resData = resJSON({
    message: 'Deleted post successfully',
  });

  return c.json(resData, resData.status as 200);
}
