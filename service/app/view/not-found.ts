import { Layout } from '@view/layout';

export function NotFoundPage() {
  return Layout({
    title: '404 Page Not Found',
    children: `<p>404 Page not found.</p>`,
  });
}
