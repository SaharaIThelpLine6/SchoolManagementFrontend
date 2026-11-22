import React, { useMemo, useState } from 'react';
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

// Backend row → frontend shape
const mapHead = (h) => ({
  headId: h.HeadID,
  headName: h.HeadName,
  headType: h.HeadType,
  sortOrder: h.SortOrder,
  isActive: Boolean(h.IsActive),
});

export const SalaryHeadsPage = () => {
  // ---- Query ----
  const { data: res, isLoading: isLoadingHeads, isFetching, refetch } = useGetHeadsQuery();

  // ---- Mutations ----
  const [createHead, { isLoading: isCreating }] = useCreateHeadMutation();
  const [updateHead, { isLoading: isUpdating }] = useUpdateHeadMutation();
  const [toggleHeadActive, { isLoading: isToggling }] = useToggleHeadActiveMutation();

  // API returns { success, data: [...] }; fall back to array if raw
  const rawHeads = res?.data ?? (Array.isArray(res) ? res : []);
  const heads = useMemo(() => rawHeads.map(mapHead), [rawHeads]);

  const isLoading = isLoadingHeads || isFetching;
  const isSaving = isCreating || isUpdating || isToggling;

  // ---- Local UI state ----
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHead, setEditingHead] = useState(null);
  const [headName, setHeadName] = useState('');
  const [headType, setHeadType] = useState('EARNING');
  const [sortOrder, setSortOrder] = useState(1);
  const [formError, setFormError] = useState('');

  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const addToast = (kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 2500);
  };

  const activeCount = useMemo(() => heads.filter((h) => h.isActive).length, [heads]);

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

  // ---- Modal handlers ----
  const openAddModal = () => {
    setEditingHead(null);
    setHeadName('');
    setHeadType('EARNING');
    const maxOrder = heads.reduce((m, h) => Math.max(m, h.sortOrder), 0);
    setSortOrder(maxOrder + 1);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (head) => {
    setEditingHead(head);
    setHeadName(head.headName);
    setHeadType(head.headType);
    setSortOrder(head.sortOrder);
    setFormError('');
    setModalOpen(true);
  };

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

    const payload = {
      HeadName: headName.trim(),
      HeadType: headType,
      SortOrder: sortOrder,
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
    } catch (err) {
      setFormError(err?.data?.error ?? LABELS.headsPage.errorNameRequired);
    }
  };

  // ---- Toggle / deactivate ----
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

  // ---- Render ----
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

      {/* Table with Search & Type Filter */}
      <DataTable
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder={LABELS.headsPage.searchPlaceholder}
        isLoading={isLoading}
        isEmpty={filteredHeads.length === 0}
        emptyTitle={LABELS.headsPage.emptyTitle}
        emptyDescription={LABELS.headsPage.emptyDesc}
        skeletonCols={5}
        toolbarRight={
          <div
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
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
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${active
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
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="py-3 px-4 font-semibold w-20">{LABELS.headsPage.colOrder}</th>
              <th className="py-3 px-4 font-semibold">{LABELS.headsPage.colName}</th>
              <th className="py-3 px-4 font-semibold w-32">{LABELS.headsPage.colType}</th>
              <th className="py-3 px-4 font-semibold w-36">{LABELS.headsPage.colStatus}</th>
              <th className="py-3 px-4 font-semibold text-right w-28">
                {LABELS.common.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHeads.map((head) => (
              <tr
                key={head.headId}
                className={`hover:bg-slate-50/80 transition-colors ${!head.isActive ? 'opacity-65 bg-slate-50/40' : ''
                  }`}
              >
                <td className="py-3 px-4 font-mono-num text-slate-600">
                  {head.sortOrder}
                </td>
                <td className="py-3 px-4 font-medium text-slate-900">{head.headName}</td>
                <td className="py-3 px-4">
                  <StatusBadge variant={{ kind: 'head', type: head.headType }} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={head.isActive}
                      aria-label={`${head.headName} ${LABELS.headsPage.colStatus}`}
                      onClick={() => handleToggleClick(head)}
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
                      {head.isActive
                        ? LABELS.headsPage.activeLabel
                        : LABELS.headsPage.inactiveLabel}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => openEditModal(head)}
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
            ))}
          </tbody>
        </table>
      </DataTable>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingHead ? LABELS.headsPage.modalEditTitle : LABELS.headsPage.modalAddTitle
        }
        size="sm"
        footer={
          <>
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
          </>
        }
      >
        <form id="head-form" onSubmit={handleSaveModal} className="space-y-4">
          {formError && (
            <div className="px-3.5 py-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="head-name-input"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              {LABELS.headsPage.fieldName} <span className="text-red-500">*</span>
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

          {/* <div>
            <label
              htmlFor="head-order-input"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              {LABELS.headsPage.fieldOrder}
            </label>
            <input
              id="head-order-input"
              type="number"
              min={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
            />
          </div> */}
        </form>
      </Modal>

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleConfirmDeactivate}
        title={LABELS.headsPage.deactivateTitle}
        message={LABELS.headsPage.deactivateMessage}
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