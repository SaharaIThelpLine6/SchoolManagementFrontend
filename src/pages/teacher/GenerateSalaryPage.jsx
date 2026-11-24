import React, { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { DataTable } from './DataTable';
import { MoneyInput } from './MoneyInput';
import { MonthSelect } from './MonthSelect';
import { StatusBadge } from './StatusBadge';
import { YearSelect } from './YearSelect';
import { LABELS } from '../../helper/labels';
import { formatMoney, getMonthNameBn, toBengaliDigits } from '../../utils/format';
import {
  useGetTeachersQuery,
  useGetHeadsQuery,
  useGetSheetsQuery,
  useGenerateSheetsMutation,
  useUpdateSheetMutation,
  useFinalizeSheetMutation,
  useFinalizeSheetsForMonthMutation,
  useRevertSheetMutation,
} from '../../features/teachers/teachersSlice';

// ─── Mappers: backend → frontend shape ─────────────────────────────
const mapTeacher = (t) => ({
  userId: t.userId ?? t.UserID,
  userCode: t.userCode ?? t.UserCode ?? '',
  name: t.name ?? t.UserName ?? '',
  designation: (t.designation ?? t.Designation ?? '').trim(),
});

const mapHead = (h) => ({
  headId: h.HeadID,
  headName: h.HeadName,
  headType: h.HeadType,
  sortOrder: h.SortOrder,
  isActive: Boolean(h.IsActive),
});

const mapDetail = (d) => ({
  headId: d.HeadID ?? d.headId,
  headName: d.HeadName ?? d.headName ?? '',
  headType: d.HeadType ?? d.headType ?? '',
  amount: Number(d.Amount ?? d.amount ?? 0) || 0,
});

const mapSheet = (s) => ({
  sheetId: s.SheetID ?? s.sheetId,
  userId: s.UserID ?? s.userId,
  year: Number(s.SalaryYear ?? s.year),
  month: Number(s.SalaryMonth ?? s.month),
  status: s.Status ?? s.status,
  netAmount: Number(s.NetAmount ?? s.netAmount ?? 0) || 0,
  grossAmount: Number(s.GrossAmount ?? s.grossAmount ?? 0) || 0,
  deductionAmount: Number(s.DeductionAmount ?? s.deductionAmount ?? 0) || 0,
  details: (s.Details ?? s.details ?? []).map(mapDetail),
});

// ─── Local totals ─────────────────────────────────────────────────
const calcSheetTotals = (details) => {
  let gross = 0;
  let deduction = 0;
  for (const d of details) {
    if (d.headType === 'EARNING') gross += Number(d.amount) || 0;
    else deduction += Number(d.amount) || 0;
  }
  return { gross, deduction, netAmount: Math.max(0, gross - deduction) };
};

// ─── Component ────────────────────────────────────────────────────
export const GenerateSalaryPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [finalizeAllConfirmOpen, setFinalizeAllConfirmOpen] = useState(false);

  // Local editable amounts per sheetId -> { headId: number }
  const [editedMap, setEditedMap] = useState({});
  const [toast, setToast] = useState(null);
  const addToast = (kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 2500);
  };

  // ─── Queries ──────────────────────────────────────────────────
  const { data: teachersRes, isLoading: teachersLoading } = useGetTeachersQuery();
  const { data: headsRes, isLoading: headsLoading } = useGetHeadsQuery();
  const {
    data: sheetsRes,
    isLoading: sheetsLoading,
    isFetching: sheetsFetching,
  } = useGetSheetsQuery({ Year: year, Month: month });

  // ─── Mutations ────────────────────────────────────────────────
  const [generateSheets, { isLoading: isGenerating }] = useGenerateSheetsMutation();
  const [updateSheet, { isLoading: isSavingRow }] = useUpdateSheetMutation();
  const [finalizeSheet, { isLoading: isFinalizingRow }] = useFinalizeSheetMutation();
  const [finalizeSheetsForMonth, { isLoading: isFinalizingAll }] =
    useFinalizeSheetsForMonthMutation();
  const [revertSheet, { isLoading: isRevertingRow }] = useRevertSheetMutation();

  const isLoading = teachersLoading || headsLoading || sheetsLoading || sheetsFetching;
  const isBusy =
    isGenerating || isSavingRow || isFinalizingRow || isFinalizingAll || isRevertingRow;

  // ─── Normalized data ──────────────────────────────────────────
  const teachers = useMemo(
    () => (teachersRes?.data ?? []).map(mapTeacher),
    [teachersRes]
  );
  const heads = useMemo(() => (headsRes?.data ?? []).map(mapHead), [headsRes]);
  const allSheets = useMemo(
    () => (sheetsRes?.data ?? []).map(mapSheet),
    [sheetsRes]
  );

  const teacherMap = useMemo(
    () => new Map(teachers.map((t) => [Number(t.userId), t])),
    [teachers]
  );

  // Filter sheets for current year/month (backend already filters, but defensive)
  const monthSheets = useMemo(() => {
    const teacherIndex = new Map(teachers.map((t, i) => [Number(t.userId), i]));
    return allSheets
      .filter((s) => Number(s.year) === Number(year) && Number(s.month) === Number(month))
      .sort(
        (a, b) =>
          (teacherIndex.get(Number(a.userId)) ?? 99) -
          (teacherIndex.get(Number(b.userId)) ?? 99)
      );
  }, [allSheets, teachers, year, month]);

  // Reset pending edits when year/month changes
  useEffect(() => {
    setEditedMap({});
  }, [year, month]);

  // ─── Column headers: union of active heads + heads present in existing sheets
  const displayHeads = useMemo(() => {
    const headMap = new Map(heads.map((h) => [Number(h.headId), h]));
    const presentIds = new Set();
    for (const h of heads) {
      if (h.isActive) presentIds.add(Number(h.headId));
    }
    for (const s of monthSheets) {
      for (const d of s.details) presentIds.add(Number(d.headId));
    }

    return Array.from(presentIds)
      .map((id) => {
        const fromMaster = headMap.get(id);
        if (fromMaster) return fromMaster;
        for (const s of monthSheets) {
          const d = s.details.find((x) => Number(x.headId) === id);
          if (d) {
            return {
              headId: d.headId,
              headName: d.headName,
              headType: d.headType,
              sortOrder: 99,
              isActive: true,
            };
          }
        }
        return null;
      })
      .filter((x) => x !== null)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [heads, monthSheets]);

  const draftCount = useMemo(
    () => monthSheets.filter((s) => s.status === 'DRAFT').length,
    [monthSheets]
  );

  // ─── Cell helpers ─────────────────────────────────────────────
  const getCellValue = (sheet, headId) => {
    const rowEdits = editedMap[sheet.sheetId];
    if (rowEdits && rowEdits[headId] !== undefined) {
      return rowEdits[headId];
    }
    const detail = sheet.details.find((d) => Number(d.headId) === Number(headId));
    return detail ? detail.amount : 0;
  };

  const buildRowDetails = (sheet) => {
    return displayHeads.map((h) => ({
      headId: h.headId,
      headName: h.headName,
      headType: h.headType,
      amount: getCellValue(sheet, h.headId),
    }));
  };

  // Backend shape for PUT /sheets/:id
  const buildDetailsPayload = (sheet) => {
    return displayHeads.map((h) => ({
      HeadID: Number(h.headId),
      Amount: Number(getCellValue(sheet, h.headId)) || 0,
    }));
  };

  const handleCellChange = (sheetId, headId, val) => {
    const numeric = val === '' ? 0 : val;
    setEditedMap((prev) => ({
      ...prev,
      [sheetId]: {
        ...(prev[sheetId] ?? {}),
        [headId]: numeric,
      },
    }));
  };

  // ─── Actions ──────────────────────────────────────────────────
  const handleGenerate = async () => {
    try {
      const res = await generateSheets({ Year: year, Month: month }).unwrap();
      const createdCount = Number(res?.createdCount ?? 0);
      const existingCount = Number(res?.existingCount ?? 0);
      if (createdCount === 0) {
        addToast(
          'info',
          LABELS.generatePage.toastAllExisted.replace(
            '{existing}',
            toBengaliDigits(existingCount)
          )
        );
      } else {
        addToast(
          'success',
          LABELS.generatePage.toastGenerated
            .replace('{created}', toBengaliDigits(createdCount))
            .replace('{existing}', toBengaliDigits(existingCount))
        );
      }
    } catch (err) {
      addToast('error', err?.data?.error ?? '');
    }
  };

  const handleSaveRow = async (sheet) => {
    const teacherName = teacherMap.get(Number(sheet.userId))?.name ?? '';
    try {
      await updateSheet({
        sheetId: sheet.sheetId,
        Details: buildDetailsPayload(sheet),
      }).unwrap();
      setEditedMap((prev) => {
        const next = { ...prev };
        delete next[sheet.sheetId];
        return next;
      });
      addToast('success', LABELS.generatePage.toastRowSaved.replace('{name}', teacherName));
      return true;
    } catch (err) {
      addToast('error', err?.data?.error ?? '');
      return false;
    }
  };

  const handleFinalizeRow = async (sheet) => {
    const teacherName = teacherMap.get(Number(sheet.userId))?.name ?? '';
    try {
      // Save pending edits first
      if (editedMap[sheet.sheetId]) {
        await updateSheet({
          sheetId: sheet.sheetId,
          Details: buildDetailsPayload(sheet),
        }).unwrap();
        setEditedMap((prev) => {
          const next = { ...prev };
          delete next[sheet.sheetId];
          return next;
        });
      }
      await finalizeSheet(sheet.sheetId).unwrap();
      addToast(
        'success',
        LABELS.generatePage.toastRowFinalized.replace('{name}', teacherName)
      );
    } catch (err) {
      addToast('error', err?.data?.error ?? '');
    }
  };

  const handleRevertRow = async (sheet) => {
    const teacherName = teacherMap.get(Number(sheet.userId))?.name ?? '';
    try {
      await revertSheet(sheet.sheetId).unwrap();
      addToast(
        'info',
        LABELS.generatePage.toastRowReverted.replace('{name}', teacherName)
      );
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
      // First save any pending edits on drafts
      for (const s of monthSheets) {
        if (s.status === 'DRAFT' && editedMap[s.sheetId]) {
          await updateSheet({
            sheetId: s.sheetId,
            Details: buildDetailsPayload(s),
          }).unwrap();
        }
      }
      setEditedMap({});

      const res = await finalizeSheetsForMonth({ Year: year, Month: month }).unwrap();
      const finalized = Number(res?.count ?? 0);
      addToast(
        'success',
        LABELS.generatePage.toastAllFinalized.replace('{count}', toBengaliDigits(finalized))
      );
    } catch (err) {
      addToast('error', err?.data?.error ?? '');
    } finally {
      setFinalizeAllConfirmOpen(false);
    }
  };

  // ─── Column totals ────────────────────────────────────────────
  const columnTotals = useMemo(() => {
    const headSums = {};
    for (const h of displayHeads) headSums[h.headId] = 0;
    let grandNet = 0;

    for (const sheet of monthSheets) {
      const details = displayHeads.map((h) => {
        const rowEdits = editedMap[sheet.sheetId];
        const amt =
          rowEdits && rowEdits[h.headId] !== undefined
            ? rowEdits[h.headId]
            : sheet.details.find((d) => Number(d.headId) === Number(h.headId))?.amount ?? 0;
        headSums[h.headId] = (headSums[h.headId] ?? 0) + amt;
        return {
          headId: h.headId,
          headName: h.headName,
          headType: h.headType,
          amount: amt,
        };
      });
      grandNet += calcSheetTotals(details).netAmount;
    }
    return { headSums, grandNet };
  }, [displayHeads, monthSheets, editedMap]);

  return (
    <div className="space-y-5">
      {/* ================================================ গ্রেডিয়েন্ট হেডার */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-5 py-4 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M12 18v-6" />
                  <path d="M9 15h6" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight sm:text-[20px]">
                  {LABELS.nav.generate}
                </h3>
                <p className="text-xs text-white/80 sm:text-sm">
                  {LABELS.generatePage.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
              <span className="text-[13px] font-medium">
                {LABELS.headsPage.activeCountLabel}
              </span>
              <span className="text-[17px] font-bold leading-none">
                {toBengaliDigits(draftCount)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white/95 px-3 py-2.5 text-slate-800 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="gen-year" className="text-sm font-medium text-slate-700">
                  {LABELS.common.year}:
                </label>
                <YearSelect id="gen-year" value={year} onChange={setYear} />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="gen-month" className="text-sm font-medium text-slate-700">
                  {LABELS.common.month}:
                </label>
                <MonthSelect id="gen-month" value={month} onChange={setMonth} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isBusy}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-indigo-700 bg-white rounded-lg shadow hover:bg-indigo-50 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
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
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M12 18v-6" />
                  <path d="M9 15h6" />
                </svg>
                <span>{isGenerating ? '...' : LABELS.generatePage.generateBtn}</span>
              </button>

              <button
                type="button"
                disabled={draftCount === 0 || isBusy}
                onClick={() => setFinalizeAllConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
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
                  className="text-indigo-600"
                >
                  <path d="M18 6 7 17l-5-5" />
                  <path d="m22 10-7.5 7.5L13 16" />
                </svg>
                <span>{LABELS.generatePage.finalizeAllBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editable Sheet Table */}
      <DataTable
        isLoading={isLoading}
        isEmpty={monthSheets.length === 0}
        emptyTitle={LABELS.generatePage.emptyTitle}
        emptyDescription={LABELS.generatePage.emptyDesc}
        emptyAction={
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isBusy}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
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
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M12 18v-6" />
              <path d="M9 15h6" />
            </svg>
            <span>{LABELS.generatePage.generateBtn}</span>
          </button>
        }
        skeletonCols={7}
      >
        <table className="w-full text-sm text-left border-collapse min-w-[960px]">
          <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="sticky left-0 z-30 bg-slate-50 py-3 px-4 font-semibold border-r border-slate-200 min-w-[190px]">
                {LABELS.common.teacher}
              </th>
              <th className="py-3 px-3 font-semibold whitespace-nowrap min-w-[120px]">
                {LABELS.common.designation}
              </th>
              {displayHeads.map((h) => (
                <th
                  key={h.headId}
                  className={`py-3 px-3 font-semibold text-right whitespace-nowrap min-w-[130px] ${h.headType === 'EARNING'
                      ? 'text-emerald-700 bg-emerald-50/40'
                      : 'text-red-700 bg-red-50/40'
                    }`}
                >
                  {h.headName}
                </th>
              ))}
              <th className="py-3 px-4 font-semibold text-right whitespace-nowrap min-w-[120px] bg-slate-100/70">
                {LABELS.generatePage.colNet}
              </th>
              <th className="py-3 px-3 font-semibold text-center whitespace-nowrap min-w-[100px]">
                {LABELS.common.status}
              </th>
              <th className="py-3 px-4 font-semibold text-right whitespace-nowrap min-w-[200px]">
                {LABELS.common.actions}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {monthSheets.map((sheet) => {
              const teacher = teacherMap.get(Number(sheet.userId));
              const isFinal = sheet.status === 'FINAL';
              const isRowEdited = Boolean(editedMap[sheet.sheetId]);
              const liveDetails = buildRowDetails(sheet);
              const liveNet = calcSheetTotals(liveDetails).netAmount;

              return (
                <tr
                  key={sheet.sheetId}
                  className={`hover:bg-slate-50/80 transition-colors ${isFinal ? 'bg-slate-50/30' : 'bg-white'
                    }`}
                >
                  <td className="sticky left-0 z-10 bg-white py-2.5 px-4 border-r border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {teacher?.name ?? sheet.userId}
                        </p>
                        <p className="text-xs text-slate-500">{teacher?.userCode}</p>
                      </div>
                      {isRowEdited && (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                          {LABELS.generatePage.unsavedRowHint}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-nowrap">
                    {teacher?.designation ?? '—'}
                  </td>

                  {displayHeads.map((h) => {
                    const cellVal = getCellValue(sheet, h.headId);
                    return (
                      <td key={h.headId} className="py-2 px-2.5">
                        <MoneyInput
                          compact
                          disabled={isFinal}
                          value={cellVal}
                          onChange={(val) =>
                            handleCellChange(sheet.sheetId, h.headId, val)
                          }
                          ariaLabel={`${teacher?.name} - ${h.headName}`}
                        />
                      </td>
                    );
                  })}

                  <td className="py-2.5 px-4 text-right font-mono-num font-bold text-slate-900 bg-slate-50/60 whitespace-nowrap">
                    {formatMoney(liveNet)}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge variant={{ kind: 'sheet', status: sheet.status }} />
                  </td>

                  <td className="py-2.5 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {!isFinal ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveRow(sheet)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 whitespace-nowrap shrink-0 disabled:opacity-50"
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
                              <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                              <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                              <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                            </svg>
                            <span>{LABELS.generatePage.saveRow}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFinalizeRow(sheet)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 whitespace-nowrap shrink-0 disabled:opacity-50"
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
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            <span>{LABELS.generatePage.finalizeRow}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevertRow(sheet)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 whitespace-nowrap shrink-0 disabled:opacity-50"
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
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                          <span>{LABELS.generatePage.revertRow}</span>
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
                {LABELS.generatePage.totalRowLabel} (
                {toBengaliDigits(monthSheets.length)} জন)
              </td>
              <td className="py-3 px-3" />
              {displayHeads.map((h) => (
                <td
                  key={h.headId}
                  className="py-3 px-3 text-right font-mono-num whitespace-nowrap"
                >
                  {formatMoney(columnTotals.headSums[h.headId] ?? 0)}
                </td>
              ))}
              <td className="py-3 px-4 text-right font-mono-num font-bold text-teal-800 bg-teal-50/70 whitespace-nowrap">
                {formatMoney(columnTotals.grandNet)}
              </td>
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
          .replace('{month}', getMonthNameBn(month))
          .replace('{year}', String(year))
          .replace('{count}', toBengaliDigits(draftCount))}
        variant="primary"
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