// ReportsPage.jsx — বেতন রিপোর্ট (v2: YearID / MonthID, ডাটাবেসের মাস)
import React, { useEffect, useMemo, useState } from 'react';
import { Drawer } from './Drawer';
import { Modal } from './Modal';
import { ReceiptView } from './ReceiptView';
import { StatusBadge } from './StatusBadge';
import { SummaryCard } from './SummaryCard';
import { TeacherSelect } from './TeacherSelect';
import { SalaryYearSelect, useYearValue } from './SalaryYearSelect';
import { LABELS } from '../../helper/labels';
import { formatDate, formatMoney, toBengaliDigits } from '../../utils/format';
import { mapTeacher, mapPayment, mapMonthRow, toNum } from '../../helper/salaryMappers';
import {
  useGetTeachersQuery,
  useGetDesignationQuery,
  useGetReportTeacherMonthlyQuery,
  useGetReportMatrixQuery,
  useGetPaymentsQuery,
  useReversePaymentMutation,
} from '../../features/teachers/teachersSlice';

const MATRIX_CELL_CLASSES = {
  PAID: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  PARTIAL: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  UNPAID: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  NO_SHEET: 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100',
  ADVANCE: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
};

const Icon = ({ d, size = 14, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {d.map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const IC = {
  chart: ['M3 3v18h18', 'M7 12h3v6H7z', 'M12 8h3v10h-3z', 'M17 5h3v13h-3z'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
  print: ['M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2', 'M6 9V3h12v6', 'M6 14h12v8H6z'],
  receipt: ['M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z', 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8', 'M12 17.5v-11'],
  undo: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
  down: ['m6 9 6 6 6-6'],
  right: ['m9 18 6-6-6-6'],
};

const mapDesignations = (arr) =>
  [...(arr ?? [])].sort((a, b) => (a.SL ?? 0) - (b.SL ?? 0)).map((d) => (d.Designation ?? '').trim()).filter(Boolean);
const norm = (s) => (s ?? '').trim().toLowerCase();

// report থেকে আসা একটা মাসের ডিটেইল ও পেমেন্ট
const buildMonthExtras = (reportData, monthId, paymentById) => {
  const details = (reportData?.details ?? [])
    .filter((d) => Number(d.MonthID) === Number(monthId))
    .map((d) => ({ headId: d.HeadID, headName: d.HeadName, headType: d.HeadType, amount: toNum(d.Amount) }));
  const monthPayments = (reportData?.payments ?? [])
    .filter((p) => Number(p.MonthID) === Number(monthId))
    .map((p) => ({ payment: paymentById.get(Number(p.PaymentID)) ?? mapPayment(p), monthAmount: toNum(p.Amount) }));
  return { details, monthPayments };
};

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('teacherMonthly');

  // Tab A
  const [tabATeacherId, setTabATeacherId] = useState(null);
  const [tabAYearId, setTabAYearId] = useState(null);
  const tabAYearValue = useYearValue(tabAYearId);
  const [expandedMonths, setExpandedMonths] = useState({});

  // Tab B
  const [tabBYearId, setTabBYearId] = useState(null);
  const tabBYearValue = useYearValue(tabBYearId);
  const [tabBDesignation, setTabBDesignation] = useState('ALL');
  const [drawerCell, setDrawerCell] = useState(null); // { userId, monthId, monthName }

  // Tab C
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [tabCTeacherId, setTabCTeacherId] = useState('');
  const [tabCMethod, setTabCMethod] = useState('ALL');
  const [showReversed, setShowReversed] = useState(true);
  const [reverseTarget, setReverseTarget] = useState(null);
  const [reverseReason, setReverseReason] = useState('');
  const [reverseError, setReverseError] = useState('');

  const [receiptPayment, setReceiptPayment] = useState(null);
  const [toast, setToast] = useState(null);
  const addToast = (kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 2500);
  };

  // ─── Base ─────────────────────────────────────────────────────
  const { data: teachersRes } = useGetTeachersQuery();
  const { data: designationData } = useGetDesignationQuery();
  const teachers = useMemo(() => (teachersRes?.data ?? []).map(mapTeacher), [teachersRes]);
  const designations = useMemo(() => Array.from(new Set(mapDesignations(designationData))), [designationData]);
  const teacherMap = useMemo(() => new Map(teachers.map((t) => [Number(t.userId), t])), [teachers]);

  useEffect(() => {
    if (!tabATeacherId && teachers.length > 0) setTabATeacherId(teachers[0].userId);
  }, [teachers, tabATeacherId]);

  const { data: allPaymentsRes } = useGetPaymentsQuery();
  const [reversePayment, { isLoading: isReversing }] = useReversePaymentMutation();
  const allPayments = useMemo(() => (allPaymentsRes?.data ?? []).map(mapPayment), [allPaymentsRes]);
  const paymentById = useMemo(() => new Map(allPayments.map((p) => [Number(p.paymentId), p])), [allPayments]);

  // ═══════════════════ TAB A ═══════════════════
  const { data: reportRes, isFetching: reportLoading } = useGetReportTeacherMonthlyQuery(
    { UserID: tabATeacherId, YearID: tabAYearId },
    { skip: !tabATeacherId || !tabAYearId }
  );

  const tabARows = useMemo(() => {
    const data = reportRes?.data;
    if (!data) return [];
    return (data.months ?? []).map((r) => ({ ...mapMonthRow(r), ...buildMonthExtras(data, r.MonthID, paymentById) }));
  }, [reportRes, paymentById]);

  const tabATotals = useMemo(
    () => tabARows.reduce((a, r) => ({ net: a.net + r.net, paid: a.paid + r.paid, due: a.due + r.due }), { net: 0, paid: 0, due: 0 }),
    [tabARows]
  );

  const handleExportTabACsv = () => {
    const teacher = teacherMap.get(Number(tabATeacherId));
    const header = [LABELS.common.month, LABELS.reportsPage.colNet, LABELS.reportsPage.colPaid, LABELS.reportsPage.colDue, LABELS.common.status];
    const lines = tabARows.map((r) => [`${r.monthName} ${tabAYearValue}`, r.net, r.paid, r.due, LABELS.monthStatus[r.status] || r.status]);
    lines.push([LABELS.common.total, tabATotals.net, tabATotals.paid, tabATotals.due, '']);
    const csv = '﻿' + [header, ...lines].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-report-${teacher?.userCode || tabATeacherId}-${tabAYearValue}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ═══════════════════ TAB B ═══════════════════
  const { data: matrixRes, isFetching: matrixLoading } = useGetReportMatrixQuery({ YearID: tabBYearId }, { skip: !tabBYearId });
  const matrixMonths = useMemo(() => matrixRes?.data?.months ?? [], [matrixRes]);
  const cellMap = useMemo(() => {
    const m = new Map();
    for (const c of matrixRes?.data?.cells ?? []) m.set(`${Number(c.UserID)}-${Number(c.MonthID)}`, c);
    return m;
  }, [matrixRes]);

  const getCell = (userId, monthId) => {
    const c = cellMap.get(`${Number(userId)}-${Number(monthId)}`);
    const net = toNum(c?.NetAmount);
    const paid = toNum(c?.PaidAmount);
    const hasSheet = Boolean(c?.SheetID);
    return { net, paid, due: hasSheet ? Math.max(0, net - paid) : 0, status: c?.PaymentStatus ?? 'NO_SHEET' };
  };

  const matrixTeachers = useMemo(
    () => (tabBDesignation === 'ALL' ? teachers : teachers.filter((t) => norm(t.designation) === norm(tabBDesignation))),
    [teachers, tabBDesignation]
  );

  const matrixTotals = useMemo(() => {
    const perMonth = {};
    for (const m of matrixMonths) perMonth[m.MonthID] = { net: 0, paid: 0, due: 0 };
    let grandNet = 0, grandPaid = 0, grandDue = 0;
    for (const t of matrixTeachers) {
      for (const m of matrixMonths) {
        const c = getCell(t.userId, m.MonthID);
        perMonth[m.MonthID].net += c.net;
        perMonth[m.MonthID].paid += c.paid;
        perMonth[m.MonthID].due += c.due;
        grandNet += c.net; grandPaid += c.paid; grandDue += c.due;
      }
    }
    return { perMonth, grandNet, grandPaid, grandDue };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrixTeachers, matrixMonths, cellMap]);

  // Drawer: ক্লিক করা শিক্ষকের রিপোর্ট আলাদা করে আনা
  const { data: drawerReportRes, isFetching: drawerLoading } = useGetReportTeacherMonthlyQuery(
    { UserID: drawerCell?.userId, YearID: tabBYearId },
    { skip: !drawerCell || !tabBYearId }
  );

  const drawerData = useMemo(() => {
    if (!drawerCell) return null;
    const teacher = teacherMap.get(Number(drawerCell.userId));
    const cell = getCell(drawerCell.userId, drawerCell.monthId);
    const extras = buildMonthExtras(drawerReportRes?.data, drawerCell.monthId, paymentById);
    return { teacher, ...cell, ...extras };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerCell, teacherMap, cellMap, drawerReportRes, paymentById]);

  // ═══════════════════ TAB C ═══════════════════
  const filteredPayments = useMemo(
    () =>
      allPayments
        .filter((p) => {
          if (!showReversed && p.isReversed) return false;
          if (tabCTeacherId && Number(p.userId) !== Number(tabCTeacherId)) return false;
          if (tabCMethod !== 'ALL' && p.method !== tabCMethod) return false;
          if (fromDate && p.paymentDate < fromDate) return false;
          if (toDate && p.paymentDate > toDate) return false;
          return true;
        })
        .sort((a, b) => String(b.paymentDate).localeCompare(String(a.paymentDate))),
    [allPayments, showReversed, tabCTeacherId, tabCMethod, fromDate, toDate]
  );

  const validHistoryTotal = useMemo(
    () => filteredPayments.filter((p) => !p.isReversed).reduce((acc, p) => acc + p.totalAmount, 0),
    [filteredPayments]
  );

  const handleConfirmReverse = async (e) => {
    e.preventDefault();
    if (!reverseTarget) return;
    if (!reverseReason.trim()) return setReverseError(LABELS.reportsPage.errorReverseReasonRequired);
    try {
      await reversePayment({ paymentId: reverseTarget.paymentId, ReverseReason: reverseReason }).unwrap();
      addToast('info', LABELS.reportsPage.toastReversed);
      setReverseTarget(null);
      setReverseReason('');
      setReverseError('');
    } catch (err) {
      setReverseError(err?.data?.error ?? '');
    }
  };

  const ReceiptBtn = ({ payment, compact }) => (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setReceiptPayment(payment); }}
      className={compact
        ? 'inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium'
        : 'inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50'}
    >
      <Icon d={IC.receipt} /><span>{LABELS.paymentsPage.viewReceipt}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      {/* ===================== হেডার */}
      <div className="no-print relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-5 py-4 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/20 backdrop-blur">
              <Icon size={20} d={IC.chart} />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight sm:text-[20px]">{LABELS.nav.reports}</h3>
              <p className="text-xs text-white/80 sm:text-sm">{LABELS.reportsPage.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-white/95 p-1 shadow-sm backdrop-blur">
            {[
              ['teacherMonthly', LABELS.reportsPage.tabTeacherMonthly],
              ['matrix', LABELS.reportsPage.tabMatrix],
              ['history', LABELS.reportsPage.tabHistory],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== TAB A ==================== */}
      {activeTab === 'teacherMonthly' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-end justify-between gap-4 no-print">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-64">
                <label className="block text-xs font-medium text-slate-600 mb-1">{LABELS.common.teacher}</label>
                <TeacherSelect teachers={teachers} value={tabATeacherId} onChange={(id) => { setTabATeacherId(id); setExpandedMonths({}); }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{LABELS.common.year}</label>
                <SalaryYearSelect value={tabAYearId} onChange={(id) => { setTabAYearId(id); setExpandedMonths({}); }} />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={handleExportTabACsv} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap">
                <Icon size={16} d={IC.download} /><span>{LABELS.common.exportCsv}</span>
              </button>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 whitespace-nowrap">
                <Icon size={16} d={IC.print} /><span>{LABELS.common.print}</span>
              </button>
            </div>
          </div>

          <div className="hidden print:block border-b border-slate-300 pb-3 mb-4">
            <h2 className="text-lg font-bold">{LABELS.app.schoolName}</h2>
            <p className="text-sm">{LABELS.reportsPage.tabTeacherMonthly} — {teacherMap.get(Number(tabATeacherId))?.name} ({toBengaliDigits(tabAYearValue)})</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard label={LABELS.reportsPage.summaryYearNet} value={formatMoney(tabATotals.net)} tone="teal" />
            <SummaryCard label={LABELS.reportsPage.summaryYearPaid} value={formatMoney(tabATotals.paid)} tone="emerald" />
            <SummaryCard label={LABELS.reportsPage.summaryYearDue} value={formatMoney(tabATotals.due)} tone={tabATotals.due > 0 ? 'red' : 'neutral'} />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse min-w-[640px]">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">{LABELS.common.month}</th>
                    <th className="py-3 px-4 font-semibold text-right">{LABELS.reportsPage.colNet}</th>
                    <th className="py-3 px-4 font-semibold text-right">{LABELS.reportsPage.colPaid}</th>
                    <th className="py-3 px-4 font-semibold text-right">{LABELS.reportsPage.colDue}</th>
                    <th className="py-3 px-4 font-semibold text-center">{LABELS.common.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportLoading ? (
                    <tr><td colSpan={5} className="text-center py-6 text-slate-500">লোড হচ্ছে...</td></tr>
                  ) : tabARows.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-6 text-slate-500">এই বছরের কোনো মাস নেই</td></tr>
                  ) : (
                    tabARows.map((row) => {
                      const isExpanded = Boolean(expandedMonths[row.monthId]);
                      return (
                        <React.Fragment key={row.monthId}>
                          <tr onClick={() => setExpandedMonths((p) => ({ ...p, [row.monthId]: !p[row.monthId] }))} className="cursor-pointer hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                <Icon size={16} d={isExpanded ? IC.down : IC.right} className="text-slate-400 shrink-0" />
                                <span>{row.monthName}</span>
                                {row.monthPayments.length > 0 && <span className="text-xs text-slate-400">({toBengaliDigits(row.monthPayments.length)})</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono-num">{row.hasSheet ? formatMoney(row.net) : '—'}</td>
                            <td className="py-3 px-4 text-right font-mono-num font-medium text-emerald-700">{formatMoney(row.paid)}</td>
                            <td className={`py-3 px-4 text-right font-mono-num font-medium ${row.due > 0 ? 'text-red-700' : 'text-slate-500'}`}>{row.hasSheet ? formatMoney(row.due) : '—'}</td>
                            <td className="py-3 px-4 text-center"><StatusBadge variant={{ kind: 'month', status: row.status }} /></td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-slate-50/70">
                              <td colSpan={5} className="px-6 py-3 space-y-3">
                                {row.details.some((d) => d.amount > 0) && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {row.details.filter((d) => d.amount > 0).map((d) => (
                                      <span key={d.headId} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${d.headType === 'EARNING' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                        {d.headName}: <b className="font-mono-num">{d.headType === 'DEDUCTION' ? '-' : ''}{formatMoney(d.amount)}</b>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {row.monthPayments.length === 0 ? (
                                  <p className="text-xs text-slate-500 py-1">{LABELS.reportsPage.noPaymentsForMonth}</p>
                                ) : (
                                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-xs">
                                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                        <tr>
                                          <th className="py-2 px-3 text-left font-medium">{LABELS.common.date}</th>
                                          <th className="py-2 px-3 text-left font-medium">{LABELS.reportsPage.colReceiptNo}</th>
                                          <th className="py-2 px-3 text-left font-medium">{LABELS.reportsPage.colMethod}</th>
                                          <th className="py-2 px-3 text-right font-medium">{LABELS.reportsPage.colAmount}</th>
                                          <th className="py-2 px-3 text-right font-medium no-print">{LABELS.common.actions}</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {row.monthPayments.map(({ payment, monthAmount }) => (
                                          <tr key={payment.paymentId}>
                                            <td className="py-2 px-3 font-mono-num text-slate-700">{formatDate(payment.paymentDate)}</td>
                                            <td className="py-2 px-3 font-mono-num font-medium text-slate-900">{payment.receiptNo}</td>
                                            <td className="py-2 px-3 text-slate-600">{LABELS.paymentMethods[payment.method]}</td>
                                            <td className="py-2 px-3 text-right font-mono-num font-semibold text-slate-900">{formatMoney(monthAmount)}</td>
                                            <td className="py-2 px-3 text-right no-print"><ReceiptBtn payment={payment} compact /></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
                  <tr>
                    <td className="py-3 px-4">{LABELS.common.total}</td>
                    <td className="py-3 px-4 text-right font-mono-num">{formatMoney(tabATotals.net)}</td>
                    <td className="py-3 px-4 text-right font-mono-num text-emerald-700">{formatMoney(tabATotals.paid)}</td>
                    <td className="py-3 px-4 text-right font-mono-num text-red-700">{formatMoney(tabATotals.due)}</td>
                    <td className="py-3 px-4" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB B ==================== */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">{LABELS.common.year}:</label>
                <SalaryYearSelect value={tabBYearId} onChange={setTabBYearId} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">{LABELS.common.designation}:</label>
                <select
                  value={tabBDesignation}
                  onChange={(e) => setTabBDesignation(e.target.value)}
                  className="h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                >
                  <option value="ALL">{LABELS.common.allDesignations}</option>
                  {designations.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium mr-1">{LABELS.reportsPage.legendTitle}</span>
              {['PAID', 'PARTIAL', 'UNPAID', 'NO_SHEET', 'ADVANCE'].map((s) => <StatusBadge key={s} variant={{ kind: 'month', status: s }} />)}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse" style={{ minWidth: 300 + matrixMonths.length * 92 }}>
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="sticky left-0 z-30 bg-slate-50 py-3 px-4 font-semibold border-r border-slate-200 min-w-[185px]">{LABELS.common.teacher}</th>
                    {matrixMonths.map((m) => <th key={m.MonthID} className="py-3 px-2 font-semibold text-center min-w-[92px]">{m.MonthName}</th>)}
                    <th className="py-3 px-3 font-semibold text-right bg-slate-100/70 min-w-[115px]">{LABELS.reportsPage.matrixRowTotal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrixLoading ? (
                    <tr><td colSpan={matrixMonths.length + 2} className="text-center py-6 text-slate-500">লোড হচ্ছে...</td></tr>
                  ) : matrixMonths.length === 0 ? (
                    <tr><td colSpan={2} className="text-center py-6 text-slate-500">এই বছরের কোনো মাস নেই</td></tr>
                  ) : (
                    matrixTeachers.map((teacher) => {
                      let rowNet = 0;
                      let rowPaid = 0;
                      return (
                        <tr key={teacher.userId} className="hover:bg-slate-50/40">
                          <td className="sticky left-0 z-10 bg-white py-2.5 px-4 border-r border-slate-200">
                            <p className="font-semibold text-slate-900 truncate max-w-[165px]">{teacher.name}</p>
                            <p className="text-[11px] text-slate-500">{[teacher.userCode, teacher.designation].filter(Boolean).join(' · ')}</p>
                          </td>
                          {matrixMonths.map((m) => {
                            const c = getCell(teacher.userId, m.MonthID);
                            rowNet += c.net;
                            rowPaid += c.paid;
                            return (
                              <td key={m.MonthID} className="p-1.5 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => setDrawerCell({ userId: teacher.userId, monthId: m.MonthID, monthName: m.MonthName })}
                                  className={`w-full px-1.5 py-2 rounded-md border text-[11px] font-mono-num leading-tight transition-colors cursor-pointer ${MATRIX_CELL_CLASSES[c.status] ?? MATRIX_CELL_CLASSES.NO_SHEET}`}
                                >
                                  {c.status === 'NO_SHEET' ? (
                                    <span>—</span>
                                  ) : c.status === 'ADVANCE' ? (
                                    <span className="font-semibold">{LABELS.monthStatus.ADVANCE}<br />{formatMoney(c.paid)}</span>
                                  ) : (
                                    <span><span className="font-semibold">{formatMoney(c.paid)}</span><br /><span className="opacity-75">/ {formatMoney(c.net)}</span></span>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                          <td className="py-2.5 px-3 text-right font-mono-num bg-slate-50/70">
                            <p className="font-semibold text-slate-900">{formatMoney(rowPaid)}</p>
                            <p className="text-[11px] text-slate-500">/ {formatMoney(rowNet)}</p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {matrixMonths.length > 0 && (
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-900">
                    <tr>
                      <td className="sticky left-0 z-10 bg-slate-50 py-3 px-4 border-r border-slate-200">
                        <p>{LABELS.common.total}</p>
                        <p className="text-[11px] font-normal text-slate-500">{LABELS.reportsPage.matrixGrandPaid} / {LABELS.reportsPage.matrixGrandSalary}</p>
                      </td>
                      {matrixMonths.map((m) => {
                        const mt = matrixTotals.perMonth[m.MonthID] ?? { net: 0, paid: 0, due: 0 };
                        return (
                          <td key={m.MonthID} className="py-2.5 px-2 text-center font-mono-num">
                            <p className="text-emerald-700">{formatMoney(mt.paid)}</p>
                            <p className="text-[11px] font-normal text-slate-500">/ {formatMoney(mt.net)}</p>
                            {mt.due > 0 && <p className="text-[10px] text-red-600">{LABELS.paymentsPage.colDue}: {formatMoney(mt.due)}</p>}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 text-right font-mono-num bg-teal-50/70 text-teal-900">
                        <p className="font-bold">{formatMoney(matrixTotals.grandPaid)}</p>
                        <p className="text-[11px] font-normal">/ {formatMoney(matrixTotals.grandNet)}</p>
                        <p className="text-[11px] text-red-700">{LABELS.reportsPage.matrixGrandDue}: {formatMoney(matrixTotals.grandDue)}</p>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB C ==================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{LABELS.reportsPage.filterFromDate}</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{LABELS.reportsPage.filterToDate}</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{LABELS.common.teacher}</label>
              <TeacherSelect teachers={teachers} value={tabCTeacherId} onChange={setTabCTeacherId} allowAll />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{LABELS.reportsPage.colMethod}</label>
              <select value={tabCMethod} onChange={(e) => setTabCMethod(e.target.value)} className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600">
                <option value="ALL">{LABELS.reportsPage.filterAllMethods}</option>
                {['CASH', 'BANK', 'BKASH', 'OTHER'].map((m) => <option key={m} value={m}>{LABELS.paymentMethods[m]}</option>)}
              </select>
            </div>
            <div className="flex items-center h-10">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none text-sm font-medium text-slate-700">
                <input type="checkbox" checked={showReversed} onChange={(e) => setShowReversed(e.target.checked)} className="w-4 h-4 accent-teal-600 rounded" />
                <span>{LABELS.reportsPage.showReversedToggle}</span>
              </label>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {filteredPayments.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">{LABELS.reportsPage.historyEmpty}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse min-w-[920px]">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-3 px-4 font-semibold">{LABELS.common.date}</th>
                      <th className="py-3 px-4 font-semibold">{LABELS.reportsPage.colReceiptNo}</th>
                      <th className="py-3 px-4 font-semibold">{LABELS.common.teacher}</th>
                      <th className="py-3 px-4 font-semibold text-right">{LABELS.paymentsPage.totalAmountInputLabel}</th>
                      <th className="py-3 px-4 font-semibold">{LABELS.reportsPage.colMonthBreakdown}</th>
                      <th className="py-3 px-4 font-semibold">{LABELS.reportsPage.colMethod}</th>
                      <th className="py-3 px-4 font-semibold text-center">{LABELS.common.status}</th>
                      <th className="py-3 px-4 font-semibold text-right">{LABELS.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((p) => {
                      const teacher = teacherMap.get(Number(p.userId));
                      const strike = p.isReversed ? 'line-through' : '';
                      return (
                        <tr key={p.paymentId} className={`hover:bg-slate-50/80 transition-colors ${p.isReversed ? 'bg-slate-50/60 text-slate-400' : ''}`}>
                          <td className={`py-3 px-4 font-mono-num whitespace-nowrap ${strike || 'text-slate-700'}`}>{formatDate(p.paymentDate)}</td>
                          <td className={`py-3 px-4 font-mono-num font-medium whitespace-nowrap ${strike || 'text-slate-900'}`}>{p.receiptNo}</td>
                          <td className={`py-3 px-4 ${strike || 'text-slate-900'}`}>
                            <p className="font-medium">{teacher?.name ?? `#${p.userId}`}</p>
                            <p className="text-xs text-slate-500">{teacher?.designation}</p>
                          </td>
                          <td className={`py-3 px-4 text-right font-mono-num font-semibold whitespace-nowrap ${p.isReversed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{formatMoney(p.totalAmount)}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {p.details.map((d, idx) => (
                                <span key={idx} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${p.isReversed ? 'bg-slate-100 border-slate-200 text-slate-400 line-through' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                  <span>{d.monthName}{d.year ? ` ${toBengaliDigits(d.year)}` : ''}</span>
                                  <span className="font-mono-num font-medium">{formatMoney(d.amount)}</span>
                                </span>
                              ))}
                            </div>
                            {p.isReversed && p.reverseReason && <p className="text-xs text-red-500 mt-1">{LABELS.receipt.reverseReason}: {p.reverseReason}</p>}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">{LABELS.paymentMethods[p.method]}</td>
                          <td className="py-3 px-4 text-center">
                            <StatusBadge variant={{ kind: p.isReversed ? 'reversed' : 'valid' }} />
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <ReceiptBtn payment={p} />
                              {!p.isReversed && (
                                <button
                                  type="button"
                                  onClick={() => { setReverseTarget(p); setReverseReason(''); setReverseError(''); }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                                >
                                  <Icon d={IC.undo} /><span>{LABELS.reportsPage.reverseAction}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td colSpan={3} className="py-3 px-4">{LABELS.reportsPage.historyTotalLabel}</td>
                      <td className="py-3 px-4 text-right font-mono-num text-teal-800">{formatMoney(validHistoryTotal)}</td>
                      <td colSpan={4} className="py-3 px-4" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== Drawer (ম্যাট্রিক্স সেল) ==================== */}
      <Drawer
        isOpen={Boolean(drawerCell && drawerData)}
        onClose={() => setDrawerCell(null)}
        title={LABELS.reportsPage.drawerTitle}
        subtitle={drawerCell && drawerData ? `${drawerData.teacher?.name ?? ''} · ${drawerCell.monthName} ${toBengaliDigits(tabBYearValue)}` : ''}
      >
        {drawerCell && drawerData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <p className="text-xs text-slate-500">{drawerData.teacher?.designation}</p>
                <p className="text-sm font-semibold text-slate-900">{drawerCell.monthName} {toBengaliDigits(tabBYearValue)}</p>
              </div>
              <StatusBadge variant={{ kind: 'month', status: drawerData.status }} />
            </div>

            {drawerLoading ? (
              <p className="text-sm text-slate-500">লোড হচ্ছে...</p>
            ) : drawerData.details.length > 0 ? (
              <div className="space-y-4">
                {['EARNING', 'DEDUCTION'].map((type) => {
                  const list = drawerData.details.filter((d) => d.headType === type && d.amount > 0);
                  if (list.length === 0) return null;
                  return (
                    <div key={type}>
                      <h4 className={`text-xs font-semibold mb-2 ${type === 'EARNING' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {type === 'EARNING' ? LABELS.reportsPage.drawerEarnings : LABELS.reportsPage.drawerDeductions}
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                        {list.map((d) => (
                          <div key={d.headId} className="flex items-center justify-between px-3 py-2 text-sm">
                            <span className="text-slate-700">{d.headName}</span>
                            <span className={`font-mono-num font-medium ${type === 'EARNING' ? 'text-slate-900' : 'text-red-700'}`}>
                              {type === 'DEDUCTION' ? '-' : ''}{formatMoney(d.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">{LABELS.reportsPage.drawerNet}</span><span className="font-mono-num font-bold text-slate-900">{formatMoney(drawerData.net)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">{LABELS.reportsPage.colPaid}</span><span className="font-mono-num font-semibold text-emerald-700">{formatMoney(drawerData.paid)}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-slate-700 font-medium">{LABELS.reportsPage.colDue}</span>
                    <span className={`font-mono-num font-bold ${drawerData.due > 0 ? 'text-red-700' : 'text-slate-700'}`}>{formatMoney(drawerData.due)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600">
                <p>{LABELS.reportsPage.drawerNoSheet}</p>
                {drawerData.paid > 0 && <p className="mt-2 font-semibold text-blue-700">{LABELS.monthStatus.ADVANCE}: {formatMoney(drawerData.paid)}</p>}
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">{LABELS.reportsPage.drawerPayments}</h4>
              {drawerData.monthPayments.length === 0 ? (
                <p className="text-xs text-slate-500">{LABELS.reportsPage.noPaymentsForMonth}</p>
              ) : (
                <div className="space-y-2">
                  {drawerData.monthPayments.map(({ payment, monthAmount }) => (
                    <div key={payment.paymentId} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-mono-num font-semibold text-slate-900">{payment.receiptNo}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatDate(payment.paymentDate)} · {LABELS.paymentMethods[payment.method]}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono-num font-bold text-emerald-700">{formatMoney(monthAmount)}</p>
                        <button type="button" onClick={() => setReceiptPayment(payment)} className="text-xs text-teal-700 hover:underline mt-0.5">{LABELS.paymentsPage.viewReceipt}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* ==================== Reverse Modal ==================== */}
      <Modal
        isOpen={Boolean(reverseTarget)}
        onClose={() => setReverseTarget(null)}
        title={LABELS.reportsPage.reverseModalTitle}
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setReverseTarget(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">{LABELS.common.cancel}</button>
            <button type="submit" form="reverse-form" disabled={isReversing} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
              {isReversing ? '...' : LABELS.reportsPage.reverseAction}
            </button>
          </>
        }
      >
        <form id="reverse-form" onSubmit={handleConfirmReverse} className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {LABELS.reportsPage.reverseModalWarning
              .replace('{receiptNo}', reverseTarget?.receiptNo ?? '')
              .replace('{amount}', formatMoney(reverseTarget?.totalAmount ?? 0))}
          </p>
          <div>
            <label htmlFor="reverse-reason-input" className="block text-sm font-medium text-slate-700 mb-1.5">{LABELS.reportsPage.reverseReasonLabel}</label>
            <textarea
              id="reverse-reason-input"
              rows={3}
              value={reverseReason}
              onChange={(e) => { setReverseReason(e.target.value); if (reverseError) setReverseError(''); }}
              placeholder={LABELS.reportsPage.reverseReasonPlaceholder}
              autoFocus
              className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-600"
            />
            {reverseError && <p className="text-xs text-red-600 mt-1">{reverseError}</p>}
          </div>
        </form>
      </Modal>

      <ReceiptView
        payment={receiptPayment}
        teacher={teachers.find((t) => Number(t.userId) === Number(receiptPayment?.userId))}
        isOpen={Boolean(receiptPayment)}
        onClose={() => setReceiptPayment(null)}
      />

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 text-white px-4 py-2.5 text-sm shadow-lg">{toast.text}</div>
      )}
    </div>
  );
};
