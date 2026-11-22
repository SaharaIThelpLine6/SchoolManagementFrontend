import React, { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { Modal } from './Modal';
import { MoneyInput } from './MoneyInput';
import { SummaryCard } from './SummaryCard';
import { LABELS } from '../../helper/labels';
import { formatMoney, toBengaliDigits } from '../../utils/format';
import {
  useGetTeachersQuery,
  useGetHeadsQuery,
  useGetStructuresQuery,
  useSaveTeacherStructureMutation,
  useApplyStructureBulkMutation,
  useGetDesignationQuery,
} from '../../features/teachers/teachersSlice';

// ─── Mappers: backend → frontend shape ─────────────────────────────
const mapTeacher = (t) => ({
  userId: t.userId ?? t.UserID,
  userCode: t.userCode ?? t.UserCode ?? '',
  name: t.name ?? t.UserName ?? '',
  designation: (t.designation ?? t.Designation ?? '').trim(),
  mobile: t.mobile ?? t.Mobile ?? '',
});

const mapHead = (h) => ({
  headId: h.HeadID,
  headName: h.HeadName,
  headType: h.HeadType,
  sortOrder: h.SortOrder,
  isActive: Boolean(h.IsActive),
});

const mapStructure = (s) => ({
  structureId: s.StructureID,
  userId: s.UserID,
  headId: s.HeadID,
  amount: Number(s.Amount) || 0,
});

// designationData → [{ DNID, Designation, SL }] → sorted string[]
const mapDesignations = (arr) =>
  [...(arr ?? [])]
    .sort((a, b) => (a.SL ?? 0) - (b.SL ?? 0))
    .map((d) => (d.Designation ?? '').trim())
    .filter(Boolean);

const norm = (s) => (s ?? '').trim().toLowerCase();

export const SalaryStructurePage = () => {
  // ─── Queries ──────────────────────────────────────────────────
  const { data: teachersRes, isLoading: teachersLoading } = useGetTeachersQuery();
  const { data: designationData, isLoading: designationLoading } = useGetDesignationQuery();
  const { data: headsRes, isLoading: headsLoading } = useGetHeadsQuery();
  const {
    data: structuresRes,
    isLoading: structuresLoading,
    isFetching: structuresFetching,
  } = useGetStructuresQuery();

  // ─── Mutations ────────────────────────────────────────────────
  const [saveTeacherStructure, { isLoading: isSaving }] = useSaveTeacherStructureMutation();
  const [applyStructureBulk, { isLoading: isBulkSaving }] = useApplyStructureBulkMutation();

  const isLoading =
    teachersLoading ||
    headsLoading ||
    structuresLoading ||
    structuresFetching ||
    designationLoading;
  const isBusy = isSaving || isBulkSaving;

  const teachers = useMemo(
    () => (teachersRes?.data ?? []).map(mapTeacher),
    [teachersRes]
  );
  const heads = useMemo(() => (headsRes?.data ?? []).map(mapHead), [headsRes]);
  const structures = useMemo(
    () => (structuresRes?.data ?? []).map(mapStructure),
    [structuresRes]
  );

  // Dynamic designations: sorted, unique, trimmed
  const designations = useMemo(() => {
    const list = mapDesignations(designationData);
    return Array.from(new Set(list));
  }, [designationData]);

  // ─── Local UI state ───────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [designationFilter, setDesignationFilter] = useState('ALL');
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [draftAmounts, setDraftAmounts] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [pendingTeacherId, setPendingTeacherId] = useState(null);

  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copySourceId, setCopySourceId] = useState('');
  const [applyDesignationOpen, setApplyDesignationOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const addToast = (kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 2500);
  };

  // Auto-select first teacher once teachers load
  useEffect(() => {
    if (!selectedUserId && teachers.length > 0) {
      setSelectedUserId(teachers[0].userId);
    }
  }, [teachers, selectedUserId]);

  // Active heads only
  const activeHeads = useMemo(
    () => [...heads].filter((h) => h.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [heads]
  );

  const earningHeads = useMemo(
    () => activeHeads.filter((h) => h.headType === 'EARNING'),
    [activeHeads]
  );
  const deductionHeads = useMemo(
    () => activeHeads.filter((h) => h.headType === 'DEDUCTION'),
    [activeHeads]
  );

  // Load draft when selectedUserId or structures/activeHeads change
  useEffect(() => {
    if (!selectedUserId) return;
    const map = {};
    for (const h of activeHeads) {
      const found = structures.find(
        (s) =>
          Number(s.userId) === Number(selectedUserId) &&
          Number(s.headId) === Number(h.headId)
      );
      map[h.headId] = found && found.amount > 0 ? found.amount : '';
    }
    setDraftAmounts(map);
    setIsDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, activeHeads.length, structures.length]);

  // ─── Filtering ────────────────────────────────────────────────
  const filteredTeachers = useMemo(() => {
    const q = norm(search);
    return teachers.filter((t) => {
      if (designationFilter !== 'ALL' && norm(t.designation) !== norm(designationFilter)) {
        return false;
      }
      if (
        q &&
        !String(t.name).toLowerCase().includes(q) &&
        !String(t.userCode).toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [teachers, search, designationFilter]);

  const selectedTeacher = useMemo(
    () => teachers.find((t) => Number(t.userId) === Number(selectedUserId)) ?? null,
    [teachers, selectedUserId]
  );

  const liveTotals = useMemo(() => {
    let gross = 0;
    let deduction = 0;
    for (const h of activeHeads) {
      const val = Number(draftAmounts[h.headId]) || 0;
      if (h.headType === 'EARNING') gross += val;
      else deduction += val;
    }
    return { gross, deduction, net: Math.max(0, gross - deduction) };
  }, [activeHeads, draftAmounts]);

  const handleSelectTeacher = (userId) => {
    if (Number(userId) === Number(selectedUserId)) return;
    if (isDirty) {
      setPendingTeacherId(userId);
      return;
    }
    setSelectedUserId(userId);
  };

  const handleAmountChange = (headId, val) => {
    setDraftAmounts((prev) => ({ ...prev, [headId]: val }));
    setIsDirty(true);
  };

  // Backend shape: { "<HeadID>": number }
  const toAmountsPayload = () => {
    const out = {};
    for (const [k, v] of Object.entries(draftAmounts)) {
      const n = Number(v);
      if (n > 0) out[String(k)] = n;
    }
    return out;
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;
    try {
      await saveTeacherStructure({
        userId: selectedTeacher.userId,
        Amounts: toAmountsPayload(),
      }).unwrap();
      setIsDirty(false);
      addToast('success', LABELS.structurePage.toastSaved);
    } catch (err) {
      addToast('error', err?.data?.error ?? '');
    }
  };

  const handleOpenCopyModal = () => {
    const firstOther = teachers.find(
      (t) => Number(t.userId) !== Number(selectedUserId)
    );
    setCopySourceId(firstOther?.userId ?? '');
    setCopyModalOpen(true);
  };

  const handleConfirmCopy = () => {
    if (!copySourceId) return;
    const map = {};
    for (const h of activeHeads) {
      const found = structures.find(
        (s) =>
          Number(s.userId) === Number(copySourceId) &&
          Number(s.headId) === Number(h.headId)
      );
      map[h.headId] = found && found.amount > 0 ? found.amount : '';
    }
    setDraftAmounts(map);
    setIsDirty(true);
    setCopyModalOpen(false);
    addToast('info', LABELS.structurePage.toastCopied);
  };

  // Use dynamic designation string for exact matching
  const sameDesignationTeachers = useMemo(() => {
    if (!selectedTeacher) return [];
    const target = norm(selectedTeacher.designation);
    if (!target) return [];
    return teachers.filter((t) => norm(t.designation) === target);
  }, [selectedTeacher, teachers]);

  const handleConfirmApplyDesignation = async () => {
    if (!selectedTeacher || sameDesignationTeachers.length === 0) return;
    const UserIDs = sameDesignationTeachers.map((t) => Number(t.userId));
    try {
      await applyStructureBulk({
        UserIDs,
        Amounts: toAmountsPayload(),
      }).unwrap();
      setIsDirty(false);
      addToast(
        'success',
        LABELS.structurePage.toastAppliedDesignation
          .replace('{designation}', selectedTeacher.designation)
          .replace('{count}', toBengaliDigits(UserIDs.length))
      );
    } catch (err) {
      addToast('error', err?.data?.error ?? '');
    }
  };

  return (
    <div className="space-y-5">
      {/* ================================================ গ্রেডিয়েন্ট হেডার */}
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
                <line x1="21" x2="14" y1="4" y2="4" />
                <line x1="10" x2="3" y1="4" y2="4" />
                <line x1="21" x2="12" y1="12" y2="12" />
                <line x1="8" x2="3" y1="12" y2="12" />
                <line x1="21" x2="16" y1="20" y2="20" />
                <line x1="12" x2="3" y1="20" y2="20" />
                <line x1="14" x2="14" y1="2" y2="6" />
                <line x1="8" x2="8" y1="10" y2="14" />
                <line x1="16" x2="16" y1="18" y2="22" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight sm:text-[20px]">
                {LABELS.nav.structure}
              </h3>
              <p className="text-xs text-white/80 sm:text-sm">
                {LABELS.structurePage.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
              <span className="text-[13px] font-medium">
                {LABELS.structurePage.teacherListTitle}
              </span>
              <span className="text-[17px] font-bold leading-none">
                {teachers.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Teacher List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              {LABELS.structurePage.teacherListTitle}
            </h2>
            <div className="relative">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={LABELS.structurePage.searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-600"
              />
            </div>

            {/* Dynamic designation filter */}
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              aria-label={LABELS.common.designation}
              className="w-full h-9 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-600"
            >
              <option value="ALL">{LABELS.common.allDesignations}</option>
              {designations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                {LABELS.common.noTeacherFound}
              </div>
            ) : (
              filteredTeachers.map((teacher) => {
                const isSelected = Number(teacher.userId) === Number(selectedUserId);
                let rowTotals;
                if (isSelected) {
                  rowTotals = { netAmount: liveTotals.net };
                } else {
                  let gross = 0;
                  let ded = 0;
                  for (const h of activeHeads) {
                    const s = structures.find(
                      (x) =>
                        Number(x.userId) === Number(teacher.userId) &&
                        Number(x.headId) === Number(h.headId)
                    );
                    const amt = s?.amount ?? 0;
                    if (h.headType === 'EARNING') gross += amt;
                    else ded += amt;
                  }
                  rowTotals = { netAmount: Math.max(0, gross - ded) };
                }

                return (
                  <button
                    key={teacher.userId}
                    type="button"
                    onClick={() => handleSelectTeacher(teacher.userId)}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors ${isSelected
                      ? 'bg-teal-50/90 text-teal-950'
                      : 'hover:bg-slate-50 text-slate-900'
                      }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${isSelected ? 'text-teal-800' : 'text-slate-900'
                          }`}
                      >
                        {teacher.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {teacher.userCode} · {teacher.designation}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono-num font-semibold text-slate-800">
                        {formatMoney(rowTotals.netAmount)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {LABELS.structurePage.monthlyNetShort}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Editor */}
        <div className="lg:col-span-8 space-y-5">
          {!selectedTeacher ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <p className="text-base font-semibold text-slate-800">
                {LABELS.structurePage.noSelectionTitle}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {LABELS.structurePage.noSelectionDesc}
              </p>
            </div>
          ) : (
            <>
              {/* Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SummaryCard
                  label={LABELS.structurePage.totalEarning}
                  value={formatMoney(liveTotals.gross)}
                  tone="emerald"
                />
                <SummaryCard
                  label={LABELS.structurePage.totalDeduction}
                  value={formatMoney(liveTotals.deduction)}
                  tone="red"
                />
                <SummaryCard
                  label={LABELS.structurePage.netSalary}
                  value={formatMoney(liveTotals.net)}
                  tone="teal"
                />
              </div>

              {/* Editor Card */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base font-bold text-slate-900">
                        {selectedTeacher.name}
                      </h2>
                      {isDirty && (
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          {LABELS.structurePage.unsavedBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedTeacher.userCode} · {selectedTeacher.designation} ·{' '}
                      {selectedTeacher.mobile}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenCopyModal}
                      disabled={teachers.length < 2 || isBusy}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
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
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      <span>{LABELS.structurePage.copyButton}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplyDesignationOpen(true)}
                      disabled={isBusy || !selectedTeacher.designation}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
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
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{LABELS.structurePage.applyDesignationButton}</span>
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-6">
                  {/* Earnings */}
                  <div>
                    <h3 className="text-xs font-semibold text-emerald-700 mb-3">
                      {LABELS.structurePage.earningSection}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {earningHeads.map((head) => (
                        <div key={head.headId} className="space-y-1.5">
                          <label
                            htmlFor={`struct-${head.headId}`}
                            className="block text-sm font-medium text-slate-700"
                          >
                            {head.headName}
                          </label>
                          <MoneyInput
                            id={`struct-${head.headId}`}
                            value={draftAmounts[head.headId] ?? ''}
                            onChange={(val) => handleAmountChange(head.headId, val)}
                            placeholder={LABELS.structurePage.notApplicablePlaceholder}
                          />
                        </div>
                      ))}
                      {earningHeads.length === 0 && (
                        <p className="text-xs text-slate-500 col-span-full">
                          {LABELS.headsPage.emptyTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Deductions */}
                  {deductionHeads.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="text-xs font-semibold text-red-700 mb-3">
                        {LABELS.structurePage.deductionSection}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {deductionHeads.map((head) => (
                          <div key={head.headId} className="space-y-1.5">
                            <label
                              htmlFor={`struct-${head.headId}`}
                              className="block text-sm font-medium text-slate-700"
                            >
                              {head.headName}
                            </label>
                            <MoneyInput
                              id={`struct-${head.headId}`}
                              value={draftAmounts[head.headId] ?? ''}
                              onChange={(val) => handleAmountChange(head.headId, val)}
                              placeholder={LABELS.structurePage.notApplicablePlaceholder}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isDirty || isBusy}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                    </svg>
                    <span>{isSaving ? '...' : LABELS.common.save}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Copy Structure Modal */}
      <Modal
        isOpen={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        title={LABELS.structurePage.copyModalTitle}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCopyModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              {LABELS.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleConfirmCopy}
              disabled={!copySourceId || isBusy}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {LABELS.structurePage.copyApplyBtn}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label
            htmlFor="copy-source-select"
            className="block text-sm font-medium text-slate-700"
          >
            {LABELS.structurePage.copySourceLabel}
          </label>
          <select
            id="copy-source-select"
            value={copySourceId}
            onChange={(e) => setCopySourceId(e.target.value)}
            className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
          >
            {teachers
              .filter((t) => Number(t.userId) !== Number(selectedUserId))
              .map((t) => {
                let gross = 0;
                let ded = 0;
                for (const h of activeHeads) {
                  const s = structures.find(
                    (x) =>
                      Number(x.userId) === Number(t.userId) &&
                      Number(x.headId) === Number(h.headId)
                  );
                  const amt = s?.amount ?? 0;
                  if (h.headType === 'EARNING') gross += amt;
                  else ded += amt;
                }
                const net = Math.max(0, gross - ded);
                return (
                  <option key={t.userId} value={t.userId}>
                    {t.name} ({t.designation}) — {formatMoney(net)}
                  </option>
                );
              })}
          </select>
        </div>
      </Modal>

      {/* Apply to Designation Confirm */}
      <ConfirmDialog
        isOpen={applyDesignationOpen}
        onClose={() => setApplyDesignationOpen(false)}
        onConfirm={handleConfirmApplyDesignation}
        title={LABELS.structurePage.applyDesignationTitle}
        message={LABELS.structurePage.applyDesignationMessage
          .replace('{designation}', selectedTeacher?.designation ?? '')
          .replace('{count}', toBengaliDigits(sameDesignationTeachers.length))}
        variant="primary"
      />

      {/* Unsaved Changes Confirm */}
      <ConfirmDialog
        isOpen={Boolean(pendingTeacherId)}
        onClose={() => setPendingTeacherId(null)}
        onConfirm={() => {
          if (pendingTeacherId) {
            setSelectedUserId(pendingTeacherId);
          }
        }}
        title={LABELS.structurePage.unsavedTitle}
        message={LABELS.structurePage.unsavedMessage}
        confirmLabel={LABELS.common.discardAndSwitch}
        cancelLabel={LABELS.common.stayHere}
        variant="warning"
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