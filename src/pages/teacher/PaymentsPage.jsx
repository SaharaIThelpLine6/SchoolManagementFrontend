import React, { useEffect, useMemo, useState } from 'react';
import { MoneyInput } from './MoneyInput';
import { StatusBadge } from './StatusBadge';
import { SummaryCard } from './SummaryCard';
import { YearSelect } from './YearSelect';
import { LABELS, MONTHS_BN } from '../../helper/labels';
import {
  formatDate,
  formatMoney,
  getMonthNameBn,
  getTodayISO,
  numberToBengaliWords,
} from '../../utils/format';
import { ReceiptView } from './ReceiptView';
import { TeacherSelect } from './TeacherSelect';
import { autoDistribute, getDueForMonth, getMonthStatus } from '../../utils/calc';
import {
  useGetTeachersQuery,
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useGetMonthStatusQuery,
  useGetTeacherSummaryQuery,
} from '../../features/teachers/teachersSlice';

// ─── Mappers ──────────────────────────────────────────────────────
const mapTeacher = (t) => ({
  userId: t.userId ?? t.UserID,
  userCode: t.userCode ?? t.UserCode ?? '',
  name: t.name ?? t.UserName ?? '',
  designation: (t.designation ?? t.Designation ?? '').trim(),
  mobile: t.mobile ?? t.Mobile ?? '',
});

const mapPayment = (p) => ({
  paymentId: p.PaymentID ?? p.paymentId,
  receiptNo: p.ReceiptNo ?? p.receiptNo,
  userId: p.UserID ?? p.userId,
  paymentDate: (p.PaymentDate ?? p.paymentDate ?? '').toString().slice(0, 10),
  method: p.PaymentMethod ?? p.method ?? 'CASH',
  note: p.Note ?? p.note ?? '',
  totalAmount: Number(p.TotalAmount ?? p.totalAmount ?? 0) || 0,
  inWord: p.InWord ?? p.inWord ?? '',
  isReversed: Boolean(p.IsReversed ?? p.isReversed),
  reverseReason: p.ReverseReason ?? p.reverseReason ?? null,
  details: (p.Details ?? p.details ?? []).map((d) => ({
    year: Number(d.SalaryYear ?? d.year),
    month: Number(d.SalaryMonth ?? d.month),
    amount: Number(d.Amount ?? d.amount ?? 0) || 0,
  })),
});

// ─── Component ────────────────────────────────────────────────────
export const PaymentsPage = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [paymentDate, setPaymentDate] = useState(getTodayISO());
  const [method, setMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  // Auto distribute bulk input
  const [bulkAmount, setBulkAmount] = useState('');
  const [unallocatedNotice, setUnallocatedNotice] = useState(0);

  // Per-month inputs: month (1..12) -> number | ''
  const [monthInputs, setMonthInputs] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Receipt modal
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [expandedPaymentIds, setExpandedPaymentIds] = useState({});

  const [toast, setToast] = useState(null);
  const addToast = (kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 2500);
  };

  // ─── Queries ──────────────────────────────────────────────────
  const { data: teachersRes, isLoading: teachersLoading } = useGetTeachersQuery();

  const teachers = useMemo(
    () => (teachersRes?.data ?? []).map(mapTeacher),
    [teachersRes]
  );

  // Auto-select first teacher
  useEffect(() => {
    if (!selectedUserId && teachers.length > 0) {
      setSelectedUserId(teachers[0].userId);
    }
  }, [teachers, selectedUserId]);

  // Teacher-scoped queries
  const { data: paymentsRes, isLoading: paymentsLoading } = useGetPaymentsQuery(
    { UserID: selectedUserId },
    { skip: !selectedUserId }
  );

  const { data: monthStatusRes, isLoading: monthStatusLoading } = useGetMonthStatusQuery(
    { UserID: selectedUserId, Year: year },
    { skip: !selectedUserId }
  );

  const { data: teacherSummaryRes, isLoading: summaryLoading } = useGetTeacherSummaryQuery(
    { UserID: selectedUserId },
    { skip: !selectedUserId }
  );

  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();

  const isLoading = teachersLoading || paymentsLoading || monthStatusLoading || summaryLoading;

  const payments = useMemo(
    () => (paymentsRes?.data ?? []).map(mapPayment),
    [paymentsRes]
  );

  const teacherSummary = useMemo(() => {
    const s = teacherSummaryRes?.data;
    return {
      totalDue: Number(s?.totalDue ?? 0),
      totalAdvance: Number(s?.totalAdvance ?? 0),
      lastPaymentDate: s?.lastPaymentDate ?? null,
    };
  }, [teacherSummaryRes]);

  const selectedTeacher = useMemo(
    () => teachers.find((t) => Number(t.userId) === Number(selectedUserId)) ?? null,
    [teachers, selectedUserId]
  );

  // ─── Build 12-month rows from backend views ───────────────────
  const monthRows = useMemo(() => {
    if (!selectedUserId) return [];

    const months = monthStatusRes?.data?.months ?? [];
    const advance = monthStatusRes?.data?.advance ?? [];

    // Build paid-by-month lookup from views
    const paidByMonth = new Map();
    for (const m of months) {
      paidByMonth.set(
        Number(m.SalaryMonth),
        (paidByMonth.get(Number(m.SalaryMonth)) ?? 0) + Number(m.PaidAmount || 0)
      );
    }
    for (const a of advance) {
      paidByMonth.set(
        Number(a.SalaryMonth),
        (paidByMonth.get(Number(a.SalaryMonth)) ?? 0) + Number(a.PaidAmount || 0)
      );
    }

    // Build sheet-by-month lookup
    const sheetByMonth = new Map();
    for (const m of months) {
      sheetByMonth.set(Number(m.SalaryMonth), m);
    }

    return MONTHS_BN.map((monthName, idx) => {
      const m = idx + 1;
      const sheetRow = sheetByMonth.get(m);
      const hasSheet = Boolean(sheetRow) && Number(sheetRow.NetAmount) > 0;
      const net = hasSheet ? Number(sheetRow.NetAmount) : 0;
      const paid = paidByMonth.get(m) ?? 0;
      const due = hasSheet ? getDueForMonth(net, paid) : 0;
      const status = getMonthStatus(hasSheet, net, paid);

      return {
        year,
        month: m,
        monthName,
        hasSheet,
        net,
        paid,
        due,
        status,
      };
    });
  }, [selectedUserId, year, monthStatusRes]);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleTeacherChange = (userId) => {
    setSelectedUserId(userId);
    setMonthInputs({});
    setBulkAmount('');
    setUnallocatedNotice(0);
    setSubmitError('');
  };

  const handleYearChange = (newYear) => {
    setYear(newYear);
    setMonthInputs({});
    setUnallocatedNotice(0);
    setSubmitError('');
  };

  const handleCellInputChange = (month, val) => {
    setMonthInputs((prev) => ({ ...prev, [month]: val }));
    setUnallocatedNotice(0);
    if (submitError) setSubmitError('');
  };

  const handleAutoDistribute = () => {
    const total = Number(bulkAmount) || 0;
    if (total <= 0) return;
    const distRows = monthRows.map((r) => ({
      year: r.year,
      month: r.month,
      hasSheet: r.hasSheet,
      net: r.net,
      paid: r.paid,
      due: r.due,
    }));

    const { allocations, unallocated } = autoDistribute(total, distRows);
    const nextInputs = {};
    for (const r of monthRows) {
      const key = `${r.year}-${r.month}`;
      const amt = allocations[key] ?? 0;
      nextInputs[r.month] = amt > 0 ? amt : '';
    }
    setMonthInputs(nextInputs);
    setUnallocatedNotice(unallocated);
    setSubmitError('');
  };

  const handlePayAllDue = () => {
    const nextInputs = {};
    let total = 0;
    for (const r of monthRows) {
      if (r.hasSheet && r.due > 0) {
        nextInputs[r.month] = r.due;
        total += r.due;
      }
    }
    setMonthInputs(nextInputs);
    setBulkAmount(total > 0 ? total : '');
    setUnallocatedNotice(0);
    setSubmitError('');
  };

  const handleClearAll = () => {
    setMonthInputs({});
    setBulkAmount('');
    setUnallocatedNotice(0);
    setSubmitError('');
  };

  // Validate per-cell errors
  const cellErrors = useMemo(() => {
    const errs = {};
    for (const r of monthRows) {
      const val = Number(monthInputs[r.month]) || 0;
      if (val > 0 && r.hasSheet && val > r.due) {
        errs[r.month] = LABELS.paymentsPage.errorExceedsDue.replace(
          '{due}',
          formatMoney(r.due)
        );
      }
    }
    return errs;
  }, [monthInputs, monthRows]);

  const hasCellErrors = Object.keys(cellErrors).length > 0;

  const payingTotal = useMemo(() => {
    let sum = 0;
    for (const val of Object.values(monthInputs)) {
      sum += Number(val) || 0;
    }
    return sum;
  }, [monthInputs]);

  const inWordsText = useMemo(() => numberToBengaliWords(payingTotal), [payingTotal]);

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setSubmitError(LABELS.paymentsPage.errorSelectTeacher);
      return;
    }
    if (hasCellErrors) {
      setSubmitError(LABELS.paymentsPage.errorFixTable);
      return;
    }
    if (payingTotal <= 0) {
      setSubmitError(LABELS.paymentsPage.errorPositiveAmount);
      return;
    }

    // Backend shape
    const details = monthRows
      .map((r) => ({
        SalaryYear: r.year,
        SalaryMonth: r.month,
        Amount: Number(monthInputs[r.month]) || 0,
      }))
      .filter((d) => d.Amount > 0);

    try {
      const res = await createPayment({
        UserID: Number(selectedUserId),
        PaymentDate: paymentDate || getTodayISO(),
        PaymentMethod: method,
        Note: note?.trim() || null,
        Details: details,
      }).unwrap();

      addToast(
        'success',
        LABELS.paymentsPage.toastPaymentSaved.replace(
          '{receiptNo}',
          res?.data?.ReceiptNo ?? ''
        )
      );

      setMonthInputs({});
      setBulkAmount('');
      setUnallocatedNotice(0);
      setNote('');
      setSubmitError('');

      // Build receipt object from backend response for ReceiptView
      const receipt = mapPayment({
        ...res.data,
        Details: res.data.Details ?? details,
      });
      setReceiptPayment(receipt);
    } catch (err) {
      const msg = err?.data?.error ?? '';
      setSubmitError(msg);
    }
  };

  const teacherPayments = useMemo(() => {
    if (!selectedUserId) return [];
    return payments
      .filter((p) => Number(p.userId) === Number(selectedUserId))
      .sort((a, b) => String(b.paymentDate).localeCompare(String(a.paymentDate)));
  }, [payments, selectedUserId]);

  const toggleExpandPayment = (paymentId) => {
    setExpandedPaymentIds((prev) => ({ ...prev, [paymentId]: !prev[paymentId] }));
  };

  return (
    <div className="space-y-6">
      {/* ================================================ গ্রেডিয়েন্ট হেডার — Payments Page */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-5 py-4 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/20 backdrop-blur">
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
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight sm:text-[20px]">
                {LABELS.nav.payments}
              </h3>
              <p className="text-xs text-white/80 sm:text-sm">
                {LABELS.paymentsPage.subtitle}
              </p>
            </div>
          </div>

          {selectedTeacher && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
                <span className="text-[13px] font-medium">
                  {LABELS.paymentsPage.summaryTotalDue}
                </span>
                <span className="text-[15px] font-bold leading-none">
                  {formatMoney(teacherSummary.totalDue)}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
                <span className="text-[13px] font-medium">
                  {LABELS.paymentsPage.summaryTotalAdvance}
                </span>
                <span className="text-[15px] font-bold leading-none">
                  {formatMoney(teacherSummary.totalAdvance)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmitPayment} className="space-y-5">
        {/* Header Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            {LABELS.paymentsPage.formSectionTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="pay-teacher-select"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                {LABELS.common.teacher} <span className="text-red-500">*</span>
              </label>
              <TeacherSelect
                id="pay-teacher-select"
                teachers={teachers}
                value={selectedUserId}
                onChange={handleTeacherChange}
              />
            </div>

            <div>
              <label
                htmlFor="pay-date-input"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                {LABELS.paymentsPage.paymentDateLabel}
              </label>
              <input
                id="pay-date-input"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
              />
            </div>

            <div>
              <label
                htmlFor="pay-method-select"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                {LABELS.paymentsPage.methodLabel}
              </label>
              <select
                id="pay-method-select"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
              >
                {['CASH', 'BANK', 'BKASH', 'OTHER'].map((m) => (
                  <option key={m} value={m}>
                    {LABELS.paymentMethods[m]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="pay-note-input"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                {LABELS.paymentsPage.noteLabel}
              </label>
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

        {/* Summary Strip */}
        {selectedTeacher && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label={LABELS.paymentsPage.summaryTotalDue}
              value={formatMoney(teacherSummary.totalDue)}
              tone={teacherSummary.totalDue > 0 ? 'red' : 'emerald'}
            />
            <SummaryCard
              label={LABELS.paymentsPage.summaryTotalAdvance}
              value={formatMoney(teacherSummary.totalAdvance)}
              tone={teacherSummary.totalAdvance > 0 ? 'blue' : 'neutral'}
            />
            <SummaryCard
              label={LABELS.paymentsPage.summaryLastPayment}
              value={
                teacherSummary.lastPaymentDate
                  ? formatDate(teacherSummary.lastPaymentDate)
                  : LABELS.paymentsPage.noPaymentYet
              }
              tone="neutral"
            />
          </div>
        )}

        {/* Distribution Toolbar + 12-Month Payment Grid */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-end justify-between gap-4 bg-slate-50/50">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label
                  htmlFor="pay-year-select"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  {LABELS.common.year}
                </label>
                <YearSelect id="pay-year-select" value={year} onChange={handleYearChange} />
              </div>

              <div className="w-44">
                <label
                  htmlFor="pay-bulk-amount"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  {LABELS.paymentsPage.totalAmountInputLabel}
                </label>
                <MoneyInput
                  id="pay-bulk-amount"
                  value={bulkAmount}
                  onChange={setBulkAmount}
                  placeholder="0"
                />
              </div>

              <button
                type="button"
                onClick={handleAutoDistribute}
                disabled={!bulkAmount || Number(bulkAmount) <= 0}
                className="h-10 inline-flex items-center gap-1.5 px-4 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
              >
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
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" />
                  <path d="M19 17v4" />
                  <path d="M3 5h4" />
                  <path d="M17 19h4" />
                </svg>
                <span>{LABELS.paymentsPage.autoDistributeBtn}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePayAllDue}
                className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                </svg>
                <span>{LABELS.paymentsPage.payAllDueBtn}</span>
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                  <path d="M22 21H7" />
                  <path d="m5 11 9 9" />
                </svg>
                <span>{LABELS.paymentsPage.clearAllBtn}</span>
              </button>
            </div>
          </div>

          {unallocatedNotice > 0 && (
            <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-200 text-xs text-blue-800 font-medium">
              {LABELS.paymentsPage.unallocatedNotice.replace(
                '{amount}',
                formatMoney(unallocatedNotice)
              )}
            </div>
          )}

          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-md animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse min-w-[740px]">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">{LABELS.paymentsPage.colMonth}</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      {LABELS.paymentsPage.colNet}
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      {LABELS.paymentsPage.colPreviouslyPaid}
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      {LABELS.paymentsPage.colDue}
                    </th>
                    <th className="py-3 px-4 font-semibold text-center">
                      {LABELS.paymentsPage.colStatus}
                    </th>
                    <th className="py-3 px-4 font-semibold text-right w-56">
                      {LABELS.paymentsPage.colPayingNow}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthRows.map((row) => {
                    const inputVal = monthInputs[row.month] ?? '';
                    const numericVal = Number(inputVal) || 0;
                    const err = cellErrors[row.month];

                    return (
                      <tr
                        key={row.month}
                        className={`transition-colors ${!row.hasSheet
                          ? 'bg-slate-50/70 text-slate-500'
                          : 'bg-white hover:bg-slate-50/70'
                          }`}
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${row.hasSheet ? 'text-slate-900' : 'text-slate-500'
                                }`}
                            >
                              {row.monthName}
                            </span>
                            {!row.hasSheet && (
                              <span className="text-[11px] text-slate-400">
                                ({LABELS.paymentsPage.noSheetTag})
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-4 text-right font-mono-num">
                          {row.hasSheet ? formatMoney(row.net) : '—'}
                        </td>

                        <td className="py-2.5 px-4 text-right font-mono-num">
                          {row.paid > 0 ? formatMoney(row.paid) : formatMoney(0)}
                        </td>

                        <td
                          className={`py-2.5 px-4 text-right font-mono-num font-medium ${row.due > 0 ? 'text-red-700' : 'text-slate-500'
                            }`}
                        >
                          {row.hasSheet ? formatMoney(row.due) : '—'}
                        </td>

                        <td className="py-2.5 px-4 text-center">
                          <StatusBadge variant={{ kind: 'month', status: row.status }} />
                        </td>

                        <td className="py-2 px-4">
                          <div className="space-y-1">
                            <MoneyInput
                              compact
                              value={inputVal}
                              hasError={Boolean(err)}
                              onChange={(val) => handleCellInputChange(row.month, val)}
                              ariaLabel={`${row.monthName} ${LABELS.paymentsPage.colPayingNow}`}
                            />
                            {err && (
                              <p className="text-[11px] text-red-600 text-right leading-tight">
                                {err}
                              </p>
                            )}
                            {!err && !row.hasSheet && numericVal > 0 && (
                              <p className="text-[11px] text-blue-700 text-right leading-tight">
                                {LABELS.paymentsPage.advanceTag}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Live Footer + Submit */}
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-sm font-medium text-slate-600">
                  {LABELS.paymentsPage.footerPayingTotal}:
                </span>
                <span className="text-xl font-bold font-mono-num text-teal-800">
                  {formatMoney(payingTotal)}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <span className="text-slate-500">{LABELS.paymentsPage.footerInWords}: </span>
                <span className="font-medium text-slate-800">{inWordsText}</span>
              </p>
              {submitError && (
                <p className="text-xs font-medium text-red-600 pt-0.5">{submitError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={hasCellErrors || payingTotal <= 0 || isCreating}
              className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              {isCreating ? '...' : LABELS.paymentsPage.submitPaymentBtn}
            </button>
          </div>
        </div>
      </form>

      {/* Previous Payments for Selected Teacher */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            {LABELS.paymentsPage.previousPaymentsTitle}
          </h3>
        </div>

        {teacherPayments.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            {LABELS.paymentsPage.previousPaymentsEmpty}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {teacherPayments.map((p) => {
              const expanded = Boolean(expandedPaymentIds[p.paymentId]);
              return (
                <div key={p.paymentId} className="px-5 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExpandPayment(p.paymentId)}
                      className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                    >
                      {expanded ? (
                        <svg
                          className="w-4 h-4 text-slate-400 shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-slate-400 shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      )}
                      <span className="font-mono-num text-sm text-slate-700 shrink-0">
                        {formatDate(p.paymentDate)}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`font-mono-num text-sm font-medium ${p.isReversed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                      >
                        {p.receiptNo}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">·</span>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        {LABELS.paymentMethods[p.method]}
                      </span>
                      {p.isReversed && <StatusBadge variant={{ kind: 'reversed' }} />}
                    </button>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`font-mono-num text-sm font-bold ${p.isReversed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                      >
                        {formatMoney(p.totalAmount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReceiptPayment(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 whitespace-nowrap"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                          <path d="M12 17.5v-11" />
                        </svg>
                        <span>{LABELS.paymentsPage.viewReceipt}</span>
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-2.5 ml-6 pl-3 border-l border-slate-200 space-y-1.5">
                      <div className="flex flex-wrap gap-2">
                        {p.details.map((d, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-50 border border-slate-200 text-slate-700"
                          >
                            <span>
                              {getMonthNameBn(d.month)} {d.year}:
                            </span>
                            <span className="font-mono-num font-semibold text-slate-900">
                              {formatMoney(d.amount)}
                            </span>
                          </span>
                        ))}
                      </div>
                      {p.note && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0"
                          >
                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                            <path d="M10 9H8" />
                            <path d="M16 13H8" />
                            <path d="M16 17H8" />
                          </svg>
                          <span>{p.note}</span>
                        </p>
                      )}
                      {p.isReversed && p.reverseReason && (
                        <p className="text-xs text-red-600">
                          {LABELS.receipt.reverseReason}: {p.reverseReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Receipt Print Modal */}
      <ReceiptView
        payment={receiptPayment}
        teacher={teachers.find((t) => Number(t.userId) === Number(receiptPayment?.userId))}
        isOpen={Boolean(receiptPayment)}
        onClose={() => setReceiptPayment(null)}
      />

      {/* Lightweight inline toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 text-white px-4 py-2.5 text-sm shadow-lg">
          {toast.text}
        </div>
      )}
    </div>
  );
};