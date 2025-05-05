"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error?.message);
  }, [error]);

  return (
    <p className="m-5">
      Something went wrong! Please try again later or contact support.
    </p>
  );
}
