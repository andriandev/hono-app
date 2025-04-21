import { Context } from 'hono';
import { filterStringAlias } from '@app/helpers/function';
import { ShortlinkPage } from '@app/view/shortlink';
import { NotFoundPage } from '@app/view/not-found';
import { logger } from '@app/config/logging';
import { cache } from '@app/config/cache';

export async function Shortlink(c: Context) {
  const alias = filterStringAlias(c.req.param('alias'));
  const serverUrl = process.env.APP_SERVER_URL;
  let destination: string;

  const cacheData: string | null = cache.has(`alias:${alias}`)
    ? cache.get(`alias:${alias}`)
    : null;

  if (!cacheData) {
    const response = await fetch(`${serverUrl}/link/${alias}`);

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

    cache.set(`alias:${alias}`, destination, 86400);
  } else {
    destination = cacheData;
  }

  if (destination) {
    const addView = await fetch(`${serverUrl}/link/${alias}/count`);

    if (addView.status !== 200) {
      logger.warn(
        `Add view failed ${c.req.method} ${c.req.path} => ${addView.status}`
      );
    }
  }

  return c.html(ShortlinkPage({ href: destination }));
}
