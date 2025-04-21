import { Layout } from '@view/layout';

export function ErrorPage({ message }) {
  return Layout({
    title: '500 Internal Server Error',
    children: `<p>${message}</p>`,
  });
}
