import React from 'react';
import { LABELS, MONTHS_BN } from '../../helper/labels';

export const MonthSelect = ({
  value,
  onChange,
  id,
  className = '',
  disabled = false,
}) => {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={LABELS.common.month}
      className={`h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-colors disabled:bg-slate-100 ${className}`}
    >
      {MONTHS_BN.map((name, idx) => (
        <option key={name} value={idx + 1}>
          {name}
        </option>
      ))}
    </select>
  );
};