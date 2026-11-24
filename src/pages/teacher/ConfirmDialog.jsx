import React from 'react';
import { LABELS } from '../../helper/labels';


const variantStyles = {
  primary: {
    icon: 'text-teal-600 bg-teal-50 border-teal-200',
    confirm: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  warning: {
    icon: 'text-amber-600 bg-amber-50 border-amber-200',
    confirm: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  danger: {
    icon: 'text-red-600 bg-red-50 border-red-200',
    confirm: 'bg-red-600 hover:bg-red-700 text-white',
  },
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'primary',
  confirmLabel,
  cancelLabel,
}) => {
  if (!isOpen) return null;

  const styles = variantStyles[variant] ?? variantStyles.primary;

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200">
        <div className="p-5">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border shrink-0 ${styles.icon}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3
                id="confirm-dialog-title"
                className="text-base font-semibold text-slate-900"
              >
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50 border-t border-slate-200 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {cancelLabel ?? LABELS.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${styles.confirm}`}
          >
            {confirmLabel ?? LABELS.common.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};