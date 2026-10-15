import React, { useState, useMemo, useEffect, useRef } from 'react';

const initialData = [
  { id: 1, code: '১০০১৭২৪', name: 'মোঃ হাবিবুল্লাহ', gpa: '৪৪', total: '৭৫৪', merit: '৩', dept: 'মুমতাজ', mobile: '০১৬৭৯৭৬৮৫২১' },
  { id: 2, code: '১০০১৫৭১', name: 'মোঃ আজিম মিয়া', gpa: '৮১', total: '৬৫৪', merit: '১৫', dept: 'মুমতাজ', mobile: '০১৬৩২১৯৮৭৭০' },
  { id: 3, code: '১০০২৪৫৬', name: 'নুর মুহাম্মদ জিসান', gpa: '৮২', total: '৬৫৭', merit: '১৩', dept: 'মুমতাজ', mobile: '০১৭৩৬১৭৯৭১৭' },
  { id: 4, code: '১০০১০৮২', name: 'মোঃ মুতাসিম বিল্লাহ সাআদ', gpa: '৯৩', total: '৭৪৭', merit: '৫', dept: 'মুমতাজ', mobile: '০১৭১২৪৭৭১৫০' },
  { id: 5, code: '১০০১৫২৮', name: 'রায়হান আহমেদ', gpa: '৭৬', total: '৬১৫', merit: '২৩', dept: 'জায়িদ জিদ্দান', mobile: '০১৮২৯২৩৫৭০০' },
  { id: 6, code: '১০০১৬৪৮', name: 'আজাহারুল ইসলাম', gpa: '৬৬', total: '৫৩০', merit: '২৯', dept: 'জায়িদ জিদ্দান', mobile: '০১৭৬৫২২২৯৫৭' },
  { id: 7, code: '১০০১৫৮০', name: 'মাহদী হাসান রাজু', gpa: '৭৮', total: '৬২৮', merit: '১৯', dept: 'জায়িদ জিদ্দান', mobile: '০১৭৬৪১৬৯৮৭০' },
  { id: 8, code: '১০০০৯৭৬', name: 'মোঃ আল আমিন', gpa: '৭৭', total: '৬১৮', merit: '২২', dept: 'জায়িদ জিদ্দান', mobile: '০১৯৮৩২৭৩৯২৯' },
  { id: 9, code: '১০০১১৩৫', name: 'মো: আরিফুল ইসলাম', gpa: '৫৬', total: '৪৫১', merit: '৩৭', dept: 'জায়িদ', mobile: '০১৯৩৩১৩১২৪৯' },
  { id: 10, code: '১০০২০০৩', name: 'মোঃ আল আমিন', gpa: '৮১', total: '৬৫৫', merit: '১৪', dept: 'মুমতাজ', mobile: '০১৭১৮৫৬৭০৩০' },
];

const SMS_COST_PER_MESSAGE = 1;
const INITIAL_BALANCE = 5000;

// ইংরেজি সংখ্যা -> বাংলা সংখ্যা
const bn = (n) => Number(n).toLocaleString('bn-BD');

/* ---------- আইকন ---------- */
const Icon = ({ children, className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
);
const HelpIcon = (p) => (<Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>);
const WalletIcon = (p) => (<Icon {...p}><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" /><path d="M4 6v12a2 2 0 0 0 2 2h14v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></Icon>);
const TagIcon = (p) => (<Icon {...p}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" /><line x1="7" y1="7" x2="7.01" y2="7" /></Icon>);
const UsersIcon = (p) => (<Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>);
const CalcIcon = (p) => (<Icon {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="8.01" y2="10" /><line x1="12" y1="10" x2="12.01" y2="10" /><line x1="16" y1="10" x2="16.01" y2="10" /><line x1="8" y1="14" x2="8.01" y2="14" /><line x1="12" y1="14" x2="12.01" y2="14" /><line x1="16" y1="14" x2="16.01" y2="14" /></Icon>);
const SendIcon = (p) => (<Icon {...p}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Icon>);
const SearchIcon = (p) => (<Icon {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>);
const CloseIcon = (p) => (<Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>);
const CheckIcon = (p) => (<Icon {...p}><polyline points="20 6 9 17 4 12" /></Icon>);
const AlertIcon = (p) => (<Icon {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>);

/* ---------- ছোট কম্পোনেন্ট ---------- */
const StatCard = ({ icon, label, value, tone = 'slate', hint }) => {
  const tones = {
    slate: 'bg-white border-slate-200 text-slate-800',
    teal: 'bg-white border-slate-200 text-[#2c68d8]',
    sky: 'bg-white border-slate-200 text-[#2c68d8]',
    strong: 'bg-gradient-to-br from-[#4284f1] to-[#2a5fd0] border-[#4284f1] text-white',
    danger: 'bg-rose-50 border-rose-200 text-rose-700',
  };
  const iconTone = tone === 'strong' ? 'bg-white/15 text-white' : tone === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-[#eaf2ff] text-[#2c68d8]';
  const labelTone = tone === 'strong' ? 'text-blue-100' : 'text-slate-500';
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all duration-300 ${tones[tone]}`}>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconTone}`}>{icon}</span>
      <div className="min-w-0">
        <p className={`text-xs ${labelTone}`}>{label}</p>
        <p key={value} className="stat-pop text-xl font-bold leading-tight tabular-nums">{value}</p>
        {hint && <p className={`text-[11px] ${labelTone}`}>{hint}</p>}
      </div>
    </div>
  );
};

const Checkbox = ({ checked, indeterminate, onChange, label }) => {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label}
      className="h-[18px] w-[18px] cursor-pointer rounded-md accent-[#4284f1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4284f1] focus-visible:ring-offset-2" />
  );
};

const HelpModal = ({ onClose, cost }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const steps = [
    { t: 'ক্লাস ও পরীক্ষা বাছাই করুন', d: 'শিক্ষাবর্ষ, পরীক্ষা ও জামাত/ক্লাস নির্বাচন করলে সেই ক্লাসের শিক্ষার্থীদের তালিকা আসবে।' },
    { t: 'টিক চিহ্ন দেখে নিন', d: 'শুরুতে সবার নামের পাশে টিক দেওয়া থাকে। যার নাম্বারে SMS পাঠাতে চান না, তার টিক তুলে দিন — সে বাদ যাবে।' },
    { t: 'খরচ মিলিয়ে নিন', d: `প্রতি SMS-এ ${bn(cost)} পয়েন্ট কাটা হয়। উপরে দেখুন কতজন নির্বাচিত এবং মোট কত পয়েন্ট খরচ হবে।` },
    { t: 'Send SMS চাপুন', d: 'শুধু টিক দেওয়া শিক্ষার্থীদের নাম্বারে ফলাফল SMS যাবে এবং ব্যালেন্স থেকে পয়েন্ট কাটা হবে।' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="SMS কীভাবে যাবে">
      <div className="modal-fade absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-rise relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-bold text-slate-800">কীভাবে SMS যাবে?</h2>
          <button onClick={onClose} aria-label="বন্ধ করুন"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4284f1]">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <ol className="space-y-5 px-6 py-5">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eaf2ff] text-sm font-bold text-[#2c68d8]">{bn(i + 1)}</span>
              <div>
                <p className="font-semibold text-slate-800">{s.t}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mx-6 mb-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="mb-1 font-semibold text-slate-800">হিসাবের নিয়ম</p>
          <p>প্রতি SMS-এর পয়েন্ট × নির্বাচিত শিক্ষার্থী = মোট খরচ</p>
          <p className="mt-2 rounded-xl bg-white px-3 py-2 font-medium tabular-nums text-[#2c68d8] ring-1 ring-slate-200">
            উদাহরণ: {bn(cost)} × {bn(8)} জন = {bn(cost * 8)} পয়েন্ট
          </p>
        </div>
      </div>
    </div>
  );
};

/* ---------- মূল কম্পোনেন্ট ---------- */
const PublicationOfResultsViaSMS = () => {
  const [students, setStudents] = useState(initialData.map((s) => ({ ...s, isSelected: true })));
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [query, setQuery] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const selectedCount = students.filter((s) => s.isSelected).length;
  const totalCost = selectedCount * SMS_COST_PER_MESSAGE;
  const remaining = balance - totalCost;
  const insufficient = remaining < 0;
  const allSelected = selectedCount === students.length;
  const noneSelected = selectedCount === 0;

  const visible = useMemo(() => {
    const q = query.trim();
    if (!q) return students;
    return students.filter((s) => s.name.includes(q) || s.code.includes(q) || s.mobile.includes(q));
  }, [students, query]);

  const toggle = (id) =>
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, isSelected: !s.isSelected } : s)));

  const toggleAll = () => setStudents((prev) => prev.map((s) => ({ ...s, isSelected: !allSelected })));

  const handleSend = () => {
    if (noneSelected || insufficient || sending) return;
    setSending(true);
    // ডেমো: এখানে আপনার API কল বসান
    setTimeout(() => {
      setBalance((b) => b - totalCost);
      setSending(false);
      setToast({ count: selectedCount, cost: totalCost });
      setTimeout(() => setToast(null), 4000);
    }, 1400);
  };

  return (
    <div className="flex h-[100dvh] flex-col rounded-3xl" style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif", background: 'radial-gradient(900px 520px at 8% -8%, rgba(66,132,241,.45), transparent 60%), radial-gradient(760px 480px at 100% 0%, rgba(129,170,255,.40), transparent 58%), radial-gradient(700px 500px at 50% 110%, rgba(66,132,241,.25), transparent 60%), linear-gradient(180deg, #e8f0ff 0%, #f4f8ff 100%)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        @keyframes statPop { from { opacity: .3; transform: translateY(4px) } to { opacity: 1; transform: none } }
        @keyframes modalFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalRise { from { opacity: 0; transform: translateY(24px) scale(.98) } to { opacity: 1; transform: none } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 16px) } to { opacity: 1; transform: translate(-50%, 0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .stat-pop { animation: statPop .25s ease-out }
        .modal-fade { animation: modalFade .2s ease-out }
        .modal-rise { animation: modalRise .28s cubic-bezier(.2,.8,.2,1) }
        .toast-in { animation: toastIn .3s cubic-bezier(.2,.8,.2,1) }
        .spinner { animation: spin .8s linear infinite }
        @media (prefers-reduced-motion: reduce) { .stat-pop, .modal-fade, .modal-rise, .toast-in, .spinner { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important } }
      `}</style>

      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-[#4284f1]/25">
        {/* হেডার */}
        <header className="flex flex-none items-center justify-between gap-3 bg-gradient-to-r from-[#1b49b3] via-[#2c68d8] to-[#4284f1] px-5 py-5 sm:px-8">
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">এসএমএস এর মাধ্যমে ফলাফল প্রকাশ</h1>
            <p className="mt-0.5 text-sm text-blue-100">টিক দেওয়া শিক্ষার্থীদের নাম্বারে ফলাফল পাঠানো হবে</p>
          </div>
          <button onClick={() => setHelpOpen(true)} aria-label="কীভাবে SMS যাবে দেখুন"
            className="flex shrink-0 items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/25 transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <HelpIcon className="h-5 w-5" />
            <span className="hidden sm:inline">কীভাবে কাজ করে</span>
          </button>
        </header>

        {/* মাঝের অংশ: ফিল্টার ফিক্সড, টেবিল স্ক্রল */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* ফিল্টার */}
          <section className="shrink-0 border-b border-slate-100 bg-gradient-to-b from-[#f3f7ff] to-white px-5 py-5">
            <div className="flex flex-wrap items-end gap-4">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">শিক্ষাবর্ষ</span>
                <input type="text" value="২০২৫-২৬" readOnly
                  className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 focus:outline-none" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">পরীক্ষা</span>
                <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 transition focus:border-[#4284f1] focus:outline-none focus:ring-2 focus:ring-[#4284f1]/20">
                  <option>২য় সাময়িক পরীক্ষা</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-600">জামাত/ক্লাস</span>
                <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 transition focus:border-[#4284f1] focus:outline-none focus:ring-2 focus:ring-[#4284f1]/20">
                  <option>সানাবিয়া ২য় (ক)</option>
                </select>
              </label>
              <div className="relative ml-auto w-full sm:w-64">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="নাম, কোড বা মোবাইল খুঁজুন"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 transition focus:border-[#4284f1] focus:outline-none focus:ring-2 focus:ring-[#4284f1]/20" />
              </div>
            </div>

            {/* স্ট্যাটস */}
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatCard icon={<WalletIcon />} label="মোট ব্যালেন্স" value={bn(balance)} tone="teal" hint="SMS" />
              <StatCard icon={<TagIcon />} label="প্রতি SMS-এ কর্তন" value={bn(SMS_COST_PER_MESSAGE)} />
              <StatCard icon={<UsersIcon />} label="নির্বাচিত নাম্বার" value={`${bn(selectedCount)}/${bn(students.length)}`} tone="sky" />
              <StatCard icon={<CalcIcon />} label={`${bn(SMS_COST_PER_MESSAGE)} × ${bn(selectedCount)} = মোট খরচ`} value={bn(totalCost)} tone="strong" />
              <StatCard icon={insufficient ? <AlertIcon /> : <WalletIcon />} label="খরচের পর ব্যালেন্স" value={bn(remaining)} tone={insufficient ? 'danger' : 'slate'} />
            </div>

            {insufficient && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700" role="alert">
                <AlertIcon className="h-4 w-4 shrink-0" />
                ব্যালেন্স পর্যাপ্ত নয়। কয়েকজনের টিক তুলে দিন অথবা ব্যালেন্স রিচার্জ করুন।
              </p>
            )}
          </section>

          {/* টেবিল */}
          <div className="min-h-[260px] flex-1 overflow-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 shadow-[0_1px_0_#e2e8f0]">
                <tr className="border-b border-slate-200">
                  <th className="w-14 px-5 py-3 text-center">
                    <Checkbox checked={allSelected} indeterminate={!allSelected && !noneSelected} onChange={toggleAll} label="সবাইকে নির্বাচন করুন" />
                  </th>
                  <th className="px-4 py-3 font-semibold">কোড</th>
                  <th className="px-4 py-3 font-semibold">নাম</th>
                  <th className="px-4 py-3 text-center font-semibold">গড়</th>
                  <th className="px-4 py-3 text-center font-semibold">মোট</th>
                  <th className="px-4 py-3 text-center font-semibold">মেধা</th>
                  <th className="px-4 py-3 font-semibold">বিভাগ</th>
                  <th className="px-4 py-3 font-semibold">মোবাইল</th>
                  <th className="px-4 py-3 font-semibold">SMS</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id} onClick={() => toggle(s.id)}
                    className={`cursor-pointer border-b border-slate-100 transition-colors duration-200 ${s.isSelected ? 'hover:bg-[#eaf2ff]/70' : 'bg-slate-50/80 hover:bg-slate-100'}`}>
                    <td className="px-5 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={s.isSelected} onChange={() => toggle(s.id)} label={`${s.name} কে SMS পাঠান`} />
                    </td>
                    <td className={`px-4 py-3 tabular-nums transition-opacity ${s.isSelected ? 'text-slate-700' : 'text-slate-400'}`}>{s.code}</td>
                    <td className={`px-4 py-3 font-medium transition-all ${s.isSelected ? 'text-slate-900' : 'text-slate-400 line-through decoration-slate-300'}`}>{s.name}</td>
                    <td className={`px-4 py-3 text-center tabular-nums ${s.isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{s.gpa}</td>
                    <td className={`px-4 py-3 text-center tabular-nums ${s.isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{s.total}</td>
                    <td className={`px-4 py-3 text-center tabular-nums ${s.isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{s.merit}</td>
                    <td className={`px-4 py-3 ${s.isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{s.dept}</td>
                    <td className={`px-4 py-3 tabular-nums ${s.isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{s.mobile}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${s.isSelected ? 'bg-[#eaf2ff] text-[#2c68d8]' : 'bg-slate-200 text-slate-500'}`}>
                        {s.isSelected ? <><CheckIcon className="h-3 w-3" />যাবে</> : 'যাবে না'}
                      </span>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">"{query}" নামে কোনো শিক্ষার্থী পাওয়া যায়নি। অন্য নাম বা কোড লিখে দেখুন।</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* নিচের ফিক্সড বার */}
        <div className="relative z-20 flex-none border-t border-slate-200 bg-white/95 shadow-[0_-10px_28px_-14px_rgba(66,132,241,.45)] backdrop-blur">
          <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <p className="text-sm text-slate-600 tabular-nums">
              <span className="font-semibold text-slate-800">{bn(selectedCount)} জন</span> × {bn(SMS_COST_PER_MESSAGE)} ={' '}
              <span className="text-lg font-bold text-[#2c68d8]">{bn(totalCost)}</span> পয়েন্ট খরচ হবে
            </p>
            <button onClick={handleSend} disabled={noneSelected || insufficient || sending}
              className="flex items-center gap-2 rounded-xl bg-[#4284f1] px-6 py-2.5 font-semibold text-white shadow-md shadow-[#4284f1]/30 transition hover:bg-[#2c68d8] active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4284f1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
              {sending ? (
                <><span className="spinner h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />পাঠানো হচ্ছে…</>
              ) : (
                <><SendIcon className="h-4 w-4" />Send SMS</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* সফলতার মেসেজ */}
      {toast && (
        <div className="toast-in fixed bottom-24 left-1/2 z-40 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-2xl" role="status">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500"><CheckIcon className="h-4 w-4" /></span>
          {bn(toast.count)} জনকে SMS পাঠানো হয়েছে, {bn(toast.cost)} পয়েন্ট কেটে নেওয়া হয়েছে
        </div>
      )}

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} cost={SMS_COST_PER_MESSAGE} />}
    </div>
  );
};

export default PublicationOfResultsViaSMS;