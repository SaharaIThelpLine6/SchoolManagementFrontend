import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';
import { LABELS } from '../../helper/labels';
import { toBengaliDigits } from '../../utils/format';
import { ConfirmDialog } from './ConfirmDialog';
import { DataTable } from './DataTable';
import {
  useGetHeadsQuery,
  useCreateHeadMutation,
  useUpdateHeadMutation,
  useToggleHeadActiveMutation,
} from '../../features/teachers/teachersSlice';
import {
  useGetGeneralLedgersByFundQuery,
  useGetFundNamesQuery,
  useGetSubLedgerQuery,
} from '../../features/feeCollection/feeCollectionSlice';

/* ------------------------------------------------------------------ */
/*  Backend row → frontend shape                                      */
/* ------------------------------------------------------------------ */
const mapHead = (h) => ({
  headId: h.HeadID,
  headName: h.HeadName,
  headType: h.HeadType,
  sortOrder: h.SortOrder,
  isActive: Boolean(h.IsActive),
  slId: h.SLID ?? null,
  fundId: h.SubsidiaryLedger?.FundID ?? null,
  glId: h.SubsidiaryLedger?.GLID ?? null,
  slName: h.SubsidiaryLedger?.SlName ?? null,
  fundName: h.SubsidiaryLedger?.Fund?.FundName ?? null,
  glName: h.SubsidiaryLedger?.GeneralLedger?.GlName ?? null,
});

/* ------------------------------------------------------------------ */
/*  Sortable row                                                      */
/* ------------------------------------------------------------------ */
const SortableHeadRow = ({ head, isToggling, onToggle, onEdit, LABELS }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: head.headId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging ? '#f8fafc' : undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-slate-50/80 transition-colors ${!head.isActive ? 'opacity-65 bg-slate-50/40' : ''
        }`}
    >
      {/* Drag handle */}
      <td className="py-3 px-2 w-10">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-1 rounded"
          aria-label="Drag to reorder"
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
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </button>
      </td>

      {/* Sort order */}
      <td className="py-3 px-4 font-mono-num text-slate-600">{head.sortOrder}</td>

      {/* Head name */}
      <td className="py-3 px-4 font-medium text-slate-900">{head.headName}</td>

      {/* Fund */}
      <td className="py-3 px-4 text-slate-700">
        {head.fundName ?? <span className="text-slate-400">—</span>}
      </td>

      {/* General Ledger */}
      <td className="py-3 px-4 text-slate-700">
        {head.glName ?? <span className="text-slate-400">—</span>}
      </td>

      {/* Sub Ledger */}
      <td className="py-3 px-4 text-slate-700">
        {head.slName ?? <span className="text-slate-400">—</span>}
      </td>

      {/* Type */}
      <td className="py-3 px-4">
        <StatusBadge variant={{ kind: 'head', type: head.headType }} />
      </td>

      {/* Status toggle */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={head.isActive}
            aria-label={`${head.headName} ${LABELS.headsPage.colStatus}`}
            onClick={() => onToggle(head)}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-60 ${head.isActive ? 'bg-teal-600' : 'bg-slate-300'
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${head.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
          </button>
          <span className="text-xs text-slate-600">
            {head.isActive ? LABELS.headsPage.activeLabel : LABELS.headsPage.inactiveLabel}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <button
          type="button"
          onClick={() => onEdit(head)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0"
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
          </svg>
          <span>{LABELS.common.edit}</span>
        </button>
      </td>
    </tr>
  );
};

/* ------------------------------------------------------------------ */
/*  Main page                                                         */
/* ------------------------------------------------------------------ */
export const SalaryHeadsPage = () => {
  /* ---------- Queries ---------- */
  const {
    data: res,
    isLoading: isLoadingHeads,
    isFetching,
    refetch,
  } = useGetHeadsQuery();
  const { data: fundNamesData } = useGetFundNamesQuery();

  /* ---------- Mutations ---------- */
  const [createHead, { isLoading: isCreating }] = useCreateHeadMutation();
  const [updateHead, { isLoading: isUpdating }] = useUpdateHeadMutation();
  const [toggleHeadActive, { isLoading: isToggling }] =
    useToggleHeadActiveMutation();

  /* ---------- Normalized data ---------- */
  const rawHeads = useMemo(
    () => res?.data ?? (Array.isArray(res) ? res : []),
    [res]
  );
  const heads = useMemo(() => rawHeads.map(mapHead), [rawHeads]);

  const isLoading = isLoadingHeads || isFetching;
  const isSaving = isCreating || isUpdating || isToggling;

  /* ---------- Local UI state ---------- */
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHead, setEditingHead] = useState(null);
  const [headName, setHeadName] = useState('');
  const [headType, setHeadType] = useState('EARNING');
  const [sortOrder, setSortOrder] = useState(1);
  const [formError, setFormError] = useState('');

  const [selectedFundID, setSelectedFundID] = useState('');
  const [selectedGLID, setSelectedGLID] = useState('');
  const [selectedSLID, setSelectedSLID] = useState('');

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [toast, setToast] = useState(null);

  /* ---------- Fund / GL / SL dropdown data ---------- */
  const { data: generalLedgersData } = useGetGeneralLedgersByFundQuery(
    { fundId: selectedFundID },
    { skip: !selectedFundID }
  );

  const { data: gSLData } = useGetSubLedgerQuery(selectedGLID, {
    skip: !selectedGLID,
  });

  /* ---------- Toast helper ---------- */
  const addToast = useCallback((kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  /* ---------- Filtering ---------- */
  const activeCount = useMemo(
    () => heads.filter((h) => h.isActive).length,
    [heads]
  );

  const filteredHeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...heads]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((h) => {
        if (typeFilter !== 'ALL' && h.headType !== typeFilter) return false;
        if (q && !h.headName.toLowerCase().includes(q)) return false;
        return true;
      });
  }, [heads, search, typeFilter]);

  /* ---------- Local ordered list for drag & drop ---------- */
  const [orderedHeads, setOrderedHeads] = useState([]);

  useEffect(() => {
    setOrderedHeads(filteredHeads.map((h) => ({ ...h })));
  }, [filteredHeads]);

  /* ---------- Drag sensors ---------- */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // small drag threshold
    })
  );

  /* ---------- Drag end handler ---------- */
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedHeads.findIndex((h) => h.headId === active.id);
    const newIndex = orderedHeads.findIndex((h) => h.headId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const moved = arrayMove(orderedHeads, oldIndex, newIndex);
    const withOrder = moved.map((h, i) => ({ ...h, sortOrder: i + 1 }));

    // Optimistic update
    const prev = orderedHeads;
    setOrderedHeads(withOrder);

    try {
      // যেগুলোর sortOrder আসলে বদলেছে শুধু সেগুলো আপডেট
      const changed = withOrder.filter((h) => {
        const before = prev.find((p) => p.headId === h.headId);
        return !before || before.sortOrder !== h.sortOrder;
      });

      await Promise.all(
        changed.map((h) =>
          updateHead({
            headId: h.headId,
            HeadName: h.headName,
            HeadType: h.headType,
            SortOrder: h.sortOrder,
            SLID: h.slId,
          }).unwrap()
        )
      );

      addToast('success', 'ক্রম সফলভাবে আপডেট হয়েছে');
      refetch();
    } catch (err) {
      addToast('error', err?.data?.error ?? 'ক্রম আপডেট ব্যর্থ হয়েছে');
      refetch(); // rollback
    }
  };

  /* ---------- Modal open handlers ---------- */
  const openAddModal = () => {
    setEditingHead(null);
    setHeadName('');
    setHeadType('EARNING');
    const maxOrder = heads.reduce((m, h) => Math.max(m, h.sortOrder), 0);
    setSortOrder(maxOrder + 1);
    setFormError('');

    // ✅ New create modal → empty
    setSelectedFundID('');
    setSelectedGLID('');
    setSelectedSLID('');

    setModalOpen(true);
  };

  const openEditModal = (head) => {
    setEditingHead(head);
    setHeadName(head.headName);
    setHeadType(head.headType);
    setSortOrder(head.sortOrder);
    setFormError('');

    // ✅ Existing IDs populate
    setSelectedFundID(head.fundId ? String(head.fundId) : '');
    setSelectedGLID(head.glId ? String(head.glId) : '');
    setSelectedSLID(head.slId ? String(head.slId) : '');

    setModalOpen(true);
  };

  /* ---------- Save handler ---------- */
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!headName.trim()) {
      setFormError(LABELS.headsPage.errorNameRequired);
      return;
    }
    if (!Number.isFinite(sortOrder) || sortOrder < 1) {
      setFormError(LABELS.headsPage.errorOrderInvalid);
      return;
    }
    if (!selectedSLID) {
      setFormError('অনুগ্রহ করে সাব-লেজার (Sub-Ledger) সিলেক্ট করুন');
      return;
    }

    const payload = {
      HeadName: headName.trim(),
      HeadType: headType,
      SortOrder: sortOrder,
      SLID: Number(selectedSLID),
    };

    try {
      if (editingHead) {
        await updateHead({ headId: editingHead.headId, ...payload }).unwrap();
        addToast('success', LABELS.headsPage.toastUpdated);
      } else {
        await createHead(payload).unwrap();
        addToast('success', LABELS.headsPage.toastAdded);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err?.data?.error ?? 'কিছু ভুল হয়েছে, আবার চেষ্টা করুন');
    }
  };

  /* ---------- Toggle / deactivate ---------- */
  const handleToggleClick = (head) => {
    if (head.isActive) {
      setDeactivateTarget(head);
    } else {
      toggleHeadActive(head.headId)
        .unwrap()
        .then(() => addToast('success', LABELS.headsPage.toastActivated))
        .catch((err) => addToast('error', err?.data?.error ?? ''));
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await toggleHeadActive(deactivateTarget.headId).unwrap();
      addToast('info', LABELS.headsPage.toastDeactivated);
    } catch (err) {
      addToast('error', err?.data?.error ?? '');
    }
    setDeactivateTarget(null);
  };

  /* ---------- Render ---------- */
  return (
    <div className="space-y-5">
      {/* ========== Gradient header ========== */}
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
                <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight sm:text-[20px]">
                {LABELS.headsPage.colName}
              </h3>
              <p className="text-xs text-white/80 sm:text-sm">
                {LABELS.headsPage.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
              <span className="text-[13px] font-medium">
                {LABELS.headsPage.activeCountLabel}
              </span>
              <span className="text-[17px] font-bold leading-none">
                {toBengaliDigits(activeCount)}
              </span>
              <span className="text-[13px] font-medium text-white/70">/</span>
              <span className="text-[13px] font-medium text-white/80">
                {toBengaliDigits(heads.length)}
              </span>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              disabled={isSaving}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              <span>{LABELS.headsPage.addButton}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========== Table ========== */}
      <DataTable
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={LABELS.headsPage.searchPlaceholder}
        isLoading={isLoading}
        isEmpty={orderedHeads.length === 0}
        emptyTitle={LABELS.headsPage.emptyTitle}
        emptyDescription={LABELS.headsPage.emptyDesc}
        skeletonCols={9}
        toolbarRight={
          <div
            className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-slate-100 rounded-lg max-w-full overflow-x-auto"
            role="group"
            aria-label={LABELS.headsPage.colType}
          >
            {['ALL', 'EARNING', 'DEDUCTION'].map((t) => {
              const active = typeFilter === t;
              const label =
                t === 'ALL' ? LABELS.headsPage.filterAll : LABELS.headTypes[t];

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        }
      >
        <table className="w-full text-[11px] sm:text-sm text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="py-2 sm:py-3 px-1.5 sm:px-2 w-8 sm:w-10"></th>

              <th className="py-2 sm:py-3 px-1.5 sm:px-4 font-semibold w-10 sm:w-16 whitespace-nowrap">
                {LABELS.headsPage.colOrder}
              </th>

              <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[100px] sm:min-w-[140px]">
                {LABELS.headsPage.colName}
              </th>

              <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[90px] sm:min-w-[140px]">
                ফান্ড
              </th>

              <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[100px] sm:min-w-[140px]">
                জেনারেল লেজার
              </th>

              <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold min-w-[100px] sm:min-w-[140px]">
                সাব-লেজার
              </th>

              <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold w-20 sm:w-28 whitespace-nowrap">
                {LABELS.headsPage.colType}
              </th>

              <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold w-24 sm:w-36 whitespace-nowrap">
                {LABELS.headsPage.colStatus}
              </th>

              <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-right w-20 sm:w-28 whitespace-nowrap">
                {LABELS.common.actions}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedHeads.map((h) => h.headId)}
                strategy={verticalListSortingStrategy}
              >
                {orderedHeads.map((head) => (
                  <SortableHeadRow
                    key={head.headId}
                    head={head}
                    isToggling={isToggling}
                    onToggle={handleToggleClick}
                    onEdit={openEditModal}
                    LABELS={LABELS}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </DataTable>

      {/* ========== Add / Edit Modal ========== */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingHead
            ? LABELS.headsPage.modalEditTitle
            : LABELS.headsPage.modalAddTitle
        }
        size="3xl"                 // ← was "xl"
        footer={
          <div className="flex w-full items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              {LABELS.common.cancel}
            </button>
            <button
              type="submit"
              form="head-form"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
            >
              {isSaving ? '...' : LABELS.common.save}
            </button>
          </div>
        }
      >
        <form id="head-form" onSubmit={handleSaveModal} className="space-y-4">
          {formError && (
            <div className="px-3.5 py-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {formError}
            </div>
          )}

          {/* ===== Fund / GL / SL selects ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Fund */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                ফান্ড<span className="text-red-500">*</span>
              </label>
              <select
                value={selectedFundID}
                onChange={(e) => {
                  setSelectedFundID(e.target.value);
                  setSelectedGLID('');
                  setSelectedSLID('');
                }}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
              >
                <option value="">-- ফান্ড সিলেক্ট করুন --</option>
                {fundNamesData?.map((fund) => (
                  <option key={fund.FundID} value={fund.FundID}>
                    {fund.FundName}
                  </option>
                ))}
              </select>
            </div>

            {/* General Ledger */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                জেনারেল লেজার<span className="text-red-500">*</span>
              </label>
              <select
                value={selectedGLID}
                onChange={(e) => {
                  setSelectedGLID(e.target.value);
                  setSelectedSLID('');
                }}
                disabled={!selectedFundID}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="">-- জেনারেল লেজার সিলেক্ট করুন --</option>
                {generalLedgersData?.map((gl) => (
                  <option key={gl.GLID} value={gl.GLID}>
                    {gl.GlName}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Ledger */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                সাব-লেজার<span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSLID}
                onChange={(e) => setSelectedSLID(e.target.value)}
                disabled={!selectedGLID}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="">-- সাব-লেজার সিলেক্ট করুন --</option>
                {gSLData?.map((sl) => (
                  <option key={sl.SLID} value={sl.SLID}>
                    {sl.SlName}
                  </option>
                ))}
              </select>
            </div>
            {/* Head name */}
            <div>
              <label
                htmlFor="head-name-input"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                {LABELS.headsPage.fieldName}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="head-name-input"
                type="text"
                value={headName}
                onChange={(e) => {
                  setHeadName(e.target.value);
                  if (formError) setFormError('');
                }}
                placeholder={LABELS.headsPage.fieldNamePlaceholder}
                autoFocus
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
              />
            </div>
          </div>


          {/* Type */}
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1.5">
              {LABELS.headsPage.fieldType}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {['EARNING', 'DEDUCTION'].map((type) => {
                const checked = headType === type;
                return (
                  <label
                    key={type}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${checked
                      ? type === 'EARNING'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-red-50 border-red-500 text-red-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="headType"
                      value={type}
                      checked={checked}
                      onChange={() => setHeadType(type)}
                      className="accent-teal-600"
                    />
                    <span>{LABELS.headTypes[type]}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* ========== Deactivate confirmation ========== */}
      <ConfirmDialog
        isOpen={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleConfirmDeactivate}
        title={LABELS.headsPage.deactivateTitle}
        message={LABELS.headsPage.deactivateMessage}
        variant="warning"
      />

      {/* ========== Toast ========== */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 text-white px-4 py-2.5 text-sm shadow-lg">
          {toast.text}
        </div>
      )}
    </div>
  );
};