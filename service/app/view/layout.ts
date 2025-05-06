import { LayoutTypes } from '@app/helpers/types';

export function Layout(props: LayoutTypes) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">${
    props?.meta ? props?.meta : ''
  }<meta name="referrer" content="no-referrer"><meta name="robots" content="noindex, nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${
    props?.title ? props?.title : ''
  }</title><link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet"><style>*{box-sizing:border-box}body{margin:0;padding:0;font-family:Poppins,sans-serif;background-color:#1e1e1e;color:#fff;overflow-x:hidden;word-break:break-word;overflow-wrap:break-word}h1{font-size:1.2rem;font-weight:600;margin:0;margin-bottom:1.5rem}p{margin:.2rem 0}a{color:#4dabf7;text-decoration:none}a:hover{color:#74c0fc}main{font-size:1rem;max-width:100%;padding:.5rem;margin:1rem auto;box-sizing:border-box}.date{margin-top:2rem;font-size:.85rem}@media (width >= 40rem){h1{font-size:1.4rem}main{max-width:80%}}@media (width >= 64rem){main{max-width:60%}}</style></head><body>${
    props?.children ? `<main>${props?.children}</main>` : ''
  }</body></html>`;
}
