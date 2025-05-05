type ToastType = "success" | "error" | "info" | "warning";

type ToastOption = {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

const listeners: ((option: ToastOption) => void)[] = [];

export function toast(option: ToastOption) {
  listeners.forEach((cb) => cb(option));
}

export function subscribe(cb: (option: ToastOption) => void) {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i !== -1) listeners.splice(i, 1);
  };
}
