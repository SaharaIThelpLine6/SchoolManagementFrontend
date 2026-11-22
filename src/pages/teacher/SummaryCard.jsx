import React from 'react';

const TONE_VALUE_CLASS = {
  neutral: 'text-slate-900',
  teal: 'text-teal-700',
  emerald: 'text-emerald-700',
  amber: 'text-amber-700',
  red: 'text-red-700',
  blue: 'text-blue-700',
};

export const SummaryCard = ({
  label,
  value,
  hint,
  tone = 'neutral',
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5">
      <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
      <p className={`text-xl font-bold tabular-nums mt-1 truncate ${TONE_VALUE_CLASS[tone]}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-slate-500 mt-1 truncate">{hint}</p>}
    </div>
  );
};