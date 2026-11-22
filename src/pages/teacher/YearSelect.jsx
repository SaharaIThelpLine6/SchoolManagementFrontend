import React from 'react';
import { AVAILABLE_YEARS, LABELS } from '../../helper/labels';

export const YearSelect = ({
  value,
  onChange,
  id,
  className = '',
  disabled = false,
  years = AVAILABLE_YEARS,
}) => {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={LABELS.common.year}
      className={`h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-colors disabled:bg-slate-100 ${className}`}
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
};