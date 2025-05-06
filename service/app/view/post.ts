import { Layout } from '@view/layout';
import { formatDateTime } from '@app/helpers/function';

export function PostPage({ data }) {
  return Layout({
    title: `${data.title}`,
    children: `<h1>${data.title}</h1>${
      data.content
    }<p class="date">Created at ${formatDateTime(data.created_at)}</p>`,
  });
}
