import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { prismaClient } from '@app/config/database';
import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { app } from '../index';
import { APP_JWT_EXP, APP_JWT_SECRET } from '@app/config/setting';

describe('POST /auth/register', () => {
  const username = 'user_test_register';
  const password = 'pass_test_register';

  beforeAll(async () => {
    await prismaClient.user.deleteMany({
      where: { username },
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: { username },
    });
  });

  it('should register a new user', async () => {
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data?.data?.username).toBe(username);
    expect(data?.data?.role).toBe('member');
    expect(data?.data?.is_active).toBe(false);
  });

  it('should fail if username already exists', async () => {
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(400);
  });

  it('should fail if username is too short', async () => {
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'ab', password }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(400);
  });

  it('should fail if password is too short', async () => {
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password: '12' }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  const username = 'user_test_login';
  const password = 'pass_test_login';

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prismaClient.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'member',
        is_active: true,
      },
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: { username },
    });
  });

  it('should login successfully and return token', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data?.data?.token).toBeDefined();
  });

  it('should fail with wrong password', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password: 'wrongpass' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Invalid username or password');
  });

  it('should fail if user role is banned', async () => {
    const bannedUsername = 'user_test_login_banned';
    const bannedPassword = 'pass_test_login_banned';
    const hashed = await bcrypt.hash(bannedPassword, 10);

    await prismaClient.user.create({
      data: {
        username: bannedUsername,
        password: hashed,
        role: 'banned',
      },
    });

    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: bannedUsername,
        password: bannedPassword,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.message).toBe('User already banned');

    await prismaClient.user.deleteMany({
      where: { username: bannedUsername },
    });
  });

  it('should fail if user is not active', async () => {
    const inactiveUsername = 'user_test_login_inactive';
    const inactivePassword = 'pass_test_login_inactive';
    const hashed = await bcrypt.hash(inactivePassword, 10);

    await prismaClient.user.create({
      data: {
        username: inactiveUsername,
        password: hashed,
        is_active: false,
      },
    });

    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: inactiveUsername,
        password: inactivePassword,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('User not active');

    await prismaClient.user.deleteMany({
      where: { username: inactiveUsername },
    });
  });

  it('should fail if username is too short', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'ab',
        password,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(400);
  });

  it('should fail if password is too short', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password: '12',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /auth/logout', () => {
  const username = 'user_test_logout';
  const password = 'pass_test_logout';
  let token: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'member',
        is_active: true,
      },
    });

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
      iat: Math.floor(Date.now() / 1000),
      exp: APP_JWT_EXP,
    };

    token = await sign(payload, APP_JWT_SECRET, 'HS256');

    await prismaClient.auth.create({
      data: {
        user_id: user.id,
        token,
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        device_type: 'test-device',
      },
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: { username },
    });
  });

  it('should logout successfully', async () => {
    const res = await app.request('/auth/logout', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe('Logout successful');
  });

  it('should fail if token is invalid', async () => {
    const res = await app.request('/auth/logout', {
      headers: {
        Authorization: 'Bearer invalidtoken',
      },
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Token not available');
  });

  it('should fail if token is missing', async () => {
    const res = await app.request('/auth/logout');

    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Invalid token');
  });
});

describe('GET /auth/verify', () => {
  const username = 'user_test_verify';
  const password = 'pass_test_verify';
  let token: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prismaClient.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'member',
        is_active: true,
      },
    });

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      is_active: user.is_active,
      iat: Math.floor(Date.now() / 1000),
      exp: APP_JWT_EXP,
    };

    token = await sign(payload, APP_JWT_SECRET, 'HS256');

    await prismaClient.auth.create({
      data: {
        user_id: user.id,
        token,
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        device_type: 'test-device',
      },
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: { username },
    });
  });

  it('should verify and return user data', async () => {
    const res = await app.request('/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data?.data?.username).toBe(username);
    expect(data?.data?.role).toBe('member');
  });

  it('should fail if token is invalid', async () => {
    const res = await app.request('/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer invalidtoken',
      },
    });

    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Invalid JWT token');
  });

  it('should fail if token is missing', async () => {
    const res = await app.request('/auth/verify', {
      method: 'GET',
    });

    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Invalid token');
  });
});
