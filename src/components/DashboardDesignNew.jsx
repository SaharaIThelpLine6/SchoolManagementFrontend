import React from 'react';
import SvgIcon from "../components/icons/SvgIcon";

const Dashboard = () => {
  const toolbarItems = [
    { name: 'Admission', icon: 'TbUserPlus', color: 'from-sky-400 to-cyan-500' },
    { name: 'New Staff', icon: 'TbUserCheck', color: 'from-emerald-400 to-teal-500' },
    { name: 'Finance', icon: 'TbWallet', color: 'from-amber-400 to-orange-500' },
    { name: 'Notice', icon: 'TbFileText', color: 'from-violet-400 to-purple-500' },
    { name: 'Exam', icon: 'TbBookOpen', color: 'from-rose-400 to-pink-500' },
    { name: 'Attendance', icon: 'TbCheckSquare', color: 'from-blue-400 to-indigo-500' },
    { name: 'Reports', icon: 'TbBarChart', color: 'from-fuchsia-400 to-pink-500' },
    { name: 'Phone Book', icon: 'TbPhone', color: 'from-lime-400 to-green-500' },
    { name: 'Sales', icon: 'TbShoppingCart', color: 'from-cyan-400 to-blue-500' },
  ];

  const statCards = [
    { title: 'মোট শিক্ষার্থী', value: '৫০০', subtitle: 'সকল সেশনের', icon: 'TbGraduationCap', accent: 'sky' },
    { title: 'মোট শিক্ষার্থী', value: '২০০', subtitle: 'চলতি সেশন', icon: 'TbUserGroup', accent: 'emerald' },
    { title: 'সক্রিয় শিক্ষার্থী', value: '১৫০', subtitle: 'চলতি সেশন', icon: 'TbUserCheck', accent: 'violet' },
    { title: 'নিষ্ক্রিয় শিক্ষার্থী', value: '৫০', subtitle: 'চলতি সেশন', icon: 'TbUserOff', accent: 'rose' },
    { title: 'মোট শিক্ষক/স্টাফ', value: '৫০', subtitle: 'সক্রিয়', icon: 'TbUserGroup', accent: 'indigo' },
    { title: 'দাতা সদস্য', value: '৫০', subtitle: 'এন্ট্রি হিসাবে', icon: 'TbHeartHandshake', accent: 'pink' },
    { title: 'মোট আয়', value: '********', subtitle: '০১/০৯/২০২৬', icon: 'TbCoin', accent: 'emerald' },
    { title: 'মোট ব্যয়', value: '********', subtitle: '০১/০৯/২০২৬', icon: 'TbReceipt', accent: 'orange' },
    { title: 'বকেয়া', value: '********', subtitle: 'শিক্ষার্থী ফি', icon: 'TbAlertCircle', accent: 'amber' },
    { title: 'আজকের উপস্থিত', value: '১০০', subtitle: 'শিক্ষার্থী', icon: 'TbCheckSquare', accent: 'teal' },
    { title: 'আজকের অনুপস্থিত', value: '৫০', subtitle: 'শিক্ষার্থী', icon: 'TbUserOff', accent: 'red' },
    { title: 'আজকের উপস্থিত', value: '৫০', subtitle: 'শিক্ষক', icon: 'TbUserCheck', accent: 'cyan' },
    { title: 'আজকের অনুপস্থিত', value: '৫০', subtitle: 'শিক্ষক', icon: 'TbUserOff', accent: 'slate' },
  ];

  // প্রতিটি accent এর জন্য স্মুথ গ্রেডিয়েন্ট কনফিগ
  const accentMap = {
    sky: {
      bar: 'bg-gradient-to-b from-sky-400 via-sky-500 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-sky-50 to-cyan-100',
      iconText: 'text-sky-500',
      title: 'text-sky-600',
      glow: 'group-hover:shadow-sky-200/50',
      ring: 'group-hover:ring-sky-200/60',
    },
    emerald: {
      bar: 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-500',
      iconBg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
      iconText: 'text-emerald-500',
      title: 'text-emerald-600',
      glow: 'group-hover:shadow-emerald-200/50',
      ring: 'group-hover:ring-emerald-200/60',
    },
    violet: {
      bar: 'bg-gradient-to-b from-violet-400 via-violet-500 to-purple-500',
      iconBg: 'bg-gradient-to-br from-violet-50 to-purple-100',
      iconText: 'text-violet-500',
      title: 'text-violet-600',
      glow: 'group-hover:shadow-violet-200/50',
      ring: 'group-hover:ring-violet-200/60',
    },
    rose: {
      bar: 'bg-gradient-to-b from-rose-400 via-rose-500 to-pink-500',
      iconBg: 'bg-gradient-to-br from-rose-50 to-pink-100',
      iconText: 'text-rose-500',
      title: 'text-rose-600',
      glow: 'group-hover:shadow-rose-200/50',
      ring: 'group-hover:ring-rose-200/60',
    },
    indigo: {
      bar: 'bg-gradient-to-b from-indigo-400 via-indigo-500 to-blue-500',
      iconBg: 'bg-gradient-to-br from-indigo-50 to-blue-100',
      iconText: 'text-indigo-500',
      title: 'text-indigo-600',
      glow: 'group-hover:shadow-indigo-200/50',
      ring: 'group-hover:ring-indigo-200/60',
    },
    pink: {
      bar: 'bg-gradient-to-b from-pink-400 via-pink-500 to-fuchsia-500',
      iconBg: 'bg-gradient-to-br from-pink-50 to-fuchsia-100',
      iconText: 'text-pink-500',
      title: 'text-pink-600',
      glow: 'group-hover:shadow-pink-200/50',
      ring: 'group-hover:ring-pink-200/60',
    },
    orange: {
      bar: 'bg-gradient-to-b from-orange-400 via-orange-500 to-amber-500',
      iconBg: 'bg-gradient-to-br from-orange-50 to-amber-100',
      iconText: 'text-orange-500',
      title: 'text-orange-600',
      glow: 'group-hover:shadow-orange-200/50',
      ring: 'group-hover:ring-orange-200/60',
    },
    amber: {
      bar: 'bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-500',
      iconBg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
      iconText: 'text-amber-500',
      title: 'text-amber-600',
      glow: 'group-hover:shadow-amber-200/50',
      ring: 'group-hover:ring-amber-200/60',
    },
    teal: {
      bar: 'bg-gradient-to-b from-teal-400 via-teal-500 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-teal-50 to-cyan-100',
      iconText: 'text-teal-500',
      title: 'text-teal-600',
      glow: 'group-hover:shadow-teal-200/50',
      ring: 'group-hover:ring-teal-200/60',
    },
    red: {
      bar: 'bg-gradient-to-b from-red-400 via-red-500 to-rose-500',
      iconBg: 'bg-gradient-to-br from-red-50 to-rose-100',
      iconText: 'text-red-500',
      title: 'text-red-600',
      glow: 'group-hover:shadow-red-200/50',
      ring: 'group-hover:ring-red-200/60',
    },
    cyan: {
      bar: 'bg-gradient-to-b from-cyan-400 via-cyan-500 to-sky-500',
      iconBg: 'bg-gradient-to-br from-cyan-50 to-sky-100',
      iconText: 'text-cyan-500',
      title: 'text-cyan-600',
      glow: 'group-hover:shadow-cyan-200/50',
      ring: 'group-hover:ring-cyan-200/60',
    },
    slate: {
      bar: 'bg-gradient-to-b from-slate-400 via-slate-500 to-gray-500',
      iconBg: 'bg-gradient-to-br from-slate-50 to-gray-100',
      iconText: 'text-slate-500',
      title: 'text-slate-600',
      glow: 'group-hover:shadow-slate-200/50',
      ring: 'group-hover:ring-slate-200/60',
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 font-hind">
      {/* ==== Background mesh glow (advanced) ==== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      {/* ================= Toolbar ================= */}
      <div className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.1)] sticky top-0">
        <div className="px-4 py-3 flex overflow-x-auto gap-4 scrollbar-hide">
          {toolbarItems.map((item, index) => (
            <button
              key={index}
              className="group flex flex-col items-center justify-center min-w-[76px] cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            >
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg shadow-gray-300/40 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                <SvgIcon name={item.icon} size={20} />
              </div>
              <span className="text-[11px] text-gray-600 mt-1.5 font-medium group-hover:text-gray-900 transition-colors">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= Main Content ================= */}
      <div className="relative z-10 p-4 md:p-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">ড্যাশবোর্ড</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">আজকের সংক্ষিপ্ত পরিসংখ্যান</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-600 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/70 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            লাইভ আপডেট
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
          {statCards.map((card, index) => {
            const a = accentMap[card.accent] || accentMap.sky;

            return (
              <div
                key={index}
                className={`group relative bg-white/85 backdrop-blur-md rounded-2xl border border-white/70 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)] overflow-hidden ring-1 ring-transparent ${a.ring} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${a.glow}`}
              >
                {/* ==== Left gradient accent bar (ইমেজের মতো) ==== */}
                <div className={`absolute top-0 left-0 w-2 h-full ${a.bar}`} />

                {/* Soft corner glow */}
                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full ${a.iconBg} opacity-70 blur-2xl group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Card Body */}
                <div className="relative flex items-center gap-4 p-5 pl-6">
                  {/* Icon Circle with gradient */}
                  <div className={`w-14 h-14 rounded-full ${a.iconBg} flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <SvgIcon name={card.icon} size={28} className={a.iconText} />
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col min-w-0">
                    <h3 className={`text-sm font-semibold ${a.title} truncate`}>
                      {card.title}
                    </h3>
                    <div className="text-2xl font-extrabold text-gray-800 leading-tight tracking-tight">
                      {card.value}
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                {/* Bottom gradient border on hover */}
                <div className={`h-0.5 w-full ${a.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;