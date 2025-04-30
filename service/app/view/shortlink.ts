import { Layout } from '@view/layout';

export function ShortlinkPage({ href }) {
  return Layout({
    meta: `<meta http-equiv="refresh" content="0;url=${href}">`,
    title: 'Redirecting...',
    children: `<p>If you're not redirected, <a href="${href}" rel="nofollow noopener noreferrer">click here</a>.</p>`,
  });
}
