// GenerateSalaryPage.jsx — মাসিক বেতন তৈরি (v2)
import React, { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { DataTable } from './DataTable';
import { MoneyInput } from './MoneyInput';
import { StatusBadge } from './StatusBadge';
import { Modal } from './Modal';
import { LABELS } from '../../helper/labels';
import { formatMoney, toBengaliDigits } from '../../utils/format';
import {
  useGetTeachersQuery,
  useGetHeadsQuery,
  useGetSheetsQuery,
  useGenerateSheetsMutation,
  useSyncSheetsMutation,
  useUpdateSheetMutation,
  useFinalizeSheetMutation,
  useFinalizeSheetsForMonthMutation,
  useRevertSheetMutation,
  useGetYearsQuery,
  useGetMonthsQuery,
  useCreateYearMutation,
  useUpdateYearMutation,
  useUpdateYearStatusMutation,
  useCreateMonthMutation,
  useUpdateMonthMutation,
  useUpdateMonthStatusMutation,
} from '../../features/teachers/teachersSlice';

// ─── Helpers ──────────────────────────────────────────────────────
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n) => Math.round(toNum(n) * 100) / 100;

const Icon = ({ d, size = 14, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {d.map((p, i) => <path key={i} d={p} />)}
  </svg>
);
const IC = {
  file: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M12 18v-6', 'M9 15h6'],
  cal: ['M8 2v4', 'M16 2v4', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'M3 10h18'],
  refresh: ['M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M3 21v-5h5', 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5'],
  checks: ['M18 6 7 17l-5-5', 'm22 10-7.5 7.5L13 16'],
  check: ['M20 6 9 17l-5-5'],
  save: ['M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7', 'M7 3v4a1 1 0 0 0 1 1h7'],
  undo: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
  edit: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z'],
  power: ['M18.36 6.64a9 9 0 1 1-12.73 0', 'M12 2v10'],
  plus: ['M5 12h14', 'M12 5v14'],
  grid: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
};

// ─── Mappers ──────────────────────────────────────────────────────
const mapTeacher = (t) => ({
  userId: t.userId ?? t.UserID,
  userCode: t.userCode ?? t.UserCode ?? '',
  name: t.name ?? t.UserName ?? '',
  designation: (t.designation ?? t.Designation ?? '').trim(),
});

const mapHead = (h) => ({
  headId: Number(h.HeadID),
  headName: h.HeadName,
  headType: h.HeadType,
  sortOrder: Number(h.SortOrder) || 0,
  isActive: Boolean(h.IsActive),
});

const mapDetail = (d) => ({
  headId: Number(d.HeadID ?? d.headId),
  headType: d.HeadType ?? d.headType ?? '',
  amount: toNum(d.Amount ?? d.amount),
});

const mapSheet = (s) => ({
  sheetId: s.SheetID ?? s.sheetId,
  userId: Number(s.UserID ?? s.userId),
  yearId: s.YearID ?? s.yearId,
  monthId: s.MonthID ?? s.monthId,
  status: s.Status ?? s.status,
  netAmount: toNum(s.NetAmount ?? s.netAmount),
  details: (s.Details ?? s.details ?? []).map(mapDetail),
});

const calcTotals = (details) => {
  let gross = 0;
  let deduction = 0;
  for (const d of details) {
    if (d.headType === 'EARNING') gross += toNum(d.amount);
    else deduction += toNum(d.amount);
  }
  return { gross: round2(gross), deduction: round2(deduction), net: Math.max(0, round2(gross - deduction)) };
};

// ═══════════════════════════════════════════════════════════════════
export const GenerateSalaryPage = () => {
  // ─── Year / Month ────────────────────────────────────────────
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [selectedMonthId, setSelectedMonthId] = useState(null);
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [monthModalOpen, setMonthModalOpen] = useState(false);

  const { data: yearsRes } = useGetYearsQuery();
  const years = useMemo(() => yearsRes?.data ?? [], [yearsRes]);

  // ডিফল্ট বছর = চলতি বছর (না থাকলে প্রথমটি)
  useEffect(() => {
    if (!selectedYearId && years.length > 0) {
      const cur = years.find((y) => Number(y.YearValue) === new Date().getFullYear());
      setSelectedYearId(Number((cur ?? years[0]).YearID));
    }
  }, [years, selectedYearId]);

  const { data: monthsRes, isFetching: monthsFetching } = useGetMonthsQuery(
    { yearId: selectedYearId },
    { skip: !selectedYearId }
  );
  const months = useMemo(() => monthsRes?.data ?? [], [monthsRes]);

  // মাস লোড হলে: সিলেক্টেড মাস এই বছরের না হলে চলতি মাস / প্রথম মাস
  useEffect(() => {
    if (monthsFetching) return;
    if (months.length === 0) {
      setSelectedMonthId(null);
      return;
    }
    const exists = months.some((m) => Number(m.MonthID) === Number(selectedMonthId));
    if (!exists) {
      const yearObj = years.find((y) => Number(y.YearID) === Number(selectedYearId));
      const isCurrentYear = yearObj && Number(yearObj.YearValue) === new Date().getFullYear();
      const cur = isCurrentYear ? months.find((m) => Number(m.MonthValue) === new Date().getMonth() + 1) : null;
      setSelectedMonthId(Number((cur ?? months[0]).MonthID));
    }
  }, [months, monthsFetching, selectedMonthId, selectedYearId, years]);

  const [finalizeAllConfirmOpen, setFinalizeAllConfirmOpen] = useState(false);
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
  const [editedMap, setEditedMap] = useState({}); // { [sheetId]: { [headId]: number } }
  const [toast, setToast] = useState(null);
  const addToast = (kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 3000);
  };

  // ─── Queries ──────────────────────────────────────────────────
  const { data: teachersRes, isLoading: teachersLoading } = useGetTeachersQuery();
  const { data: headsRes, isLoading: headsLoading } = useGetHeadsQuery();
  const { data: sheetsRes, isLoading: sheetsLoading, isFetching: sheetsFetching } = useGetSheetsQuery(
    { YearID: selectedYearId, MonthID: selectedMonthId },
    { skip: !selectedYearId || !selectedMonthId }
  );

  // ─── Mutations ────────────────────────────────────────────────
  const [generateSheets, { isLoading: isGenerating }] = useGenerateSheetsMutation();
  const [syncSheets, { isLoading: isSyncing }] = useSyncSheetsMutation();
  const [updateSheet, { isLoading: isSavingRow }] = useUpdateSheetMutation();
  const [finalizeSheet, { isLoading: isFinalizingRow }] = useFinalizeSheetMutation();
  const [finalizeSheetsForMonth, { isLoading: isFinalizingAll }] = useFinalizeSheetsForMonthMutation();
  const [revertSheet, { isLoading: isRevertingRow }] = useRevertSheetMutation();

  const isLoading = teachersLoading || headsLoading || sheetsLoading || sheetsFetching;
  const isBusy = isGenerating || isSyncing || isSavingRow || isFinalizingRow || isFinalizingAll || isRevertingRow;

  // ─── Normalized data ──────────────────────────────────────────
  const teachers = useMemo(() => (teachersRes?.data ?? []).map(mapTeacher), [teachersRes]);
  const heads = useMemo(() => (headsRes?.data ?? []).map(mapHead), [headsRes]);
  const teacherMap = useMemo(() => new Map(teachers.map((t) => [Number(t.userId), t])), [teachers]);

  const monthSheets = useMemo(() => {
    const idx = new Map(teachers.map((t, i) => [Number(t.userId), i]));
    // ✅ কপি করে sort (আগে memo করা array নিজেই বদলে যেত)
    return (sheetsRes?.data ?? [])
      .map(mapSheet)
      .sort((a, b) => (idx.get(a.userId) ?? 9999) - (idx.get(b.userId) ?? 9999));
  }, [sheetsRes, teachers]);

  useEffect(() => {
    setEditedMap({});
  }, [selectedYearId, selectedMonthId]);

  // কলাম: সব সক্রিয় খাত + শিটে থাকা যেকোনো খাত (নিষ্ক্রিয় হলেও)
  const displayHeads = useMemo(() => {
    const ids = new Set(heads.filter((h) => h.isActive).map((h) => h.headId));
    for (const s of monthSheets) for (const d of s.details) ids.add(d.headId);
    const headMap = new Map(heads.map((h) => [h.headId, h]));
    return [...ids]
      .map((id) => headMap.get(id) ?? { headId: id, headName: `খাত #${id}`, headType: 'EARNING', sortOrder: 999, isActive: false })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [heads, monthSheets]);

  const draftCount = useMemo(() => monthSheets.filter((s) => s.status === 'DRAFT').length, [monthSheets]);
  const finalCount = monthSheets.length - draftCount;

  // ─── Cell helpers (সবসময় number ফেরত দেয়) ─────────────────────
  const getCellValue = (sheet, headId) => {
    const rowEdits = editedMap[sheet.sheetId];
    if (rowEdits && rowEdits[headId] !== undefined) return toNum(rowEdits[headId]);
    return sheet.details.find((d) => d.headId === Number(headId))?.amount ?? 0;
  };

  const buildRowDetails = (sheet) =>
    displayHeads.map((h) => ({ headId: h.headId, headType: h.headType, amount: getCellValue(sheet, h.headId) }));

  const buildDetailsPayload = (sheet) =>
    displayHeads.map((h) => ({ HeadID: h.headId, Amount: getCellValue(sheet, h.headId) }));

  const handleCellChange = (sheetId, headId, val) => {
    setEditedMap((prev) => ({
      ...prev,
      [sheetId]: { ...(prev[sheetId] ?? {}), [headId]: toNum(val) }, // ✅ string নয়, number
    }));
  };

  const clearRowEdits = (sheetId) =>
    setEditedMap((prev) => {
      const next = { ...prev };
      delete next[sheetId];
      return next;
    });

  const teacherName = (sheet) => teacherMap.get(sheet.userId)?.name ?? '';

  // ─── Actions ──────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!selectedYearId || !selectedMonthId) return addToast('info', 'বছর এবং মাস সিলেক্ট করুন');
    try {
      const res = await generateSheets({ YearID: selectedYearId, MonthID: selectedMonthId }).unwrap();
      const created = toNum(res?.createdCount);
      const existing = toNum(res?.existingCount);
      if (created === 0) {
        addToast('info', LABELS.generatePage.toastAllExisted.replace('{existing}', toBengaliDigits(existing)));
      } else {
        addToast(
          'success',
          LABELS.generatePage.toastGenerated
            .replace('{created}', toBengaliDigits(created))
            .replace('{existing}', toBengaliDigits(existing))
        );
      }
    } catch (err) {
      addToast('error', err?.data?.error ?? 'শিট তৈরি করতে সমস্যা হয়েছে');
    }
  };

  // ✅ কাঠামো থেকে খসড়া শিট আপডেট
  const handleConfirmSync = async () => {
    try {
      const res = await syncSheets({ YearID: selectedYearId, MonthID: selectedMonthId }).unwrap();
      setEditedMap({});
      const skipped = res?.skipped?.length ?? 0;
      addToast(
        'success',
        `${toBengaliDigits(res?.updated ?? 0)} টি খসড়া শিট কাঠামো থেকে আপডেট হয়েছে` +
        (skipped ? ` · ${toBengaliDigits(skipped)} টি বাদ (নিট < পরিশোধিত)` : '')
      );
    } catch (err) {
      addToast('error', err?.data?.error ?? 'আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setSyncConfirmOpen(false);
    }
  };

  const handleSaveRow = async (sheet) => {
    try {
      await updateSheet({ sheetId: sheet.sheetId, Details: buildDetailsPayload(sheet) }).unwrap();
      clearRowEdits(sheet.sheetId);
      addToast('success', LABELS.generatePage.toastRowSaved.replace('{name}', teacherName(sheet)));
    } catch (err) {
      addToast('error', err?.data?.error ?? 'সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  const handleFinalizeRow = async (sheet) => {
    try {
      if (editedMap[sheet.sheetId]) {
        await updateSheet({ sheetId: sheet.sheetId, Details: buildDetailsPayload(sheet) }).unwrap();
        clearRowEdits(sheet.sheetId);
      }
      await finalizeSheet(sheet.sheetId).unwrap();
      addToast('success', LABELS.generatePage.toastRowFinalized.replace('{name}', teacherName(sheet)));
    } catch (err) {
      addToast('error', err?.data?.error ?? 'চূড়ান্ত করতে সমস্যা হয়েছে');
    }
  };

  const handleRevertRow = async (sheet) => {
    try {
      await revertSheet(sheet.sheetId).unwrap();
      addToast('info', LABELS.generatePage.toastRowReverted.replace('{name}', teacherName(sheet)));
    } catch (err) {
      addToast('error', err?.data?.error ?? '');
    }
  };

  const handleConfirmFinalizeAll = async () => {
    if (draftCount === 0) {
      addToast('info', LABELS.generatePage.toastNoDraftsToFinalize);
      setFinalizeAllConfirmOpen(false);
      return;
    }
    try {
      for (const s of monthSheets) {
        if (s.status === 'DRAFT' && editedMap[s.sheetId]) {
          await updateSheet({ sheetId: s.sheetId, Details: buildDetailsPayload(s) }).unwrap();
        }
      }
      setEditedMap({});
      const res = await finalizeSheetsForMonth({ YearID: selectedYearId, MonthID: selectedMonthId }).unwrap();
      addToast('success', LABELS.generatePage.toastAllFinalized.replace('{count}', toBengaliDigits(toNum(res?.count))));
    } catch (err) {
      addToast('error', err?.data?.error ?? '');
    } finally {
      setFinalizeAllConfirmOpen(false);
    }
  };

  // ─── Column totals (✅ সব number) ─────────────────────────────
  const columnTotals = useMemo(() => {
    const headSums = {};
    for (const h of displayHeads) headSums[h.headId] = 0;
    let grandNet = 0;
    for (const sheet of monthSheets) {
      const rowEdits = editedMap[sheet.sheetId];
      const details = displayHeads.map((h) => {
        const amt =
          rowEdits && rowEdits[h.headId] !== undefined
            ? toNum(rowEdits[h.headId])
            : sheet.details.find((d) => d.headId === h.headId)?.amount ?? 0;
        headSums[h.headId] = round2(headSums[h.headId] + amt);
        return { headId: h.headId, headType: h.headType, amount: amt };
      });
      grandNet = round2(grandNet + calcTotals(details).net);
    }
    return { headSums, grandNet };
  }, [displayHeads, monthSheets, editedMap]);

  const selectedMonthName = months.find((m) => Number(m.MonthID) === Number(selectedMonthId))?.MonthName || '';
  const selectedYearValue = years.find((y) => Number(y.YearID) === Number(selectedYearId))?.YearValue || '';

  return (
    <div className="space-y-5">
      {/* ===================== হেডার */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-5 py-4 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/20 backdrop-blur">
                <Icon size={20} d={IC.file} />
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight sm:text-[20px]">{LABELS.nav.generate}</h3>
                <p className="text-xs text-white/80 sm:text-sm">{LABELS.generatePage.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
                <span className="text-[13px] font-medium">খসড়া</span>
                <span className="text-[17px] font-bold leading-none">{toBengaliDigits(draftCount)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
                <span className="text-[13px] font-medium">চূড়ান্ত</span>
                <span className="text-[17px] font-bold leading-none">{toBengaliDigits(finalCount)}</span>
              </div>
            </div>
          </div>

          {/* বছর ও মাস */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 backdrop-blur">
              <span className="text-xs font-medium text-white/80">বছর:</span>
              <select
                value={selectedYearId || ''}
                onChange={(e) => setSelectedYearId(e.target.value ? Number(e.target.value) : null)}
                className="h-8 min-w-[110px] px-2 text-sm font-semibold text-slate-900 bg-white rounded-md border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
              >
                <option value="">বছর সিলেক্ট</option>
                {years.map((y) => (
                  <option key={y.YearID} value={y.YearID}>
                    {toBengaliDigits(y.YearValue)}{!y.IsActive ? ' (নিষ্ক্রিয়)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 backdrop-blur">
              <span className="text-xs font-medium text-white/80">মাস:</span>
              <select
                value={selectedMonthId || ''}
                onChange={(e) => setSelectedMonthId(e.target.value ? Number(e.target.value) : null)}
                disabled={!selectedYearId}
                className="h-8 min-w-[130px] px-2 text-sm font-semibold text-slate-900 bg-white rounded-md border-0 focus:ring-2 focus:ring-white/50 focus:outline-none disabled:opacity-50"
              >
                <option value="">মাস সিলেক্ট</option>
                {months.map((m) => (
                  <option key={m.MonthID} value={m.MonthID}>
                    {m.MonthName}{!m.IsActive ? ' (নিষ্ক্রিয়)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" onClick={() => setYearModalOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-colors backdrop-blur">
              <Icon d={IC.cal} /> বছর ম্যানেজ
            </button>
            <button type="button" onClick={() => setMonthModalOpen(true)} disabled={!selectedYearId} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-colors backdrop-blur disabled:opacity-50 disabled:cursor-not-allowed">
              <Icon d={IC.cal} /> মাস ম্যানেজ
            </button>
          </div>

          {/* অ্যাকশন বার */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg bg-white/95 px-3 py-2.5 text-slate-800 shadow-sm backdrop-blur">
            <p className="text-xs text-slate-500">
              {selectedMonthName && selectedYearValue
                ? `${selectedMonthName} ${toBengaliDigits(selectedYearValue)} · মোট ${toBengaliDigits(monthSheets.length)} জনের শিট`
                : 'বছর ও মাস সিলেক্ট করুন'}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isBusy || !selectedYearId || !selectedMonthId}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-indigo-700 bg-white border border-indigo-100 rounded-lg shadow hover:bg-indigo-50 transition-colors whitespace-nowrap disabled:opacity-60"
                title="যাদের এই মাসের শিট নেই, শুধু তাদের জন্য কাঠামো থেকে নতুন শিট তৈরি হবে"
              >
                <Icon size={16} d={IC.file} />
                <span>{isGenerating ? '...' : LABELS.generatePage.generateBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setSyncConfirmOpen(true)}
                disabled={isBusy || draftCount === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed"
                title="সব খসড়া শিটে কাঠামোর বর্তমান টাকা আবার বসানো হবে"
              >
                <Icon size={16} d={IC.refresh} />
                <span>{isSyncing ? '...' : 'কাঠামো থেকে আপডেট করুন'}</span>
              </button>

              <button
                type="button"
                disabled={draftCount === 0 || isBusy}
                onClick={() => setFinalizeAllConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Icon size={16} d={IC.checks} className="text-indigo-600" />
                <span>{LABELS.generatePage.finalizeAllBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== শিট টেবিল */}
      <DataTable
        isLoading={isLoading}
        isEmpty={monthSheets.length === 0}
        emptyTitle={!selectedMonthId ? 'মাস সিলেক্ট করুন' : LABELS.generatePage.emptyTitle}
        emptyDescription={!selectedMonthId ? 'শিট দেখতে উপরে থেকে বছর এবং মাস সিলেক্ট করুন' : LABELS.generatePage.emptyDesc}
        emptyAction={
          selectedMonthId && (
            <button type="button" onClick={handleGenerate} disabled={isBusy} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60">
              <Icon size={16} d={IC.file} />
              <span>{LABELS.generatePage.generateBtn}</span>
            </button>
          )
        }
        skeletonCols={7}
      >
        <table className="w-full text-sm text-left border-collapse min-w-[960px]">
          <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="sticky left-0 z-30 bg-slate-50 py-3 px-4 font-semibold border-r border-slate-200 min-w-[190px]">{LABELS.common.teacher}</th>
              <th className="py-3 px-3 font-semibold whitespace-nowrap min-w-[120px]">{LABELS.common.designation}</th>
              {displayHeads.map((h) => (
                <th key={h.headId} className={`py-3 px-3 font-semibold text-right whitespace-nowrap min-w-[130px] ${h.headType === 'EARNING' ? 'text-emerald-700 bg-emerald-50/40' : 'text-red-700 bg-red-50/40'}`}>
                  {h.headName}
                  {!h.isActive && <span className="ml-1 text-[10px] font-normal text-slate-400">(নিষ্ক্রিয়)</span>}
                </th>
              ))}
              <th className="py-3 px-4 font-semibold text-right whitespace-nowrap min-w-[120px] bg-slate-100/70">{LABELS.generatePage.colNet}</th>
              <th className="py-3 px-3 font-semibold text-center whitespace-nowrap min-w-[100px]">{LABELS.common.status}</th>
              <th className="py-3 px-4 font-semibold text-right whitespace-nowrap min-w-[200px]">{LABELS.common.actions}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {monthSheets.map((sheet) => {
              const teacher = teacherMap.get(sheet.userId);
              const isFinal = sheet.status === 'FINAL';
              const isRowEdited = Boolean(editedMap[sheet.sheetId]);
              const liveNet = calcTotals(buildRowDetails(sheet)).net;

              return (
                <tr key={sheet.sheetId} className={`hover:bg-slate-50/80 transition-colors ${isFinal ? 'bg-slate-50/30' : 'bg-white'}`}>
                  <td className="sticky left-0 z-10 bg-white py-2.5 px-4 border-r border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{teacher?.name ?? `#${sheet.userId}`}</p>
                        <p className="text-xs text-slate-500">{teacher?.userCode}</p>
                      </div>
                      {isRowEdited && (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">{LABELS.generatePage.unsavedRowHint}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-nowrap">{teacher?.designation || '—'}</td>

                  {displayHeads.map((h) => (
                    <td key={h.headId} className="py-2 px-2.5">
                      <MoneyInput
                        compact
                        disabled={isFinal}
                        value={getCellValue(sheet, h.headId)}
                        onChange={(val) => handleCellChange(sheet.sheetId, h.headId, val)}
                        ariaLabel={`${teacher?.name ?? ''} - ${h.headName}`}
                      />
                    </td>
                  ))}

                  <td className="py-2.5 px-4 text-right font-mono-num font-bold text-slate-900 bg-slate-50/60 whitespace-nowrap">{formatMoney(liveNet)}</td>
                  <td className="py-2.5 px-3 text-center"><StatusBadge variant={{ kind: 'sheet', status: sheet.status }} /></td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {!isFinal ? (
                        <>
                          <button type="button" onClick={() => handleSaveRow(sheet)} disabled={isBusy || !isRowEdited} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 whitespace-nowrap disabled:opacity-50">
                            <Icon d={IC.save} /><span>{LABELS.generatePage.saveRow}</span>
                          </button>
                          <button type="button" onClick={() => handleFinalizeRow(sheet)} disabled={isBusy} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 whitespace-nowrap disabled:opacity-50">
                            <Icon d={IC.check} /><span>{LABELS.generatePage.finalizeRow}</span>
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => handleRevertRow(sheet)} disabled={isBusy} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 whitespace-nowrap disabled:opacity-50">
                          <Icon d={IC.undo} /><span>{LABELS.generatePage.revertRow}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-900">
            <tr>
              <td className="sticky left-0 z-10 bg-slate-50 py-3 px-4 border-r border-slate-200">
                {LABELS.generatePage.totalRowLabel} ({toBengaliDigits(monthSheets.length)} জন)
              </td>
              <td className="py-3 px-3" />
              {displayHeads.map((h) => (
                <td key={h.headId} className="py-3 px-3 text-right font-mono-num whitespace-nowrap">{formatMoney(columnTotals.headSums[h.headId] ?? 0)}</td>
              ))}
              <td className="py-3 px-4 text-right font-mono-num font-bold text-teal-800 bg-teal-50/70 whitespace-nowrap">{formatMoney(columnTotals.grandNet)}</td>
              <td className="py-3 px-3" />
              <td className="py-3 px-4" />
            </tr>
          </tfoot>
        </table>
      </DataTable>

      <ConfirmDialog
        isOpen={finalizeAllConfirmOpen}
        onClose={() => setFinalizeAllConfirmOpen(false)}
        onConfirm={handleConfirmFinalizeAll}
        title={LABELS.generatePage.finalizeAllTitle}
        message={LABELS.generatePage.finalizeAllMessage
          .replace('{month}', selectedMonthName)
          .replace('{year}', toBengaliDigits(selectedYearValue))
          .replace('{count}', toBengaliDigits(draftCount))}
        variant="primary"
      />

      <ConfirmDialog
        isOpen={syncConfirmOpen}
        onClose={() => setSyncConfirmOpen(false)}
        onConfirm={handleConfirmSync}
        title="কাঠামো থেকে আপডেট"
        message={`${selectedMonthName} ${toBengaliDigits(selectedYearValue)} এর ${toBengaliDigits(draftCount)} টি খসড়া শিটে বেতন কাঠামোর বর্তমান টাকা বসানো হবে। এই শিটগুলোতে হাতে করা পরিবর্তন মুছে যাবে। চূড়ান্ত শিট বদলাবে না।`}
        variant="warning"
      />

      <YearModal
        isOpen={yearModalOpen}
        onClose={() => setYearModalOpen(false)}
        years={years}
        selectedYearId={selectedYearId}
        onSelectYear={setSelectedYearId}
      />

      <MonthModal
        isOpen={monthModalOpen}
        onClose={() => setMonthModalOpen(false)}
        years={years}
        months={months}
        selectedYearId={selectedYearId}
        selectedMonthId={selectedMonthId}
        onSelectYear={setSelectedYearId}
        onSelectMonth={setSelectedMonthId}
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${toast.kind === 'error' ? 'bg-red-600' : 'bg-slate-900'}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   YEAR MODAL
   ═══════════════════════════════════════════════════════════════ */
const YearModal = ({ isOpen, onClose, years, selectedYearId, onSelectYear }) => {
  const [editYearId, setEditYearId] = useState(null);
  const [yearValue, setYearValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const [createYear, { isLoading: isCreatingYear }] = useCreateYearMutation();
  const [updateYear, { isLoading: isUpdatingYear }] = useUpdateYearMutation();
  const [updateYearStatus] = useUpdateYearStatusMutation();

  useEffect(() => {
    if (isOpen) {
      setFormOpen(false);
      setEditYearId(null);
      setYearValue('');
    }
  }, [isOpen]);

  const handleOpenForm = (year = null) => {
    setEditYearId(year ? year.YearID : null);
    setYearValue(year ? year.YearValue : new Date().getFullYear());
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditYearId(null);
    setYearValue('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!yearValue) return;
    try {
      if (editYearId) await updateYear({ yearId: editYearId, YearValue: Number(yearValue) }).unwrap();
      else await createYear({ YearValue: Number(yearValue) }).unwrap();
      closeForm();
    } catch (err) {
      alert(err?.data?.error || 'সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  const handleToggleStatus = async (year) => {
    try {
      await updateYearStatus({ yearId: year.YearID, IsActive: !year.IsActive }).unwrap();
    } catch (err) {
      alert(err?.data?.error || 'স্টেটাস পরিবর্তন করতে সমস্যা হয়েছে');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="বছর ম্যানেজমেন্ট"
      subtitle="বছর তৈরি, এডিট এবং স্টেটাস পরিবর্তন করুন"
      size="lg"
      icon={<Icon size={18} d={IC.cal} />}
      footer={<button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">বন্ধ করুন</button>}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">বছরসমূহ</h4>
            <p className="text-xs text-slate-500 mt-0.5">মোট {toBengaliDigits(years.length)} টি বছর</p>
          </div>
          <button onClick={() => handleOpenForm()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            <Icon d={IC.plus} /> নতুন বছর
          </button>
        </div>

        {formOpen && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
            <form onSubmit={handleSave} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">{editYearId ? 'বছর এডিট করুন' : 'নতুন বছর'}</label>
                <input
                  type="number"
                  value={yearValue}
                  onChange={(e) => setYearValue(e.target.value)}
                  required
                  min={2000}
                  max={2100}
                  placeholder="যেমন: 2026"
                  className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" disabled={isCreatingYear || isUpdatingYear} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {isCreatingYear || isUpdatingYear ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </button>
                <button type="button" onClick={closeForm} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">বাতিল</button>
              </div>
            </form>
          </div>
        )}

        {years.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-sm">কোনো বছর নেই। নতুন বছর তৈরি করুন।</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold text-xs">বছর</th>
                  <th className="py-2.5 px-4 font-semibold text-xs">স্টেটাস</th>
                  <th className="py-2.5 px-4 font-semibold text-xs text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {years.map((y) => {
                  const selected = Number(selectedYearId) === Number(y.YearID);
                  return (
                    <tr key={y.YearID} className={`hover:bg-slate-50/80 transition-colors ${selected ? 'bg-indigo-50/40' : ''}`}>
                      <td className="py-2.5 px-4">
                        <button onClick={() => onSelectYear(Number(y.YearID))} className="text-base font-bold text-slate-800 hover:text-indigo-700" title="এই বছর সিলেক্ট করুন">
                          {toBengaliDigits(y.YearValue)}
                        </button>
                        {selected && <span className="ml-2 text-[10px] font-medium text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">সিলেক্টেড</span>}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusPill active={y.IsActive} />
                      </td>
                      <td className="py-2.5 px-4">
                        <RowActions onEdit={() => handleOpenForm(y)} onToggle={() => handleToggleStatus(y)} active={y.IsActive} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};

const StatusPill = ({ active }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
    {active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
  </span>
);

const RowActions = ({ onEdit, onToggle, active }) => (
  <div className="flex items-center justify-end gap-1.5">
    <button onClick={onEdit} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
      <Icon size={12} d={IC.edit} /> এডিট
    </button>
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${active ? 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100' : 'text-green-700 bg-green-50 border border-green-200 hover:bg-green-100'}`}
    >
      <Icon size={12} d={IC.power} /> {active ? 'নিষ্ক্রিয়' : 'সক্রিয়'}
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MONTH MODAL — একক বা একসাথে ১২ মাস
   ═══════════════════════════════════════════════════════════════ */
const MonthModal = ({ isOpen, onClose, years, months, selectedYearId, selectedMonthId, onSelectYear, onSelectMonth }) => {
  const [editMonthId, setEditMonthId] = useState(null);
  const [monthName, setMonthName] = useState('');
  const [monthValue, setMonthValue] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  const [createMonth, { isLoading: isCreatingMonth }] = useCreateMonthMutation();
  const [updateMonth, { isLoading: isUpdatingMonth }] = useUpdateMonthMutation();
  const [updateMonthStatus] = useUpdateMonthStatusMutation();

  useEffect(() => {
    if (isOpen) {
      setFormOpen(false);
      setEditMonthId(null);
      setMonthName('');
      setMonthValue('');
      setBulkOpen(false);
      setBulkRows([]);
      setBulkProgress({ done: 0, total: 0 });
    }
  }, [isOpen]);

  const usedValues = new Set(months.map((m) => Number(m.MonthValue)));

  const handleOpenForm = (month = null) => {
    if (month) {
      setEditMonthId(month.MonthID);
      setMonthName(month.MonthName);
      setMonthValue(Number(month.MonthValue));
    } else {
      setEditMonthId(null);
      setMonthName('');
      const free = Array.from({ length: 12 }, (_, i) => i + 1).find((v) => !usedValues.has(v));
      setMonthValue(free ?? '');
    }
    setBulkOpen(false);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditMonthId(null);
    setMonthName('');
    setMonthValue('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!monthName.trim() || !selectedYearId || !monthValue) return;
    try {
      const payload = { YearID: Number(selectedYearId), MonthValue: Number(monthValue), MonthName: monthName.trim() };
      if (editMonthId) await updateMonth({ monthId: editMonthId, ...payload }).unwrap();
      else await createMonth(payload).unwrap();
      closeForm();
    } catch (err) {
      alert(err?.data?.error || 'সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  const handleToggleStatus = async (month) => {
    try {
      await updateMonthStatus({ monthId: month.MonthID, IsActive: !month.IsActive }).unwrap();
    } catch (err) {
      alert(err?.data?.error || 'স্টেটাস পরিবর্তন করতে সমস্যা হয়েছে');
    }
  };

  const handleOpenBulk = () => {
    const rows = Array.from({ length: 12 }, (_, i) => {
      const serial = i + 1;
      const existing = months.find((m) => Number(m.MonthValue) === serial);
      return { id: existing ? existing.MonthID : null, value: serial, name: existing ? existing.MonthName : '', original: existing ? existing.MonthName : '' };
    });
    setBulkRows(rows);
    setFormOpen(false);
    setBulkOpen(true);
    setBulkProgress({ done: 0, total: 0 });
  };

  const handleBulkRowChange = (idx, val) => setBulkRows((prev) => prev.map((row, i) => (i === idx ? { ...row, name: val } : row)));

  // শুধু নতুন বা নাম বদলানো রো সেভ হবে
  const changedRows = bulkRows.filter((r) => r.name.trim() && (!r.id || r.name.trim() !== r.original));

  const handleBulkSave = async () => {
    if (!selectedYearId) return alert('বছর সিলেক্ট করুন');
    if (changedRows.length === 0) return alert('কোনো নতুন/পরিবর্তিত মাস নেই');
    if (!window.confirm(`আপনি ${changedRows.length} টি মাস সেভ করতে যাচ্ছেন। নিশ্চিত?`)) return;

    setBulkSaving(true);
    setBulkProgress({ done: 0, total: changedRows.length });
    let success = 0;
    const errors = [];

    for (let i = 0; i < changedRows.length; i++) {
      const r = changedRows[i];
      const payload = { YearID: Number(selectedYearId), MonthValue: r.value, MonthName: r.name.trim() };
      try {
        if (r.id) await updateMonth({ monthId: r.id, ...payload }).unwrap();
        else await createMonth(payload).unwrap();
        success++;
      } catch (err) {
        errors.push(`${r.name}: ${err?.data?.error || 'ব্যর্থ'}`);
      }
      setBulkProgress({ done: i + 1, total: changedRows.length });
    }

    setBulkSaving(false);
    if (errors.length === 0) {
      alert(`সফলভাবে ${success} টি মাস সেভ হয়েছে ✅`);
      setBulkOpen(false);
      setBulkRows([]);
    } else {
      alert(`${success} টি সফল, ${errors.length} টি ব্যর্থ:\n${errors.slice(0, 5).join('\n')}`);
    }
  };

  const pct = bulkProgress.total > 0 ? Math.round((bulkProgress.done / bulkProgress.total) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="মাস ম্যানেজমেন্ট"
      subtitle="একক বা একসাথে ১২ মাস তৈরি, এডিট এবং স্টেটাস পরিবর্তন"
      size="2xl"
      icon={<Icon size={18} d={IC.cal} />}
      footer={<button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">বন্ধ করুন</button>}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 shadow-sm">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">বছর সিলেক্ট করুন</label>
          <select
            value={selectedYearId || ''}
            onChange={(e) => {
              onSelectYear(Number(e.target.value) || null);
              setFormOpen(false);
              setBulkOpen(false);
            }}
            className="w-full h-9 px-3 text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">বছর সিলেক্ট করুন</option>
            {years.map((y) => (
              <option key={y.YearID} value={y.YearID}>{toBengaliDigits(y.YearValue)}{!y.IsActive ? ' (নিষ্ক্রিয়)' : ''}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-800">মাসসমূহ</h4>
            <p className="text-xs text-slate-500 mt-0.5">{selectedYearId ? `মোট ${toBengaliDigits(months.length)} টি মাস` : 'আগে বছর সিলেক্ট করুন'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleOpenBulk} disabled={!selectedYearId} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Icon d={IC.grid} /> একসাথে ১২ মাস
            </button>
            <button onClick={() => handleOpenForm()} disabled={!selectedYearId || usedValues.size >= 12} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Icon d={IC.plus} /> নতুন মাস
            </button>
          </div>
        </div>

        {formOpen && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_auto] items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">ক্রম</label>
                <select
                  value={monthValue}
                  onChange={(e) => setMonthValue(Number(e.target.value))}
                  required
                  className="w-full h-10 px-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">--</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((v) => {
                    const taken = usedValues.has(v) && !(editMonthId && Number(months.find((m) => m.MonthID === editMonthId)?.MonthValue) === v);
                    return <option key={v} value={v} disabled={taken}>{toBengaliDigits(v)}{taken ? ' (আছে)' : ''}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">মাসের নাম</label>
                <input
                  type="text"
                  value={monthName}
                  onChange={(e) => setMonthName(e.target.value)}
                  required
                  placeholder="যেমন: জানুয়ারি, মুহাররম..."
                  className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">বাতিল</button>
                <button type="submit" disabled={isCreatingMonth || isUpdatingMonth} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {isCreatingMonth || isUpdatingMonth ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        )}

        {bulkOpen && (
          <div className="rounded-lg border-2 border-purple-300 bg-purple-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-bold text-purple-900">একসাথে ১২ মাস</h5>
                <p className="text-xs text-purple-700 mt-0.5">আগের মাসগুলো অটো ফিলাপ হয়েছে। শুধু নতুন/বদলানো নাম সেভ হবে।</p>
              </div>
              <span className="text-xs font-semibold text-purple-800 bg-purple-100 px-2 py-1 rounded-full">{toBengaliDigits(changedRows.length)} টি পরিবর্তন</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
              {bulkRows.map((row, idx) => (
                <div key={idx} className={`flex items-center gap-2 rounded-lg border p-2 ${row.id ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200'}`}>
                  <span className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${row.id ? 'bg-slate-200 text-slate-600' : 'bg-purple-100 text-purple-700'}`}>
                    {toBengaliDigits(idx + 1)}
                  </span>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => handleBulkRowChange(idx, e.target.value)}
                    disabled={bulkSaving}
                    placeholder={`মাস ${idx + 1} এর নাম`}
                    className="flex-1 h-9 px-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-60"
                  />
                </div>
              ))}
            </div>

            {bulkSaving && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-800 font-medium">সেভ হচ্ছে... {toBengaliDigits(bulkProgress.done)} / {toBengaliDigits(bulkProgress.total)}</span>
                  <span className="text-purple-700 font-bold">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 transition-all duration-200" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button type="button" onClick={() => { setBulkOpen(false); setBulkRows([]); }} disabled={bulkSaving} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">বাতিল</button>
              <button type="button" onClick={handleBulkSave} disabled={bulkSaving || changedRows.length === 0} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon d={IC.check} /> {bulkSaving ? 'সেভ হচ্ছে...' : `${toBengaliDigits(changedRows.length)} টি সেভ করুন`}
              </button>
            </div>
          </div>
        )}

        {!selectedYearId ? (
          <div className="text-center py-8 text-amber-600 bg-amber-50 rounded-lg text-sm">আগে বছর সিলেক্ট করুন</div>
        ) : months.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <p className="text-sm">কোনো মাস নেই। নতুন মাস তৈরি করুন।</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold text-xs">ক্রম</th>
                  <th className="py-2.5 px-4 font-semibold text-xs">মাসের নাম</th>
                  <th className="py-2.5 px-4 font-semibold text-xs">স্টেটাস</th>
                  <th className="py-2.5 px-4 font-semibold text-xs text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {months.map((m) => {
                  const selected = Number(selectedMonthId) === Number(m.MonthID);
                  return (
                    <tr key={m.MonthID} className={`hover:bg-slate-50/80 transition-colors ${selected ? 'bg-indigo-50/40' : ''}`}>
                      <td className="py-2.5 px-4 text-xs font-medium text-slate-500">{toBengaliDigits(m.MonthValue)}</td>
                      <td className="py-2.5 px-4">
                        <button onClick={() => onSelectMonth(Number(m.MonthID))} className="text-sm font-bold text-slate-800 hover:text-indigo-700" title="এই মাস সিলেক্ট করুন">{m.MonthName}</button>
                        {selected && <span className="ml-2 text-[10px] font-medium text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">সিলেক্টেড</span>}
                      </td>
                      <td className="py-2.5 px-4"><StatusPill active={m.IsActive} /></td>
                      <td className="py-2.5 px-4"><RowActions onEdit={() => handleOpenForm(m)} onToggle={() => handleToggleStatus(m)} active={m.IsActive} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};
