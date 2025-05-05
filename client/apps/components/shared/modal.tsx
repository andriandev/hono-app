import { ReactNode, useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  footer,
  children,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div
      className={`scrollbar-thin scrollbar-thumb fixed inset-0 z-[999] flex items-center justify-center bg-black/40 transition-opacity duration-500 ${
        isOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div
        className={`relative mx-auto flex h-[100vh] w-full max-w-7xl transform flex-col overflow-hidden rounded-xl bg-slate-700 shadow-xl transition-all duration-500 md:h-[93vh] ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-10 opacity-0"
        }`}
      >
        {/* Header */}
        {title && (
          <div className="font-semi-bold sticky top-0 z-10 bg-slate-700 px-6 py-3 text-lg shadow">
            {title}
          </div>
        )}

        {/* Content */}
        <div className="h-full flex-1 overflow-y-auto px-6 py-8">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 z-10 bg-slate-700 px-6 py-4 text-right shadow">
            {footer}
            <button
              onClick={onClose}
              className="ml-3 rounded-md bg-slate-800 px-3 py-1.5 hover:bg-slate-900"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
