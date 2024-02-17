import { resJSON } from '../helpers/function.js';

export function Home(c) {
  const userAgent = c.req.header('User-Agent');

  const resData = resJSON({ data: `UserAgent : ${userAgent}` });
  const statusCode = resData?.status;

  return c.json(resData, statusCode);
}

export function Page(c) {
  const id = c.req.param('id');
  const query = c.req.query('q');

  const resData = resJSON({
    data: `param id : ${id} and query q : ${query || 'nothing'}`,
  });
  const statusCode = resData?.status;

  return c.json(resData, statusCode);
}
