// SalaryYearSelect.jsx — Salary_Year টেবিল থেকে বছর (YearID) সিলেক্ট
// ব্যবহার: <SalaryYearSelect value={yearId} onChange={setYearId} />
// value না থাকলে চলতি বছর (না পেলে প্রথম বছর) অটো সিলেক্ট হবে।
import React, { useEffect } from 'react';
import { toBengaliDigits } from '../../utils/format';
import { useGetYearsQuery } from '../../features/teachers/teachersSlice';

export const SalaryYearSelect = ({ id, value, onChange, className = '' }) => {
  const { data: yearsRes, isLoading } = useGetYearsQuery();
  const years = yearsRes?.data ?? [];

  useEffect(() => {
    if (!value && years.length > 0) {
      const current = years.find((y) => Number(y.YearValue) === new Date().getFullYear());
      onChange(Number((current ?? years[0]).YearID));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years, value]);

  return (
    <select
      id={id}
      value={value ?? ''}
      disabled={isLoading}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className={`h-10 min-w-[110px] px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 ${className}`}
    >
      {years.length === 0 && <option value="">বছর নেই</option>}
      {years.map((y) => (
        <option key={y.YearID} value={y.YearID}>
          {toBengaliDigits(y.YearValue)}
          {!y.IsActive ? ' (নিষ্ক্রিয়)' : ''}
        </option>
      ))}
    </select>
  );
};

// YearID → সাল (যেমন ২০২৬) বের করার হুক
export const useYearValue = (yearId) => {
  const { data: yearsRes } = useGetYearsQuery();
  const y = (yearsRes?.data ?? []).find((x) => Number(x.YearID) === Number(yearId));
  return y ? Number(y.YearValue) : '';
};
