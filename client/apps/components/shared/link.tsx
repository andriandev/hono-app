import NextLink, { LinkProps } from "next/link";
import { ReactNode } from "react";

type Props = LinkProps & {
  children: ReactNode;
  className?: string;
};

export default function Link({
  children,
  prefetch = false,
  className = "",
  ...props
}: Props) {
  return (
    <NextLink prefetch={prefetch} className={className} {...props}>
      {children}
    </NextLink>
  );
}
