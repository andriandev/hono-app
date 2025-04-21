import { LayoutTypes } from '@app/helpers/types';

export function Layout(props: LayoutTypes) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">${
    props?.meta ? props?.meta : ''
  }<meta name="referrer" content="no-referrer"><meta name="robots" content="noindex, nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${
    props?.title ? props?.title : ''
  }</title><style>body{margin:0;padding:0;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;height:100dvh;font-family:sans-serif;text-align:center}p{font-size:1.2rem;padding:0 1rem}a{text-decoration:none}</style></head><body>${
    props?.children ? props?.children : ''
  }</body></html>`;
}
