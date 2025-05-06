import { Context } from 'hono';
import { filterStringAlias } from '@app/helpers/function';
import { ShortlinkPage } from '@app/view/shortlink';
import { PostPage } from '@app/view/post';
import { NotFoundPage } from '@app/view/not-found';
import { logger } from '@app/config/logging';
import { cache } from '@app/config/cache';

type ShortlinkData = {
  id: number;
  alias: string;
  destination: string;
  view: number;
  created_at: string;
};

type PostData = {
  id: number;
  hash_id: string;
  user_id: string;
  title: string;
  content?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const serverUrl = process.env.APP_SERVER_URL;

export async function Shortlink(c: Context) {
  const alias = filterStringAlias(c.req.param('alias'));
  const aliasShortlink = alias.replace(/\+/g, '');
  let destination: string;

  if (alias.endsWith('+')) {
    const response = await fetch(`${serverUrl}/link/${aliasShortlink}`);

    if (response.status === 400) {
      return c.html(NotFoundPage(), 404);
    }

    const result = await response.json();

    return c.html(ShortlinkPage({ data: result?.data }));
  }

  const cacheData: ShortlinkData = cache.has(`alias:${aliasShortlink}`)
    ? cache.get(`alias:${aliasShortlink}`)
    : null;

  if (!cacheData) {
    const response = await fetch(`${serverUrl}/link/${aliasShortlink}`);

    if (response.status === 400) {
      return c.html(NotFoundPage(), 404);
    }

    const result = await response.json();
    destination = result?.data?.destination;

    if (!destination) {
      logger.warn(
        `Destination missing ${c.req.method} ${c.req.path} => ${result}`
      );
      return c.html(NotFoundPage(), 400);
    }

    cache.set(`alias:${aliasShortlink}`, result?.data, 86400);
  } else {
    destination = cacheData.destination;
  }

  if (destination && alias !== 'testing-cache-app') {
    const addView = await fetch(`${serverUrl}/link/${alias}/count`);

    if (addView.status !== 200) {
      logger.warn(
        `Add view failed ${c.req.method} ${c.req.path} => ${addView.status}`
      );
    }
  }

  return c.redirect(destination, 302);
}

export async function Post(c: Context) {
  const hashID = c.req.param('hash_id');
  let postData: PostData;

  const cacheData: PostData = cache.has(`post:${hashID}`)
    ? cache.get(`post:${hashID}`)
    : null;

  if (!cacheData) {
    const response = await fetch(`${serverUrl}/post/${hashID}`);

    if (response.status === 400) {
      return c.html(NotFoundPage(), 404);
    }

    const result = await response.json();
    postData = result?.data;

    cache.set(`post:${hashID}`, result?.data, 86400);
  } else {
    postData = cacheData;
  }

  return c.html(PostPage({ data: postData }));
}
