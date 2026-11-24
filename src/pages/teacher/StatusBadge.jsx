import React from 'react';
import { LABELS } from '../../helper/labels';

const base =
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border whitespace-nowrap';

const earningClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
const deductionClass = 'text-red-700 bg-red-50 border-red-200';
const draftClass = 'text-amber-700 bg-amber-50 border-amber-200';
const finalClass = 'text-teal-700 bg-teal-50 border-teal-200';

const dot = (colorClass) => (
  <span className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
);

export const StatusBadge = ({ variant }) => {
  if (!variant) return null;

  // Head type badge (EARNING / DEDUCTION)
  if (variant.kind === 'head') {
    const isEarning = variant.type === 'EARNING';
    return (
      <span className={`${base} ${isEarning ? earningClass : deductionClass}`}>
        {dot(isEarning ? 'bg-emerald-500' : 'bg-red-500')}
        {LABELS.headTypes?.[variant.type] ?? variant.type}
      </span>
    );
  }

  // Sheet status badge (DRAFT / FINAL)
  if (variant.kind === 'sheet') {
    const isFinal = variant.status === 'FINAL';
    return (
      <span className={`${base} ${isFinal ? finalClass : draftClass}`}>
        {dot(isFinal ? 'bg-teal-500' : 'bg-amber-500')}
        {isFinal
          ? LABELS.sheetStatus?.FINAL ?? 'FINAL'
          : LABELS.sheetStatus?.DRAFT ?? 'DRAFT'}
      </span>
    );
  }

  return null;
};