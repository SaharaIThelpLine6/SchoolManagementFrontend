import React from 'react';
import { LABELS } from '../../helper/labels';

export const MoneyInput = ({
  value,
  onChange,
  placeholder = '0',
  disabled = false,
  min = 0,
  max,
  hasError = false,
  id,
  className = '',
  compact = false,
  ariaLabel,
}) => {
  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    if (parsed < 0) return;
    onChange(Math.round(parsed));
  };

  return (
    <div
      className={`relative flex items-center rounded-lg border bg-white transition-colors ${disabled ? 'bg-slate-100 border-slate-200 text-slate-500' : ''
        } ${hasError
          ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
          : 'border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-500/25'
        } ${className}`}
    >
      <span
        className={`select-none text-slate-400 font-medium ${compact ? 'pl-2 text-xs' : 'pl-3 text-sm'
          }`}
      >
        {LABELS.app.currencySymbol}
      </span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`w-full bg-transparent text-right tabular-nums outline-none disabled:cursor-not-allowed ${compact ? 'py-1.5 pr-2 pl-1 text-sm' : 'py-2 pr-3 pl-1.5 text-sm'
          }`}
      />
    </div>
  );
};