import React, { useEffect, useMemo, useState } from 'react';
import { MoneyInput } from './MoneyInput';
import { StatusBadge } from './StatusBadge';
import { SummaryCard } from './SummaryCard';
import { ReceiptView } from './ReceiptView';
import { TeacherSelect } from './TeacherSelect';
import { Modal } from './Modal';
import { LABELS } from '../../helper/labels';
import {
  formatDate,
  formatMoney,
  getTodayISO,
  numberToBengaliWords,
  toBengaliDigits,
} from '../../utils/format';
import {
  mapTeacher,
  mapPayment,
  mapMonthRow,
  distributeToDue,
  toNum,
  round2,
} from '../../helper/salaryMappers';
import {
  useGetTeachersQuery,
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useGetMonthStatusQuery,
  useGetTeacherSummaryQuery,
  useGetYearsQuery,
} from '../../features/teachers/teachersSlice';
import {
  useGetGeneralLedgersByCAIDQuery,
  useGetSubLedgersByGLIDQuery,
} from '../../features/feeCollection/feeCollectionSlice';

/* ---------------- Icon ---------------- */
const Icon = ({ d, size = 14, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {d.map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

const IC = {
  wallet: [
    'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1',
    'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4',
  ],
  search: ['m21 21-4.3-4.3', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z'],
};

/* ---------------- Helpers ---------------- */
const asArray = (v) =>
  Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : [];

const yearIdOf = (y) => y?.YearID ?? y?.yearId ?? y?.Year ?? y?.id ?? null;
const yearValueOf = (y) => y?.YearValue ?? y?.yearValue ?? y?.Year ?? '';

/* ============================================================================ */
export const PaymentsPage = () => {
  /* ---------------- UI States ---------------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters
  const [searchCode, setSearchCode] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // ✅ Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal Form States
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [paymentDate, setPaymentDate] = useState(getTodayISO());
  const [note, setNote] = useState('');

  // Account States
  const [glid, setGlid] = useState('');
  const [slid, setSlid] = useState('');

  // Payment Allocations
  const [bulkAmount, setBulkAmount] = useState('');
  const [unallocatedNotice, setUnallocatedNotice] = useState(0);
  const [monthInputs, setMonthInputs] = useState({});
  const [filterMode, setFilterMode] = useState('all');
  const [submitError, setSubmitError] = useState('');

  const addToast = (kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 3000);
  };

  /* ---------------- Account Queries ---------------- */
  const { data: glbcRes } = useGetGeneralLedgersByCAIDQuery();
  const glbc = useMemo(() => asArray(glbcRes), [glbcRes]);

  const { data: sglbcRes } = useGetSubLedgersByGLIDQuery(glid, { skip: !glid });
  const sglbc = useMemo(() => asArray(sglbcRes), [sglbcRes]);

  /* ---------------- Years Query ---------------- */
  const { data: yearsRes } = useGetYearsQuery();
  const years = useMemo(() => asArray(yearsRes), [yearsRes]);

  useEffect(() => {
    if (selectedYearId || years.length === 0) return;
    const latest = [...years].sort(
      (a, b) => Number(yearIdOf(b)) - Number(yearIdOf(a))
    )[0];
    const id = yearIdOf(latest);
    if (id != null) setSelectedYearId(String(id));
  }, [years, selectedYearId]);

  /* ---------------- Teachers ---------------- */
  const { data: teachersRes, isLoading: teachersLoading } = useGetTeachersQuery();
  const teachers = useMemo(
    () => asArray(teachersRes).map(mapTeacher),
    [teachersRes]
  );

  /* ---------------- Payments History (pagination) ---------------- */
  const historyParams = useMemo(() => {
    const p = { Page: page, Limit: limit };
    if (searchDate) {
      p.From = searchDate;
      p.To = searchDate;
    }
    return p;
  }, [searchDate, page, limit]);

  const {
    data: paymentsRes,
    isLoading: paymentsLoading,
    isFetching: paymentsFetching,
  } = useGetPaymentsQuery(historyParams);

  const payments = useMemo(
    () => asArray(paymentsRes).map(mapPayment),
    [paymentsRes]
  );

  const pagination = paymentsRes?.pagination ?? {
    page: 1,
    limit,
    total: payments.length,
    totalPages: 1,
  };

  useEffect(() => {
    setPage(1);
  }, [searchDate, limit]);

  const filteredPayments = useMemo(() => {
    if (!searchCode) return payments;
    const q = searchCode.trim().toLowerCase();
    return payments.filter((p) =>
      String(p.userCode ?? '').toLowerCase().includes(q)
    );
  }, [payments, searchCode]);

  /* ---------------- Month Status ---------------- */
  const uidNum = Number(selectedUserId);
  const yidNum = Number(selectedYearId);
  const canFetchMonths =
    Number.isFinite(uidNum) && uidNum > 0 &&
    Number.isFinite(yidNum) && yidNum > 0;

  const {
    data: monthStatusRes,
    isLoading: monthStatusLoading,
    isFetching: monthStatusFetching,
  } = useGetMonthStatusQuery(
    { UserID: uidNum, YearID: yidNum },
    { skip: !canFetchMonths }
  );

  const { data: summaryRes } = useGetTeacherSummaryQuery(
    { UserID: selectedUserId },
    { skip: !selectedUserId }
  );

  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();

  const yearInfo = monthStatusRes?.year ?? null;

  const allMonthRows = useMemo(() => {
    if (!canFetchMonths) return [];
    return asArray(monthStatusRes?.data).map(mapMonthRow);
  }, [canFetchMonths, monthStatusRes]);

  const filteredMonthRows = useMemo(() => {
    if (filterMode === 'due') return allMonthRows.filter((r) => r.due > 0);
    if (filterMode === 'paid')
      return allMonthRows.filter((r) => r.due <= 0 && r.hasSheet);
    return allMonthRows;
  }, [allMonthRows, filterMode]);

  /* ---------------- Modal Handlers ---------------- */
  const openModal = () => {
    setIsModalOpen(true);
    setSelectedUserId(null);
    setGlid('');
    setSlid('');
    resetInputs();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetInputs();
  };

  const resetInputs = () => {
    setMonthInputs({});
    setBulkAmount('');
    setUnallocatedNotice(0);
    setSubmitError('');
    setPaymentDate(getTodayISO());
    setNote('');
  };

  const handleAutoDistribute = () => {
    const total = toNum(bulkAmount);
    if (total <= 0) return;
    const { allocations, unallocated } = distributeToDue(
      total,
      filteredMonthRows
    );
    const next = {};
    for (const r of filteredMonthRows)
      next[r.monthId] = allocations[r.monthId] > 0 ? allocations[r.monthId] : '';
    setMonthInputs(next);
    setUnallocatedNotice(unallocated);
    setSubmitError('');
  };

  const handlePayAllDue = () => {
    const next = {};
    let total = 0;
    for (const r of filteredMonthRows) {
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
    for (const r of filteredMonthRows) {
      const val = toNum(monthInputs[r.monthId]);
      if (val > 0 && r.hasSheet && val > r.due) {
        errs[r.monthId] = LABELS.paymentsPage.errorExceedsDue.replace(
          '{due}',
          formatMoney(r.due)
        );
      }
    }
    return errs;
  }, [monthInputs, filteredMonthRows]);
  const hasCellErrors = Object.keys(cellErrors).length > 0;

  const payingTotal = useMemo(
    () =>
      round2(
        filteredMonthRows.reduce(
          (sum, r) => sum + toNum(monthInputs[r.monthId]),
          0
        )
      ),
    [monthInputs, filteredMonthRows]
  );
  const inWordsText = useMemo(
    () => numberToBengaliWords(payingTotal),
    [payingTotal]
  );

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return setSubmitError('শিক্ষক নির্বাচন করুন');
    if (!selectedYearId) return setSubmitError('বছর নির্বাচন করুন');
    if (!glid || !slid)
      return setSubmitError('হিসাবের ধরন এবং অ্যাকাউন্ট নির্বাচন করুন');
    if (hasCellErrors) return setSubmitError(LABELS.paymentsPage.errorFixTable);
    if (payingTotal <= 0)
      return setSubmitError(LABELS.paymentsPage.errorPositiveAmount);

    const fallbackYearId = Number(selectedYearId);
    const details = filteredMonthRows
      .map((r) => ({
        YearID: Number(r.yearId) || fallbackYearId,
        MonthID: r.monthId,
        Amount: toNum(monthInputs[r.monthId]),
      }))
      .filter((d) => d.Amount > 0);

    if (details.length === 0)
      return setSubmitError('কোনো মাসে পরিমাণ দেওয়া হয়নি');

    try {
      const res = await createPayment({
        UserID: Number(selectedUserId),
        PaymentDate: paymentDate || getTodayISO(),
        GLID: Number(glid),
        SLID: Number(slid),
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
      closeModal();
      setReceiptPayment(mapPayment(res.data));
      setPage(1);
    } catch (err) {
      setSubmitError(err?.data?.error ?? 'পেমেন্ট সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ============ Header ============ */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-4 sm:px-5 py-3 sm:py-4 text-white shadow-lg flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/20 backdrop-blur">
            <Icon size={20} d={IC.wallet} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold leading-tight sm:text-[20px] truncate">
              {LABELS.nav.payments}
            </h3>
            <p className="text-[11px] sm:text-sm text-white/80 truncate">
              বেতন পরিশোধ ও ইতিহাস
            </p>
          </div>
        </div>
        <button
          onClick={openModal}
          className="bg-white text-indigo-700 px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm shadow hover:bg-slate-50 transition whitespace-nowrap"
        >
          + নতুন পেমেন্ট
        </button>
      </div>

      {/* ============ History ============ */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-5 space-y-3 sm:space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          পেমেন্ট হিস্ট্রি
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Icon d={IC.search} />
            </span>
            <input
              type="text"
              placeholder="শিক্ষকের কোড..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full pl-9 h-10 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="flex-1 sm:flex-none h-10 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/30"
            />
            {searchDate && (
              <button
                onClick={() => setSearchDate('')}
                className="h-10 px-3 text-xs text-slate-600 border rounded-lg hover:bg-slate-50 whitespace-nowrap"
              >
                ক্লিয়ার
              </button>
            )}
          </div>
        </div>

        {paymentsLoading ? (
          <div className="py-8 text-center text-sm text-slate-500 border-2 border-dashed rounded-lg">
            লোড হচ্ছে...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500 border-2 border-dashed rounded-lg">
            কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <>
            {/* ✅ Mobile-এ table horizontal scroll থাকবে কিন্তু পুরো page-এ নয় */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 -mx-1 px-1 sm:mx-0 sm:px-0">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b">
                  <tr>
                    <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold whitespace-nowrap">তারিখ</th>
                    <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold whitespace-nowrap">রিসিপ্ট</th>
                    <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold whitespace-nowrap">শিক্ষক</th>
                    <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold whitespace-nowrap hidden md:table-cell">অ্যাকাউন্ট</th>
                    <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold text-right whitespace-nowrap">পরিমাণ</th>
                    <th className="py-2 px-2 sm:py-2.5 sm:px-3 font-semibold text-center whitespace-nowrap">রশিদ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPayments.map((p) => (
                    <tr key={p.paymentId} className="hover:bg-slate-50">
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-xs">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 font-mono-num text-xs whitespace-nowrap">
                        {p.receiptNo}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 text-xs">
                        {p.userName || `ID: ${p.userId}`}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 text-xs text-slate-500 hidden md:table-cell">
                        {p.subsidiaryLedger?.slName || '-'} (
                        {p.generalLedger?.glName || '-'})
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 text-right font-bold text-xs whitespace-nowrap">
                        {formatMoney(p.totalAmount)}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 text-center">
                        <button
                          onClick={() => setReceiptPayment(p)}
                          className="text-indigo-600 hover:underline text-xs whitespace-nowrap"
                        >
                          দেখুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination — mobile-এ stack, desktop-এ বাম+মধ্য */}
            <div className="flex flex-col sm:relative sm:flex-row items-center justify-center gap-2 sm:gap-0 pt-2 sm:pt-3">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:absolute sm:left-0 sm:gap-3">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] sm:text-xs text-slate-600 whitespace-nowrap">
                    প্রতি পেজ:
                  </label>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="h-8 px-2 text-xs border rounded-lg"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 whitespace-nowrap">
                  মোট <b>{toBengaliDigits(pagination.total)}</b> টি
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || paymentsFetching}
                  className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs border rounded-lg disabled:opacity-50 hover:bg-slate-50 whitespace-nowrap"
                >
                  ← পূর্ববর্তী
                </button>
                <span className="text-[11px] sm:text-xs text-slate-700 px-2 whitespace-nowrap">
                  {toBengaliDigits(page)} / {toBengaliDigits(pagination.totalPages)}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages || paymentsFetching}
                  className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs border rounded-lg disabled:opacity-50 hover:bg-slate-50 whitespace-nowrap"
                >
                  পরবর্তী →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============ Payment Modal ============ */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="নতুন বেতন পরিশোধ"
          subtitle="শিক্ষক এবং বছর/মাস নির্বাচন করে পেমেন্ট করুন"
          size="5xl"

          footer={
            <div
              dir="ltr"
              className="flex flex-col sm:flex-row w-full justify-between items-stretch sm:items-center gap-3"
            >
              {/* Payment Summary */}
              <div className="text-left min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  মোট পরিশোধ:
                </p>
                <p className="text-lg sm:text-xl font-bold text-indigo-700">
                  {formatMoney(payingTotal)}
                </p>

                {inWordsText && (
                  <p className="text-[10px] sm:text-[11px] text-slate-500">
                    {inWordsText}
                  </p>
                )}

                {submitError && (
                  <p className="text-xs text-red-600">
                    {submitError}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex w-full sm:w-auto items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg hover:bg-slate-100 whitespace-nowrap"
                >
                  বাতিল
                </button>

                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  disabled={isCreating || payingTotal <= 0 || hasCellErrors}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {isCreating ? '...' : 'সেভ করুন'}
                </button>
              </div>
            </div>
          }

        >
          <div className="space-y-3 sm:space-y-5">
            {/* Form grid — mobile 1 column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">শিক্ষক *</label>
                <TeacherSelect
                  teachers={teachers}
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">বছর *</label>
                <select
                  value={selectedYearId}
                  onChange={(e) => {
                    setSelectedYearId(e.target.value);
                    resetInputs();
                  }}
                  className="w-full h-10 px-3 text-sm border rounded-lg"
                >
                  <option value="">-- নির্বাচন করুন --</option>
                  {years.map((y) => {
                    const id = yearIdOf(y);
                    const val = yearValueOf(y);
                    return (
                      <option key={id} value={id}>
                        {toBengaliDigits(val)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">তারিখ:</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full h-10 px-3 text-sm border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  অ্যাকাউন্টের ধরণ:
                </label>
                <select
                  value={glid}
                  onChange={(e) => {
                    setGlid(e.target.value);
                    setSlid('');
                  }}
                  className="w-full h-10 px-3 text-sm border rounded-lg"
                >
                  <option value="">-- নির্বাচন করুন --</option>
                  {glbc.map((g) => {
                    const id = g.GLID ?? g.glId ?? g.id;
                    const name = g.GlName ?? g.glName ?? g.name;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  অ্যাকাউন্ট:
                </label>
                <select
                  value={slid}
                  onChange={(e) => setSlid(e.target.value)}
                  disabled={!glid}
                  className="w-full h-10 px-3 text-sm border rounded-lg disabled:bg-slate-100"
                >
                  <option value="">-- নির্বাচন করুন --</option>
                  {sglbc.map((s) => {
                    const id = s.SLID ?? s.slId ?? s.id;
                    const name = s.SlName ?? s.slName ?? s.name;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Filter + Smart distribution — mobile stack */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  দেখান:
                </span>
                <button
                  onClick={() => setFilterMode('due')}
                  className={`px-2.5 py-1 text-sm font-medium rounded-full border transition ${filterMode === 'due'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  শুধু বাকি
                </button>
                <button
                  onClick={() => setFilterMode('paid')}
                  className={`px-2.5 py-1 text-sm font-medium rounded-full border transition ${filterMode === 'paid'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  পরিশোধিত
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 text-sm font-medium rounded-full border transition ${filterMode === 'all'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  সব
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
                <button
                  onClick={handleAutoDistribute}
                  className="px-2.5 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold whitespace-nowrap hover:bg-indigo-200"
                >
                  অটো ডিস্ট্রিবিউট
                </button>
                <button
                  onClick={handlePayAllDue}
                  className="px-2.5 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold whitespace-nowrap hover:bg-teal-200"
                >
                  সব বাকি
                </button>
                <button
                  onClick={resetInputs}
                  className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-sm whitespace-nowrap"
                >
                  ক্লিয়ার
                </button>
                {unallocatedNotice > 0 && (
                  <span className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded whitespace-nowrap">
                    বাকি: {formatMoney(unallocatedNotice)}
                  </span>
                )}
              </div>
            </div>

            {/* Month table — Responsive compact mobile layout */}
            <div className="w-full max-w-full overflow-x-auto rounded-lg border">
              <table className="w-full min-w-0 table-fixed text-[11px] sm:text-sm text-left">

                {/* Fixed column widths */}
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[27%]" />
                </colgroup>

                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="py-2 px-1.5 sm:px-3 whitespace-nowrap">
                      মাস
                    </th>
                    <th className="py-2 px-1 text-right whitespace-nowrap">
                      নিট
                    </th>
                    <th className="py-2 px-1 text-right whitespace-nowrap">
                      প্রদান
                    </th>
                    <th className="py-2 px-1 text-right whitespace-nowrap">
                      বাকি
                    </th>
                    <th className="py-2 px-1.5 text-right whitespace-nowrap">
                      বর্তমান
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {!canFetchMonths ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-slate-500">
                        শিক্ষক ও বছর নির্বাচন করুন
                      </td>
                    </tr>
                  ) : monthStatusLoading || monthStatusFetching ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-slate-500">
                        লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : filteredMonthRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-slate-500">
                        এই ক্যাটাগরিতে কোনো মাস নেই
                      </td>
                    </tr>
                  ) : (
                    filteredMonthRows.map((row) => {
                      const val = monthInputs[row.monthId] ?? '';
                      const err = cellErrors[row.monthId];

                      return (
                        <tr
                          key={`${row.yearId}-${row.monthId}`}
                          className="hover:bg-slate-50"
                        >
                          <td className="py-2.5 px-1.5 sm:px-3 font-medium whitespace-nowrap overflow-hidden">
                            {row.monthName}{' '}
                            <span className="text-slate-500 text-[9px] sm:text-xs">
                              ({toBengaliDigits(
                                row.yearValue || yearInfo?.YearValue || ''
                              )})
                            </span>
                          </td>

                          <td className="py-2.5 px-1 text-right whitespace-nowrap">
                            {row.hasSheet ? formatMoney(row.net) : '-'}
                          </td>

                          <td className="py-2.5 px-1 text-right text-slate-500 whitespace-nowrap">
                            {formatMoney(row.paid)}
                          </td>

                          <td
                            className={`py-2.5 px-1 text-right font-bold whitespace-nowrap ${row.due > 0 ? 'text-red-600' : 'text-slate-500'
                              }`}
                          >
                            {row.hasSheet ? formatMoney(row.due) : '-'}
                          </td>

                          <td className="py-2.5 px-1.5">
                            <div className="w-full max-w-[85px] ml-auto">
                              <MoneyInput
                                compact
                                value={val}
                                hasError={!!err}
                                onChange={(v) =>
                                  setMonthInputs((p) => ({
                                    ...p,
                                    [row.monthId]: v,
                                  }))
                                }
                              />
                            </div>

                            {err && (
                              <p className="text-[9px] text-red-500 text-right mt-1">
                                {err}
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>


            <div>
              <label className="block text-xs font-medium mb-1">
                নোট (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-10 px-3 text-sm border rounded-lg"
                placeholder="পেমেন্ট সংক্রান্ত নোট..."
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Receipt Modal */}
      <ReceiptView
        payment={receiptPayment}
        teacher={teachers.find(
          (t) => Number(t.userId) === Number(receiptPayment?.userId)
        )}
        isOpen={Boolean(receiptPayment)}
        onClose={() => setReceiptPayment(null)}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${toast.kind === 'error' ? 'bg-red-600' : 'bg-slate-900'
            }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
};