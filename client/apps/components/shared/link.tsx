import NextLink, { LinkProps } from 'next/link';
import { ReactNode } from 'react';

type Props = LinkProps & {
  children: ReactNode;
};

export default function Link({ children, prefetch = false, ...props }: Props) {
  return (
    <NextLink prefetch={prefetch} {...props}>
      {children}
    </NextLink>
  );
}
