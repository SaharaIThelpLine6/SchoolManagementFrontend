import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { toBengaliDigits } from '../../utils/format';
import {
  useGetYearsQuery,
  useCreateYearMutation,
  useUpdateYearMutation,
  useUpdateYearStatusMutation,
  useGetMonthsQuery,
  useCreateMonthMutation,
  useUpdateMonthMutation,
  useUpdateMonthStatusMutation,
} from '../../features/teachers/teachersSlice';

export const YearMonthManager = ({ onYearChange, onMonthChange, selectedYearId, selectedMonthId }) => {
  const [activeTab, setActiveTab] = useState('YEAR');

  // Year Modal States
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [editYearId, setEditYearId] = useState(null);
  const [yearValue, setYearValue] = useState('');

  // Month Modal States
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [editMonthId, setEditMonthId] = useState(null);
  const [modalYearId, setModalYearId] = useState('');
  const [monthName, setMonthName] = useState('');
  const [monthValue, setMonthValue] = useState(''); // ✅ ডাইনামিক হ্যান্ডেলের জন্য

  // Queries
  const { data: yearsRes, isLoading: isYearsLoading, refetch: refetchYears } = useGetYearsQuery();
  const { data: monthsRes, isLoading: isMonthsLoading, refetch: refetchMonths } = useGetMonthsQuery(
    { yearId: selectedYearId },
    { skip: !selectedYearId }
  );

  // Mutations
  const [createYear, { isLoading: isCreatingYear }] = useCreateYearMutation();
  const [updateYear, { isLoading: isUpdatingYear }] = useUpdateYearMutation();
  const [updateYearStatus] = useUpdateYearStatusMutation();

  const [createMonth, { isLoading: isCreatingMonth }] = useCreateMonthMutation();
  const [updateMonth, { isLoading: isUpdatingMonth }] = useUpdateMonthMutation();
  const [updateMonthStatus] = useUpdateMonthStatusMutation();

  const years = yearsRes?.data ?? [];
  const months = monthsRes?.data ?? [];

  // Auto-select first year
  useEffect(() => {
    if (!selectedYearId && years.length > 0) {
      onYearChange(years[0].YearID);
    }
  }, [years, selectedYearId, onYearChange]);

  // Auto-select first month
  useEffect(() => {
    if (!selectedMonthId && months.length > 0) {
      onMonthChange(months[0].MonthID);
    }
  }, [months, selectedMonthId, onMonthChange]);

  // Reset month when year changes
  useEffect(() => {
    onMonthChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYearId]);

  // ─── Year Handlers ────────────────────────────────────────────
  const handleOpenYearModal = (year = null) => {
    if (year) {
      setEditYearId(year.YearID);
      setYearValue(year.YearValue);
    } else {
      setEditYearId(null);
      setYearValue(new Date().getFullYear());
    }
    setIsYearModalOpen(true);
  };

  const handleSaveYear = async (e) => {
    e.preventDefault();
    if (!yearValue) return alert('বছর লিখুন');

    try {
      if (editYearId) {
        await updateYear({ yearId: editYearId, YearValue: Number(yearValue) }).unwrap();
      } else {
        await createYear({ YearValue: Number(yearValue) }).unwrap();
      }
      await refetchYears();
      setIsYearModalOpen(false);
    } catch (err) {
      alert(err?.data?.error || 'সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  const handleToggleYearStatus = async (year) => {
    try {
      await updateYearStatus({ yearId: year.YearID, IsActive: !year.IsActive }).unwrap();
    } catch (err) {
      alert(err?.data?.error || 'স্টেটাস পরিবর্তন করতে সমস্যা হয়েছে');
    }
  };

  // ─── Month Handlers ───────────────────────────────────────────
  const handleOpenMonthModal = (month = null) => {
    if (month) {
      setEditMonthId(month.MonthID);
      setModalYearId(month.YearID);
      setMonthName(month.MonthName);
      setMonthValue(month.MonthValue);
    } else {
      setEditMonthId(null);
      setModalYearId(selectedYearId || (years.length > 0 ? years[0].YearID : ''));
      setMonthName('');
      // নতুন মাসের জন্য অটো সিরিয়াল নম্বর (যেমন: বর্তমানে ৫টি মাস থাকলে নতুনটি হবে ৬)
      const currentYearMonths = months.filter(m => Number(m.YearID) === Number(selectedYearId));
      setMonthValue(currentYearMonths.length + 1);
    }
    setIsMonthModalOpen(true);
  };

  const handleSaveMonth = async (e) => {
    e.preventDefault();
    if (!monthName.trim() || !modalYearId) return alert('মাসের নাম এবং বছর সিলেক্ট করুন');

    try {
      const payload = {
        YearID: Number(modalYearId),
        MonthValue: Number(monthValue), // ✅ ব্যাকএন্ডে সিরিয়াল নম্বর যাচ্ছে
        MonthName: monthName.trim(),
      };

      if (editMonthId) {
        await updateMonth({ monthId: editMonthId, ...payload }).unwrap();
      } else {
        await createMonth(payload).unwrap();
      }

      if (Number(modalYearId) === Number(selectedYearId)) {
        await refetchMonths();
      }
      setIsMonthModalOpen(false);
    } catch (err) {
      alert(err?.data?.error || 'সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  const handleToggleMonthStatus = async (month) => {
    try {
      await updateMonthStatus({ monthId: month.MonthID, IsActive: !month.IsActive }).unwrap();
    } catch (err) {
      alert(err?.data?.error || 'স্টেটাস পরিবর্তন করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-5">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab('YEAR')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'YEAR' ? 'text-indigo-700 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          বছর ম্যানেজমেন্ট
        </button>
        <button
          onClick={() => setActiveTab('MONTH')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'MONTH' ? 'text-indigo-700 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          মাস ম্যানেজমেন্ট
        </button>
      </div>

      <div className="p-4">
        {/* YEAR TAB */}
        {activeTab === 'YEAR' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">বছরসমূহ</h3>
              <button onClick={() => handleOpenYearModal()} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                + নতুন বছর
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {isYearsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))
              ) : years.length === 0 ? (
                <div className="col-span-full text-center py-4 text-slate-500">কোনো বছর নেই।</div>
              ) : (
                years.map((y) => (
                  <div key={y.YearID} onClick={() => onYearChange(y.YearID)} className={`relative group cursor-pointer border rounded-xl p-3 text-center transition-all ${selectedYearId === y.YearID ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                    <div className="text-lg font-bold text-slate-800">{toBengaliDigits(y.YearValue)}</div>
                    <div className={`text-[10px] font-medium mt-1 inline-block px-1.5 py-0.5 rounded ${y.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {y.IsActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </div>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenYearModal(y); }} className="text-blue-500 hover:text-blue-700 p-1 bg-white rounded shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg></button>
                      <button onClick={(e) => { e.stopPropagation(); handleToggleYearStatus(y); }} className={`p-1 bg-white rounded shadow-sm ${y.IsActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" x2="12" y1="2" y2="12" /></svg></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MONTH TAB */}
        {activeTab === 'MONTH' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">মাসসমূহ</h3>
              <button onClick={() => handleOpenMonthModal()} disabled={!selectedYearId} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                + নতুন মাস
              </button>
            </div>
            {!selectedYearId ? (
              <div className="text-center py-4 text-amber-600 bg-amber-50 rounded-lg text-sm">আগে বছর সিলেক্ট করুন</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {isMonthsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                  ))
                ) : months.length === 0 ? (
                  <div className="col-span-full text-center py-4 text-slate-500">কোনো মাস নেই।</div>
                ) : (
                  months.map((m) => (
                    <div key={m.MonthID} onClick={() => onMonthChange(m.MonthID)} className={`relative group cursor-pointer border rounded-xl p-3 text-center transition-all ${selectedMonthId === m.MonthID ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                      <div className="text-sm font-bold text-slate-800">{m.MonthName}</div>
                      <div className={`text-[10px] font-medium mt-1 inline-block px-1.5 py-0.5 rounded ${m.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {m.IsActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </div>
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleOpenMonthModal(m); }} className="text-blue-500 hover:text-blue-700 p-1 bg-white rounded shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg></button>
                        <button onClick={(e) => { e.stopPropagation(); handleToggleMonthStatus(m); }} className={`p-1 bg-white rounded shadow-sm ${m.IsActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" x2="12" y1="2" y2="12" /></svg></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* YEAR MODAL */}
      <Modal isOpen={isYearModalOpen} onClose={() => setIsYearModalOpen(false)} title={editYearId ? "বছর এডিট করুন" : "নতুন বছর তৈরি করুন"} size="sm"
        footer={
          <>
            <button onClick={() => setIsYearModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">বাতিল</button>
            <button onClick={handleSaveYear} disabled={isCreatingYear || isUpdatingYear} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {(isCreatingYear || isUpdatingYear) ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveYear} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">বছর (যেমন: 2024)</label>
            <input
              type="number"
              value={yearValue}
              onChange={(e) => setYearValue(e.target.value)}
              required
              className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* MONTH MODAL */}
      <Modal isOpen={isMonthModalOpen} onClose={() => setIsMonthModalOpen(false)} title={editMonthId ? "মাস এডিট করুন" : "নতুন মাস তৈরি করুন"} size="sm"
        footer={
          <>
            <button onClick={() => setIsMonthModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">বাতিল</button>
            <button onClick={handleSaveMonth} disabled={isCreatingMonth || isUpdatingMonth} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {(isCreatingMonth || isUpdatingMonth) ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveMonth} className="space-y-4">

          {/* Year Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">বছর সিলেক্ট করুন</label>
            <select
              value={modalYearId}
              onChange={(e) => setModalYearId(e.target.value)}
              required
              className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">বছর সিলেক্ট করুন</option>
              {years.map(y => (
                <option key={y.YearID} value={y.YearID}>{toBengaliDigits(y.YearValue)}</option>
              ))}
            </select>
          </div>

          {/* ✅ শুধুমাত্র মাসের নাম (মাস নম্বর বাদ দেওয়া হয়েছে) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">মাসের নাম (বাংলা/আরবি/ইংরেজি)</label>
            <input
              type="text"
              value={monthName}
              onChange={(e) => setMonthName(e.target.value)}
              required
              placeholder="যেমন: মুহাররম, জানুয়ারি, January..."
              className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">আপনার মাদরাসার নিয়ম অনুযায়ী যেকোনো নাম লিখতে পারেন।</p>
          </div>

        </form>
      </Modal>
    </div>
  );
};