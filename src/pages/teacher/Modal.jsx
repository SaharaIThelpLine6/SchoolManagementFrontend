import React, { useEffect } from 'react';

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`w-full ${sizeMap[size] ?? sizeMap.md} bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden`}
      >
        {/* Header — gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-4 sm:px-5 py-3 sm:py-3.5 text-white">
          <div className="pointer-events-none absolute -right-8 -top-14 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-6 h-36 w-36 rounded-full bg-white/5" />

          <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/20 backdrop-blur">
                {icon ?? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <h3
                  id="modal-title"
                  className="text-sm sm:text-base font-bold leading-tight truncate"
                >
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-colors shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ✅ Body — horizontal overflow বন্ধ */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="w-full min-w-0 shrink-0 px-3 sm:px-5 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-200">
            <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};