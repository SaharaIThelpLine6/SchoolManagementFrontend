import React, { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { Modal } from './Modal';
import { MoneyInput } from './MoneyInput';
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

// ─── Mappers ─────────────────────────────────────────────────────
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

const mapDesignations = (arr) =>
  [...(arr ?? [])]
    .sort((a, b) => (a.SL ?? 0) - (b.SL ?? 0))
    .map((d) => (d.Designation ?? '').trim())
    .filter(Boolean);

const norm = (s) => (s ?? '').trim().toLowerCase();

const Icon = ({ d, size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d.map((p, i) => <path key={i} d={p} />)}
  </svg>
);

export const SalaryStructurePage = () => {
  // ─── Queries ──────────────────────────────────────────────────
  const { data: teachersRes, isLoading: teachersLoading } = useGetTeachersQuery();
  const { data: designationData, isLoading: designationLoading } = useGetDesignationQuery();
  const { data: headsRes, isLoading: headsLoading } = useGetHeadsQuery();
  const { data: structuresRes, isLoading: structuresLoading, isFetching: structuresFetching } = useGetStructuresQuery();

  // ─── Mutations ────────────────────────────────────────────────
  const [saveTeacherStructure, { isLoading: isSaving }] = useSaveTeacherStructureMutation();
  const [applyStructureBulk, { isLoading: isBulkSaving }] = useApplyStructureBulkMutation();

  const isLoading = teachersLoading || headsLoading || structuresLoading || structuresFetching || designationLoading;
  const isBusy = isSaving || isBulkSaving;

  // ─── Data ─────────────────────────────────────────────────────
  const teachers = useMemo(() => (teachersRes?.data ?? []).map(mapTeacher), [teachersRes]);
  const heads = useMemo(() => (headsRes?.data ?? []).map(mapHead), [headsRes]);
  const structures = useMemo(() => (structuresRes?.data ?? []).map(mapStructure), [structuresRes]);

  // userId-headId → amount (দ্রুত খোঁজার জন্য)
  const structureMap = useMemo(() => {
    const m = new Map();
    for (const s of structures) m.set(`${Number(s.userId)}-${Number(s.headId)}`, s.amount);
    return m;
  }, [structures]);

  const designations = useMemo(() => Array.from(new Set(mapDesignations(designationData))), [designationData]);

  const activeHeads = useMemo(
    () => heads.filter((h) => h.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [heads]
  );
  const earningHeads = useMemo(() => activeHeads.filter((h) => h.headType === 'EARNING'), [activeHeads]);
  const deductionHeads = useMemo(() => activeHeads.filter((h) => h.headType === 'DEDUCTION'), [activeHeads]);

  // ─── Local UI state ───────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [designationFilter, setDesignationFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [draftAmounts, setDraftAmounts] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [applyDesignationOpen, setApplyDesignationOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const addToast = (kind, text) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 2500);
  };

  // ✅ শিক্ষক বা ডাটা বদলালে ড্রাফট আবার লোড (আগে শুধু length দেখত, তাই পুরনো টাকা দেখাত)
  useEffect(() => {
    if (!selectedUserId || !isModalOpen) return;
    const map = {};
    for (const h of activeHeads) {
      const amt = structureMap.get(`${Number(selectedUserId)}-${Number(h.headId)}`) ?? 0;
      map[h.headId] = amt > 0 ? amt : '';
    }
    setDraftAmounts(map);
    setIsDirty(false);
  }, [selectedUserId, isModalOpen, activeHeads, structureMap]);

  // ─── Filtering ────────────────────────────────────────────────
  const filteredTeachers = useMemo(() => {
    const q = norm(search);
    return teachers.filter((t) => {
      if (designationFilter !== 'ALL' && norm(t.designation) !== norm(designationFilter)) return false;
      if (q && !String(t.name).toLowerCase().includes(q) && !String(t.userCode).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [teachers, search, designationFilter]);

  const getTeacherTotals = (userId) => {
    let gross = 0;
    let deduction = 0;
    for (const h of activeHeads) {
      const amt = structureMap.get(`${Number(userId)}-${Number(h.headId)}`) ?? 0;
      if (h.headType === 'EARNING') gross += amt;
      else deduction += amt;
    }
    return { gross, deduction, net: Math.max(0, gross - deduction) };
  };

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

  // ─── Handlers ─────────────────────────────────────────────────
  const handleOpenModal = (userId = '') => {
    setSelectedUserId(userId ? String(userId) : '');
    setDraftAmounts({});
    setIsDirty(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isDirty && !window.confirm(LABELS.structurePage.unsavedMessage)) return;
    setIsModalOpen(false);
  };

  const handleAmountChange = (headId, val) => {
    setDraftAmounts((prev) => ({ ...prev, [headId]: val }));
    setIsDirty(true);
  };

  // ✅ সব সক্রিয় খাত পাঠানো হয় (0 সহ) — 0 দিলে backend ওই খাত মুছে দেয়
  const toAmountsPayload = () => {
    const out = {};
    for (const h of activeHeads) out[String(h.headId)] = Number(draftAmounts[h.headId]) || 0;
    return out;
  };

  const handleSave = async () => {
    if (!selectedUserId) return;
    try {
      await saveTeacherStructure({ userId: Number(selectedUserId), Amounts: toAmountsPayload() }).unwrap();
      setIsDirty(false);
      addToast('success', LABELS.structurePage.toastSaved);
      setIsModalOpen(false);
    } catch (err) {
      addToast('error', err?.data?.error ?? 'সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  const selectedTeacher = useMemo(
    () => teachers.find((t) => Number(t.userId) === Number(selectedUserId)) ?? null,
    [teachers, selectedUserId]
  );

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
      await applyStructureBulk({ UserIDs, Amounts: toAmountsPayload() }).unwrap();
      setIsDirty(false);
      addToast(
        'success',
        LABELS.structurePage.toastAppliedDesignation
          .replace('{designation}', selectedTeacher.designation)
          .replace('{count}', toBengaliDigits(UserIDs.length))
      );
      setApplyDesignationOpen(false);
      setIsModalOpen(false);
    } catch (err) {
      addToast('error', err?.data?.error ?? 'সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  const renderHeadInputs = (list) =>
    list.map((head) => (
      <div key={head.headId} className="space-y-1.5">
        <label htmlFor={`struct-${head.headId}`} className="block text-sm font-medium text-slate-700">
          {head.headName}
        </label>
        <MoneyInput
          id={`struct-${head.headId}`}
          value={draftAmounts[head.headId] ?? ''}
          onChange={(val) => handleAmountChange(head.headId, val)}
          placeholder="0.00"
        />
      </div>
    ));

  return (
    <div className="space-y-5">
      {/* ===================== হেডার */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-5 py-4 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/20 backdrop-blur">
              <Icon size={20} d={['M21 4h-7', 'M10 4H3', 'M21 12h-9', 'M8 12H3', 'M21 20h-5', 'M12 20H3', 'M14 2v4', 'M8 10v4', 'M16 18v4']} />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight sm:text-[20px]">{LABELS.nav.structure}</h3>
              <p className="text-xs text-white/80 sm:text-sm">{LABELS.structurePage.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
              <span className="text-[13px] font-medium">মোট শিক্ষক</span>
              <span className="text-[17px] font-bold leading-none">{toBengaliDigits(teachers.length)}</span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow transition hover:bg-indigo-50"
            >
              <Icon size={16} d={['M12 5v14', 'M5 12h14']} />
              <span>স্ট্রাকচার তৈরি করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== তথ্য */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-800">
        এখানের টাকা হলো <b>ডিফল্ট বেতন</b>। কোনো মাসে কারো বেতন আলাদা হলে "মাসিক বেতন তৈরি" পেজে ওই মাসের শিটে এডিট করুন।
        কাঠামো বদলানোর পর খসড়া শিটে নতুন টাকা আনতে সেখানে "কাঠামো থেকে আপডেট করুন" চাপুন।
      </div>

      {/* ===================== টেবিল */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="relative w-full max-w-xs">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="শিক্ষকের নাম বা কোড সার্চ করুন..."
              className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-600"
            />
          </div>
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="h-9 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-600 min-w-[200px]"
          >
            <option value="ALL">সকল পদবি</option>
            {designations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold w-16">ক্রমিক</th>
                <th className="py-3 px-4 font-semibold">শিক্ষকের নাম</th>
                <th className="py-3 px-4 font-semibold">পদবি</th>
                <th className="py-3 px-4 font-semibold text-right">মোট আয়</th>
                <th className="py-3 px-4 font-semibold text-right">মোট কর্তন</th>
                <th className="py-3 px-4 font-semibold text-right">নিট বেতন</th>
                <th className="py-3 px-4 font-semibold text-center w-28">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan="7" className="p-4"><div className="h-8 bg-slate-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filteredTeachers.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-500">কোনো শিক্ষক পাওয়া যায়নি</td></tr>
              ) : (
                filteredTeachers.map((t, idx) => {
                  const totals = getTeacherTotals(t.userId);
                  return (
                    <tr key={t.userId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono-num text-slate-500">{toBengaliDigits(idx + 1)}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {t.name} <span className="text-xs text-slate-400 block">{t.userCode}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{t.designation}</td>
                      <td className="py-3 px-4 text-right font-mono-num text-emerald-600">{formatMoney(totals.gross)}</td>
                      <td className="py-3 px-4 text-right font-mono-num text-red-500">{formatMoney(totals.deduction)}</td>
                      <td className="py-3 px-4 text-right font-mono-num font-bold text-slate-800">{formatMoney(totals.net)}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenModal(t.userId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                        >
                          <Icon d={['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z']} />
                          এডিট
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== মোডাল */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="স্যালারি স্ট্রাকচার"
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-4 text-sm font-medium">
              <span className="text-emerald-600">মোট আয়: {formatMoney(liveTotals.gross)}</span>
              <span className="text-red-500">মোট কর্তন: {formatMoney(liveTotals.deduction)}</span>
              <span className="text-slate-800">নিট: {formatMoney(liveTotals.net)}</span>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!selectedUserId || !isDirty || isBusy}
                className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label htmlFor="teacher-select" className="block text-sm font-medium text-slate-700 mb-1.5">
              শিক্ষক সিলেক্ট করুন <span className="text-red-500">*</span>
            </label>
            <select
              id="teacher-select"
              value={selectedUserId}
              onChange={(e) => {
                if (isDirty && !window.confirm(LABELS.structurePage.unsavedMessage)) return;
                setSelectedUserId(e.target.value);
              }}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
            >
              <option value="">-- শিক্ষক বাছাই করুন --</option>
              {teachers.map((t) => (
                <option key={t.userId} value={t.userId}>
                  {t.name} ({t.designation}){t.userCode ? ` - ${t.userCode}` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedUserId && (
            <div className="animate-scaleFadeIn space-y-5 border-t border-slate-100 pt-5">
              {selectedTeacher?.designation && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setApplyDesignationOpen(true)}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Icon d={['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75']} />
                    "{selectedTeacher.designation}" পদবির সবার জন্য প্রয়োগ করুন
                  </button>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold text-emerald-700 mb-3 uppercase tracking-wider">{LABELS.structurePage.earningSection}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderHeadInputs(earningHeads)}
                  {earningHeads.length === 0 && <p className="text-xs text-slate-500 col-span-full">কোনো আয় খাত নেই</p>}
                </div>
              </div>

              {deductionHeads.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-red-700 mb-3 uppercase tracking-wider">{LABELS.structurePage.deductionSection}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{renderHeadInputs(deductionHeads)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

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

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${toast.kind === 'error' ? 'bg-red-600' : 'bg-slate-900'}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
};
