"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error?.message);
  }, [error]);

  return (
    <html>
      <body>
        <p className="m-5">
          Something went wrong! Please try again later or contact support.
        </p>
        <p className="m-5">Global Error</p>
      </body>
    </html>
  );
}
