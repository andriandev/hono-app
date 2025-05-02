import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { app } from '../index';
import { sign } from 'hono/jwt';
import { APP_JWT_SECRET, APP_HASH_ID } from '@app/config/setting';
import { prismaClient } from '@app/config/database';
import { hashIdPost } from '@app/helpers/hashids';

describe('GET /post/all', () => {
  const username = 'user_test_get_post_all';
  let token: string;
  let userId: number;

  beforeAll(async () => {
    userId = Math.floor(Math.random() * 1000000);
    await prismaClient.user.create({
      data: {
        id: userId,
      },
    });

    await prismaClient.post.createMany({
      data: [
        {
          user_id: userId,
          title: 'Post 1',
          status: 'publish',
        },
        {
          user_id: userId,
          title: 'Post 2',
          status: 'draf',
        },
      ],
    });

    token = await sign(
      {
        id: userId,
        username,
        role: 'member',
        app_id: APP_HASH_ID,
        is_active: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      APP_JWT_SECRET,
      'HS256'
    );
  });

  afterAll(async () => {
    await prismaClient.user.delete({
      where: {
        id: userId,
      },
    });
  });

  it('should return posts for the user with pagination', async () => {
    const res = await app.request(
      '/post/all?limit=10&offset=0&order_by=id&order=desc',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();

    expect(res.status).toBe(200);
    expect(result?.data?.posts?.length).toBeGreaterThanOrEqual(2);
    expect(result?.data?.paging).toBeDefined();
    expect(result?.data?.paging?.total_posts).toBeGreaterThanOrEqual(2);
  });

  it('should return 400 if query invalid', async () => {
    const res = await app.request('/post/all?limit=-1&order_by=unknown', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    expect(res.status).toBe(400);
    expect(result.message).toBeDefined();
  });
});

describe('GET /post/:hashId', () => {
  let postId: number;
  let hashId: string;
  let userId: number;

  beforeAll(async () => {
    userId = Math.floor(Math.random() * 1000000);
    const user = await prismaClient.user.create({
      data: {
        id: userId,
      },
    });

    const post = await prismaClient.post.create({
      data: {
        user_id: user.id,
        title: 'Post for get by hashId',
        status: 'publish',
      },
    });

    postId = post.id;
    hashId = hashIdPost.encode(postId);
  });

  afterAll(async () => {
    await prismaClient.user.delete({
      where: {
        id: userId,
      },
    });
  });

  it('should return post by valid hashId', async () => {
    const res = await app.request(`/post/${hashId}`);

    const result = await res.json();

    expect(res.status).toBe(200);
    expect(result?.data?.id).toBeDefined();
    expect(result?.data?.title).toBe('Post for get by hashId');
  });

  it('should return 400 if hashId not found', async () => {
    const fakeHashId = hashIdPost.encode(99999999);
    const res = await app.request(`/post/${fakeHashId}`);

    const result = await res.json();

    expect(res.status).toBe(400);
    expect(result.message).toBe('Post not found');
  });

  it('should return 400 if hashId invalid', async () => {
    const res = await app.request(`/post/invalid123`);
    const result = await res.json();

    expect(res.status).toBe(400);
    expect(result.message.hash_id).toBe('Invalid hashId');
  });
});

describe('POST /post', () => {
  let token = '';
  let userId = 0;

  beforeAll(async () => {
    userId = Math.floor(Math.random() * 1000000);
    const user = await prismaClient.user.create({
      data: { id: userId },
    });
    userId = user.id;

    token = await sign(
      {
        id: userId,
        username: 'user_test_create_post',
        role: 'member',
        app_id: APP_HASH_ID,
        is_active: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      APP_JWT_SECRET,
      'HS256'
    );
  });

  afterAll(async () => {
    await prismaClient.user.delete({ where: { id: userId } });
  });

  it('should create a post successfully', async () => {
    const res = await app.request('/post', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Post from test',
        content: 'This is content from test',
        status: 'publish',
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    expect(res.status).toBe(200);
    expect(result?.data?.title).toBe('New Post from test');
    expect(result?.data?.status).toBe('publish');
  });

  it('should return 400 if title is missing', async () => {
    const res = await app.request('/post', {
      method: 'POST',
      body: JSON.stringify({
        content: 'No title here',
        status: 'draf',
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    expect(res.status).toBe(400);
    expect(result.message.title).toBe('Title required');
  });
});

describe('PUT /post/:hashId', () => {
  let userId: number;
  let token = '';
  let hashId = '';

  beforeAll(async () => {
    userId = Math.floor(Math.random() * 1000000);
    await prismaClient.user.create({
      data: {
        id: userId,
      },
    });

    const post = await prismaClient.post.create({
      data: {
        user_id: userId,
        title: 'Original Title',
        content: 'Original Content',
        status: 'draf',
      },
    });

    hashId = hashIdPost.encode(post.id);

    token = await sign(
      {
        id: userId,
        username: 'user_test_update_post',
        role: 'member',
        app_id: APP_HASH_ID,
        is_active: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      APP_JWT_SECRET,
      'HS256'
    );
  });

  afterAll(async () => {
    await prismaClient.user.delete({ where: { id: userId } });
  });

  it('should update the post successfully', async () => {
    const res = await app.request(`/post/${hashId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Updated Title',
        content: 'Updated Content',
        status: 'publish',
      }),
    });

    const result = await res.json();

    expect(res.status).toBe(200);
    expect(result.data.title).toBe('Updated Title');
    expect(result.data.status).toBe('publish');
  });

  it('should return 403 if another user tries to update', async () => {
    const anotherUserId = await sign(
      {
        id: Math.floor(Math.random() * 1000000),
        username: 'user_test_update_post_2',
        role: 'member',
        app_id: APP_HASH_ID,
        is_active: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      APP_JWT_SECRET,
      'HS256'
    );
    const res = await app.request(`/post/${hashId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${anotherUserId}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Should Not Update',
      }),
    });

    const result = await res.json();

    expect(res.status).toBe(403);
    expect(result.message).toBe('Access forbidden');
  });
});

describe('DELETE /post/:hashId', () => {
  let userId = Math.floor(Math.random() * 1000000);
  let token = '';
  let hashId = '';

  beforeAll(async () => {
    await prismaClient.user.create({ data: { id: userId } });

    const post = await prismaClient.post.create({
      data: {
        user_id: userId,
        title: 'Delete Test',
        content: 'To be deleted',
        status: 'draf',
      },
    });

    hashId = hashIdPost.encode(post.id);
    token = await sign(
      {
        id: userId,
        username: 'user_test_delete_post',
        role: 'member',
        app_id: APP_HASH_ID,
        is_active: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
      APP_JWT_SECRET,
      'HS256'
    );
  });

  afterAll(async () => {
    await prismaClient.user.delete({ where: { id: userId } });
  });

  it('should delete the post successfully', async () => {
    const res = await app.request(`/post/${hashId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    expect(res.status).toBe(200);
    expect(result.message).toBe('Deleted post successfully');
  });

  it('should return 400 for non-existing post', async () => {
    const res = await app.request(`/post/${hashId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    expect(res.status).toBe(400);
    expect(result.message).toBe('Post not found');
  });
});
