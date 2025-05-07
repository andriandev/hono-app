"use client";
import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";

export type ToastProps = {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  onClose: () => void;
};

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  position = "top-right",
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => setVisible(false), duration);
    const cleanup = setTimeout(() => onClose(), duration + 500);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      clearTimeout(cleanup);
    };
  }, [duration, onClose]);

  const basePos = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }[position];

  const bgColor = {
    success: "bg-green-600",
    error: "bg-rose-600",
    info: "bg-indigo-600",
    warning: "bg-yellow-600",
  }[type];

  const icon = {
    success: (
      <svg
        className="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg
        className="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    info: (
      <svg
        className="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="h-6 w-6 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z"
        />
      </svg>
    ),
  }[type];

  return (
    <div
      className={`fixed z-50 overflow-clip transition-all duration-500 ease-in-out ${basePos} ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex max-w-xs min-w-[250px] cursor-pointer items-center gap-3 rounded px-4 py-3 text-white shadow-lg ${bgColor}`}
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 500);
        }}
      >
        {icon}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
