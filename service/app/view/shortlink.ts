import { Layout } from '@view/layout';
import { formatDateTime } from '@app/helpers/function';

export function ShortlinkPage({ data }) {
  return Layout({
    title: `Info ${data.alias}`,
    children: `<div><p>${data.alias}</p><p>${data.destination}</p><p>${
      data.view
    }</p><p>${formatDateTime(data.created_at)}</p><p>${
      data.created_at
    }</p></div>`,
  });
}
