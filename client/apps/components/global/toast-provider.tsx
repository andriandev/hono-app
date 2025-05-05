"use client";

import { useEffect, useState } from "react";
import { subscribe } from "@/components/shared/toast";
import Toast, { ToastProps } from "@/components/global/toast";

let idCounter = 0;

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Array<{ id: number } & ToastProps>>([]);

  useEffect(() => {
    return subscribe((option) => {
      const id = idCounter++;
      setToasts((prev) => [
        ...prev,
        {
          id,
          ...option,
          onClose: () => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          },
        },
      ]);
    });
  }, []);

  return (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </>
  );
}
