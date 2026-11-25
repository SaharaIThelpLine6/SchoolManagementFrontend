// PaymentsPage.jsx — বেতন পরিশোধ (v2: YearID / MonthID)
import React, { useEffect, useMemo, useState } from 'react';
import { MoneyInput } from './MoneyInput';
import { StatusBadge } from './StatusBadge';
import { SummaryCard } from './SummaryCard';
import { ReceiptView } from './ReceiptView';
import { TeacherSelect } from './TeacherSelect';
import { SalaryYearSelect, useYearValue } from './SalaryYearSelect';
import { LABELS } from '../../helper/labels';
import { formatDate, formatMoney, getTodayISO, numberToBengaliWords, toBengaliDigits } from '../../utils/format';
import { mapTeacher, mapPayment, mapMonthRow, distributeToDue, toNum, round2 } from '../../helper/salaryMappers';
import {
  useGetTeachersQuery,
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useGetMonthStatusQuery,
  useGetTeacherSummaryQuery,
} from '../../features/teachers/teachersSlice';

const Icon = ({ d, size = 14, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {d.map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const IC = {
  wallet: ['M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1', 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4'],
  spark: ['m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z'],
  eraser: ['m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21', 'M22 21H7', 'm5 11 9 9'],
  receipt: ['M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z', 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8', 'M12 17.5v-11'],
  down: ['m6 9 6 6 6-6'],
  right: ['m9 18 6-6-6-6'],
};

export const PaymentsPage = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [yearId, setYearId] = useState(null);
  const yearValue = useYearValue(yearId);

  const [paymentDate, setPaymentDate] = useState(getTodayISO());
  const [method, setMethod] = useState('CASH');
  const [note, setNote] = useState('');

  const [bulkAmount, setBulkAmount] = useState('');
  const [unallocatedNotice, setUnallocatedNotice] = useState(0);
  const [monthInputs, setMonthInputs] = useState({}); // { [MonthID]: number|'' }
  const [submitError, setSubmitError] = useState('');

  const [receiptPayment, setReceiptPayment] = useState(null);
  const [expandedPaymentIds, setExpandedPaymentIds] = useState({});

  const [toast, setToast] = useState(null);
  const addToast = (kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 3000);
  };

  // ─── Queries ──────────────────────────────────────────────────
  const { data: teachersRes, isLoading: teachersLoading } = useGetTeachersQuery();
  const teachers = useMemo(() => (teachersRes?.data ?? []).map(mapTeacher), [teachersRes]);

  useEffect(() => {
    if (!selectedUserId && teachers.length > 0) setSelectedUserId(teachers[0].userId);
  }, [teachers, selectedUserId]);

  const { data: paymentsRes, isLoading: paymentsLoading } = useGetPaymentsQuery({ UserID: selectedUserId }, { skip: !selectedUserId });
  const { data: monthStatusRes, isLoading: monthStatusLoading, isFetching: monthStatusFetching } = useGetMonthStatusQuery(
    { UserID: selectedUserId, YearID: yearId },
    { skip: !selectedUserId || !yearId }
  );
  const { data: summaryRes } = useGetTeacherSummaryQuery({ UserID: selectedUserId }, { skip: !selectedUserId });

  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();

  const isLoading = teachersLoading || paymentsLoading || monthStatusLoading || monthStatusFetching;

  const payments = useMemo(() => (paymentsRes?.data ?? []).map(mapPayment), [paymentsRes]);

  const teacherSummary = useMemo(() => {
    const s = summaryRes?.data;
    return { totalDue: toNum(s?.totalDue), totalAdvance: toNum(s?.totalAdvance), lastPaymentDate: s?.lastPaymentDate ?? null };
  }, [summaryRes]);

  const selectedTeacher = useMemo(
    () => teachers.find((t) => Number(t.userId) === Number(selectedUserId)) ?? null,
    [teachers, selectedUserId]
  );

  // ─── বছরের সব মাস (ডাটাবেস থেকে) ─────────────────────────────
  const monthRows = useMemo(() => {
    if (!selectedUserId || !yearId) return [];
    return (monthStatusRes?.data ?? []).map(mapMonthRow);
  }, [selectedUserId, yearId, monthStatusRes]);

  // ─── Handlers ─────────────────────────────────────────────────
  const resetInputs = () => {
    setMonthInputs({});
    setBulkAmount('');
    setUnallocatedNotice(0);
    setSubmitError('');
  };

  const handleTeacherChange = (userId) => {
    setSelectedUserId(userId);
    resetInputs();
  };

  const handleYearChange = (id) => {
    setYearId(id);
    resetInputs();
  };

  const handleCellInputChange = (monthId, val) => {
    setMonthInputs((prev) => ({ ...prev, [monthId]: val }));
    setUnallocatedNotice(0);
    if (submitError) setSubmitError('');
  };

  const handleAutoDistribute = () => {
    const total = toNum(bulkAmount);
    if (total <= 0) return;
    const { allocations, unallocated } = distributeToDue(total, monthRows);
    const next = {};
    for (const r of monthRows) next[r.monthId] = allocations[r.monthId] > 0 ? allocations[r.monthId] : '';
    setMonthInputs(next);
    setUnallocatedNotice(unallocated);
    setSubmitError('');
  };

  const handlePayAllDue = () => {
    const next = {};
    let total = 0;
    for (const r of monthRows) {
      if (r.hasSheet && r.due > 0) {
        next[r.monthId] = r.due;
        total += r.due;
      }
    }
    setMonthInputs(next);
    setBulkAmount(total > 0 ? round2(total) : '');
    setUnallocatedNotice(0);
    setSubmitError('');
  };

  const cellErrors = useMemo(() => {
    const errs = {};
    for (const r of monthRows) {
      const val = toNum(monthInputs[r.monthId]);
      if (val > 0 && r.hasSheet && val > r.due) {
        errs[r.monthId] = LABELS.paymentsPage.errorExceedsDue.replace('{due}', formatMoney(r.due));
      }
    }
    return errs;
  }, [monthInputs, monthRows]);
  const hasCellErrors = Object.keys(cellErrors).length > 0;

  const payingTotal = useMemo(
    () => round2(monthRows.reduce((sum, r) => sum + toNum(monthInputs[r.monthId]), 0)),
    [monthInputs, monthRows]
  );
  const inWordsText = useMemo(() => numberToBengaliWords(payingTotal), [payingTotal]);

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return setSubmitError(LABELS.paymentsPage.errorSelectTeacher);
    if (hasCellErrors) return setSubmitError(LABELS.paymentsPage.errorFixTable);
    if (payingTotal <= 0) return setSubmitError(LABELS.paymentsPage.errorPositiveAmount);

    // ✅ backend এখন YearID / MonthID চায়
    const details = monthRows
      .map((r) => ({ YearID: Number(yearId), MonthID: r.monthId, Amount: toNum(monthInputs[r.monthId]) }))
      .filter((d) => d.Amount > 0);

    try {
      const res = await createPayment({
        UserID: Number(selectedUserId),
        PaymentDate: paymentDate || getTodayISO(),
        PaymentMethod: method,
        Note: note?.trim() || null,
        Details: details,
      }).unwrap();

      addToast('success', LABELS.paymentsPage.toastPaymentSaved.replace('{receiptNo}', res?.data?.ReceiptNo ?? ''));
      resetInputs();
      setNote('');
      setReceiptPayment(mapPayment(res.data));
    } catch (err) {
      setSubmitError(err?.data?.error ?? 'পেমেন্ট সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  const teacherPayments = useMemo(
    () =>
      payments
        .filter((p) => Number(p.userId) === Number(selectedUserId))
        .sort((a, b) => String(b.paymentDate).localeCompare(String(a.paymentDate))),
    [payments, selectedUserId]
  );

  const yearTotals = useMemo(
    () => monthRows.reduce((acc, r) => ({ net: acc.net + r.net, paid: acc.paid + r.paid, due: acc.due + r.due }), { net: 0, paid: 0, due: 0 }),
    [monthRows]
  );

  return (
    <div className="space-y-6">
      {/* ===================== হেডার */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-5 py-4 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/20 backdrop-blur">
              <Icon size={20} d={IC.wallet} />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight sm:text-[20px]">{LABELS.nav.payments}</h3>
              <p className="text-xs text-white/80 sm:text-sm">{LABELS.paymentsPage.subtitle}</p>
            </div>
          </div>
          {selectedTeacher && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
                <span className="text-[13px] font-medium">{LABELS.paymentsPage.summaryTotalDue}</span>
                <span className="text-[15px] font-bold leading-none">{formatMoney(teacherSummary.totalDue)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
                <span className="text-[13px] font-medium">{LABELS.paymentsPage.summaryTotalAdvance}</span>
                <span className="text-[15px] font-bold leading-none">{formatMoney(teacherSummary.totalAdvance)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmitPayment} className="space-y-5">
        {/* ===================== ফর্ম */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">{LABELS.paymentsPage.formSectionTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="pay-teacher-select" className="block text-xs font-medium text-slate-600 mb-1.5">
                {LABELS.common.teacher} <span className="text-red-500">*</span>
              </label>
              <TeacherSelect id="pay-teacher-select" teachers={teachers} value={selectedUserId} onChange={handleTeacherChange} />
            </div>
            <div>
              <label htmlFor="pay-date-input" className="block text-xs font-medium text-slate-600 mb-1.5">{LABELS.paymentsPage.paymentDateLabel}</label>
              <input
                id="pay-date-input"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
              />
            </div>
            <div>
              <label htmlFor="pay-method-select" className="block text-xs font-medium text-slate-600 mb-1.5">{LABELS.paymentsPage.methodLabel}</label>
              <select
                id="pay-method-select"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
              >
                {['CASH', 'BANK', 'BKASH', 'OTHER'].map((m) => <option key={m} value={m}>{LABELS.paymentMethods[m]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pay-note-input" className="block text-xs font-medium text-slate-600 mb-1.5">{LABELS.paymentsPage.noteLabel}</label>
              <input
                id="pay-note-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={LABELS.paymentsPage.notePlaceholder}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
              />
            </div>
          </div>
        </div>

        {/* ===================== সারাংশ */}
        {selectedTeacher && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard label={LABELS.paymentsPage.summaryTotalDue} value={formatMoney(teacherSummary.totalDue)} tone={teacherSummary.totalDue > 0 ? 'red' : 'emerald'} />
            <SummaryCard label={LABELS.paymentsPage.summaryTotalAdvance} value={formatMoney(teacherSummary.totalAdvance)} tone={teacherSummary.totalAdvance > 0 ? 'blue' : 'neutral'} />
            <SummaryCard
              label={LABELS.paymentsPage.summaryLastPayment}
              value={teacherSummary.lastPaymentDate ? formatDate(teacherSummary.lastPaymentDate) : LABELS.paymentsPage.noPaymentYet}
              tone="neutral"
            />
          </div>
        )}

        {/* ===================== মাসভিত্তিক গ্রিড */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-end justify-between gap-4 bg-slate-50/50">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="pay-year-select" className="block text-xs font-medium text-slate-600 mb-1">{LABELS.common.year}</label>
                <SalaryYearSelect id="pay-year-select" value={yearId} onChange={handleYearChange} />
              </div>
              <div className="w-44">
                <label htmlFor="pay-bulk-amount" className="block text-xs font-medium text-slate-600 mb-1">{LABELS.paymentsPage.totalAmountInputLabel}</label>
                <MoneyInput id="pay-bulk-amount" value={bulkAmount} onChange={setBulkAmount} placeholder="0" />
              </div>
              <button
                type="button"
                onClick={handleAutoDistribute}
                disabled={toNum(bulkAmount) <= 0}
                className="h-10 inline-flex items-center gap-1.5 px-4 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Icon size={16} d={IC.spark} />
                <span>{LABELS.paymentsPage.autoDistributeBtn}</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={handlePayAllDue} className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap">
                <Icon d={IC.wallet} /><span>{LABELS.paymentsPage.payAllDueBtn}</span>
              </button>
              <button type="button" onClick={resetInputs} className="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap">
                <Icon d={IC.eraser} /><span>{LABELS.paymentsPage.clearAllBtn}</span>
              </button>
            </div>
          </div>

          {unallocatedNotice > 0 && (
            <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-200 text-xs text-blue-800 font-medium">
              {LABELS.paymentsPage.unallocatedNotice.replace('{amount}', formatMoney(unallocatedNotice))}
            </div>
          )}

          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-md animate-pulse" />)}
            </div>
          ) : monthRows.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              এই বছরের কোনো মাস তৈরি করা নেই। "মাসিক বেতন তৈরি" পেজের "মাস ম্যানেজ" থেকে মাস তৈরি করুন।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse min-w-[740px]">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">{LABELS.paymentsPage.colMonth}</th>
                    <th className="py-3 px-4 font-semibold text-right">{LABELS.paymentsPage.colNet}</th>
                    <th className="py-3 px-4 font-semibold text-right">{LABELS.paymentsPage.colPreviouslyPaid}</th>
                    <th className="py-3 px-4 font-semibold text-right">{LABELS.paymentsPage.colDue}</th>
                    <th className="py-3 px-4 font-semibold text-center">{LABELS.paymentsPage.colStatus}</th>
                    <th className="py-3 px-4 font-semibold text-right w-56">{LABELS.paymentsPage.colPayingNow}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthRows.map((row) => {
                    const inputVal = monthInputs[row.monthId] ?? '';
                    const err = cellErrors[row.monthId];
                    return (
                      <tr key={row.monthId} className={`transition-colors ${!row.hasSheet ? 'bg-slate-50/70 text-slate-500' : 'bg-white hover:bg-slate-50/70'}`}>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${row.hasSheet ? 'text-slate-900' : 'text-slate-500'}`}>{row.monthName}</span>
                            {!row.hasSheet && <span className="text-[11px] text-slate-400">({LABELS.paymentsPage.noSheetTag})</span>}
                            {row.hasSheet && row.sheetStatus === 'DRAFT' && <span className="text-[11px] text-amber-600">(খসড়া)</span>}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono-num">{row.hasSheet ? formatMoney(row.net) : '—'}</td>
                        <td className="py-2.5 px-4 text-right font-mono-num">{formatMoney(row.paid)}</td>
                        <td className={`py-2.5 px-4 text-right font-mono-num font-medium ${row.due > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                          {row.hasSheet ? formatMoney(row.due) : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-center"><StatusBadge variant={{ kind: 'month', status: row.status }} /></td>
                        <td className="py-2 px-4">
                          <div className="space-y-1">
                            <MoneyInput
                              compact
                              value={inputVal}
                              hasError={Boolean(err)}
                              onChange={(val) => handleCellInputChange(row.monthId, val)}
                              ariaLabel={`${row.monthName} ${LABELS.paymentsPage.colPayingNow}`}
                            />
                            {err && <p className="text-[11px] text-red-600 text-right leading-tight">{err}</p>}
                            {!err && !row.hasSheet && toNum(inputVal) > 0 && (
                              <p className="text-[11px] text-blue-700 text-right leading-tight">{LABELS.paymentsPage.advanceTag}</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-800">
                  <tr>
                    <td className="py-3 px-4">{LABELS.common.total} {yearValue ? `(${toBengaliDigits(yearValue)})` : ''}</td>
                    <td className="py-3 px-4 text-right font-mono-num">{formatMoney(yearTotals.net)}</td>
                    <td className="py-3 px-4 text-right font-mono-num text-emerald-700">{formatMoney(yearTotals.paid)}</td>
                    <td className="py-3 px-4 text-right font-mono-num text-red-700">{formatMoney(yearTotals.due)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-sm font-medium text-slate-600">{LABELS.paymentsPage.footerPayingTotal}:</span>
                <span className="text-xl font-bold font-mono-num text-teal-800">{formatMoney(payingTotal)}</span>
              </div>
              <p className="text-xs text-slate-600">
                <span className="text-slate-500">{LABELS.paymentsPage.footerInWords}: </span>
                <span className="font-medium text-slate-800">{inWordsText}</span>
              </p>
              {submitError && <p className="text-xs font-medium text-red-600 pt-0.5">{submitError}</p>}
            </div>
            <button
              type="submit"
              disabled={hasCellErrors || payingTotal <= 0 || isCreating}
              className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isCreating ? '...' : LABELS.paymentsPage.submitPaymentBtn}
            </button>
          </div>
        </div>
      </form>

      {/* ===================== আগের পেমেন্ট */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">{LABELS.paymentsPage.previousPaymentsTitle}</h3>
        </div>

        {teacherPayments.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">{LABELS.paymentsPage.previousPaymentsEmpty}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {teacherPayments.map((p) => {
              const expanded = Boolean(expandedPaymentIds[p.paymentId]);
              return (
                <div key={p.paymentId} className="px-5 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedPaymentIds((prev) => ({ ...prev, [p.paymentId]: !prev[p.paymentId] }))}
                      className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                    >
                      <Icon size={16} d={expanded ? IC.down : IC.right} className="text-slate-400 shrink-0" />
                      <span className="font-mono-num text-sm text-slate-700 shrink-0">{formatDate(p.paymentDate)}</span>
                      <span className="text-slate-300">·</span>
                      <span className={`font-mono-num text-sm font-medium ${p.isReversed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{p.receiptNo}</span>
                      <span className="text-slate-300 hidden sm:inline">·</span>
                      <span className="text-xs text-slate-500 hidden sm:inline">{LABELS.paymentMethods[p.method]}</span>
                      {p.isReversed && <StatusBadge variant={{ kind: 'reversed' }} />}
                    </button>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`font-mono-num text-sm font-bold ${p.isReversed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{formatMoney(p.totalAmount)}</span>
                      <button
                        type="button"
                        onClick={() => setReceiptPayment(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 whitespace-nowrap"
                      >
                        <Icon d={IC.receipt} /><span>{LABELS.paymentsPage.viewReceipt}</span>
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-2.5 ml-6 pl-3 border-l border-slate-200 space-y-1.5">
                      <div className="flex flex-wrap gap-2">
                        {p.details.map((d, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-50 border border-slate-200 text-slate-700">
                            <span>{d.monthName} {d.year ? toBengaliDigits(d.year) : ''}:</span>
                            <span className="font-mono-num font-semibold text-slate-900">{formatMoney(d.amount)}</span>
                          </span>
                        ))}
                      </div>
                      {p.note && <p className="text-xs text-slate-500">{p.note}</p>}
                      {p.isReversed && p.reverseReason && (
                        <p className="text-xs text-red-600">{LABELS.receipt.reverseReason}: {p.reverseReason}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ReceiptView
        payment={receiptPayment}
        teacher={teachers.find((t) => Number(t.userId) === Number(receiptPayment?.userId))}
        isOpen={Boolean(receiptPayment)}
        onClose={() => setReceiptPayment(null)}
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${toast.kind === 'error' ? 'bg-red-600' : 'bg-slate-900'}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
};
