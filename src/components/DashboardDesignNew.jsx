import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SvgIcon from "../components/icons/SvgIcon";
import { useGetStudentCountInfoQuery } from '../features/class/classQuerySlice';
import useTranslate from '../utils/Translate';
import { useGetPaymentTransactionReportQuery } from '../features/feeCollection/feeCollectionSlice';
import { useGetStudentAttendanceTodayDashboardQuery } from '../features/student/studentQuerySlice';
import { useGetTeacherAttendanceTodayDashboardQuery } from '../features/teachers/teachersSlice';

/* ---------- Bangla Number Helper ---------- */
const toBanglaNumber = (value) => {
  if (value === null || value === undefined || value === '') return '০';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(value).replace(/\d/g, (d) => banglaDigits[Number(d)]);
};

const formatBanglaNumber = (value = 0) => {
  const num = Number(value);
  if (isNaN(num)) return '০';
  return toBanglaNumber(num.toLocaleString('en-US'));
};

/* ---------- Date Helper ---------- */
const getTodayBanglaDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const formatted = `${day}/${month}/${year}`;
  return toBanglaNumber(formatted);
};

/* ---------- Skeleton Card ---------- */
const SkeletonCard = () => (
  <div className="relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/70 shadow-sm overflow-hidden animate-pulse">
    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-slate-200 to-slate-300" />
    <div className="relative flex items-center gap-4 p-5 pl-6">
      <div className="w-14 h-14 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-6 w-16 bg-slate-300 rounded" />
        <div className="h-3 w-20 bg-slate-200 rounded" />
      </div>
    </div>
  </div>
);

/* ---------- Skeleton Toolbar ---------- */
const ToolbarSkeleton = () => (
  <div className="flex gap-4 px-4 py-3">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-1.5 min-w-[76px] animate-pulse">
        <div className="w-11 h-11 rounded-2xl bg-slate-200" />
        <div className="h-2 w-12 bg-slate-200 rounded" />
      </div>
    ))}
  </div>
);

/* ---------- Refresh Button ---------- */
const RefreshButton = ({ onClick, isFetching }) => (
  <button
    onClick={onClick}
    disabled={isFetching}
    className="group flex items-center gap-2 text-xs font-medium text-gray-600 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/70 shadow-sm hover:bg-white hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    title="রিফ্রেশ করুন"
  >
    <svg
      className={`w-4 h-4 transition-transform duration-500 ${isFetching ? 'animate-spin text-emerald-500' : 'group-hover:rotate-180'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
    <span className="hidden md:inline">{isFetching ? 'রিফ্রেশ হচ্ছে...' : 'রিফ্রেশ'}</span>
  </button>
);

/* ---------- Main Component ---------- */
const DashboardDesignNew = () => {
  const t = useTranslate();

  const [birthDate] = useState(new Date());
  const formattedDate = birthDate.toISOString().split("T")[0];

  const [startDate] = useState(new Date());
  const [endDate] = useState(new Date());

  const formatDate = (date) => new Date(date).toISOString().split("T")[0];

  const liveDate = getTodayBanglaDate();

  /* ---------- Queries ---------- */
  const {
    data: paymentTransactionData,
    isLoading: paymentLoading,
    isFetching: paymentFetching,
    refetch: refetchPayment,
  } = useGetPaymentTransactionReportQuery(
    { startDate: formatDate(startDate), endDate: formatDate(endDate) },
    { skip: false }
  );

  const {
    data: studentData,
    isLoading: studentLoading,
    isFetching: studentFetching,
    refetch: refetchStudent,
  } = useGetStudentCountInfoQuery();

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    isFetching: attendanceFetching,
    refetch: refetchAttendance,
  } = useGetStudentAttendanceTodayDashboardQuery({ date: formattedDate });

  const {
    data: attendanceTeacherData,
    isLoading: attendanceTeacherLoading,
    isFetching: attendanceTeacherFetching,
    refetch: refetchTeacherAttendance,
  } = useGetTeacherAttendanceTodayDashboardQuery({ date: formattedDate });

  const isFetchingAny =
    paymentFetching || studentFetching || attendanceFetching || attendanceTeacherFetching;
  const isLoadingAny =
    paymentLoading || studentLoading || attendanceLoading || attendanceTeacherLoading;

  /* ---------- Refresh All ---------- */
  const handleRefreshAll = useCallback(() => {
    refetchPayment();
    refetchStudent();
    refetchAttendance();
    refetchTeacherAttendance();
  }, [refetchPayment, refetchStudent, refetchAttendance, refetchTeacherAttendance]);

  /* ---------- Toolbar Items ---------- */
  const toolbarItems = [
    { name: t('Student Admission'), icon: 'TbUserPlus', color: 'from-sky-400 to-cyan-500', link: '/dashboard/students' },
    { name: t('Add Teacher'), icon: 'TbUserCheck', color: 'from-emerald-400 to-teal-500', link: '/dashboard/teacherinfo' },
    { name: t("Deposit Cost"), icon: 'TbWallet', color: 'from-amber-400 to-orange-500', link: '/dashboard/accounting' },
    { name: t('Notice'), icon: 'TbFileText', color: 'from-violet-400 to-purple-500', link: '/dashboard/parent-panel/user-notice' },
    { name: t('SMS'), icon: 'SubSms', color: 'from-violet-400 to-purple-500', link: '/dashboard/general-info/sms' },
    { name: t("Result Entry"), icon: 'TbBookOpen', color: 'from-rose-400 to-pink-500', link: '/dashboard/result' },
    { name: t('Student Attendance Report'), icon: 'TbCheckSquare', color: 'from-blue-400 to-indigo-500', link: '/dashboard/parent-panel/user-attendance' },
    { name: t('Fee Collection'), icon: 'TbShoppingCart', color: 'from-cyan-400 to-blue-500', link: '/dashboard/accounting/student-fee-collection' },
  ];

  /* ---------- Stat Cards (with Bangla numbers + live date) ---------- */
  const statCards = [
    {
      title: 'মোট শিক্ষার্থী',
      value: formatBanglaNumber(studentData?.totalAllSessionStudent),
      subtitle: 'সকল সেশনের',
      icon: 'TbGraduationCap',
      accent: 'sky',
      loading: studentLoading,
    },
    {
      title: 'মোট শিক্ষার্থী',
      value: formatBanglaNumber(studentData?.runningSession?.totalStudent),
      subtitle: 'চলতি সেশন',
      icon: 'TbUserGroup',
      accent: 'emerald',
      loading: studentLoading,
    },
    {
      title: 'সক্রিয় শিক্ষার্থী',
      value: formatBanglaNumber(studentData?.runningSession?.activeStudent),
      subtitle: 'চলতি সেশন',
      icon: 'TbUserCheck',
      accent: 'violet',
      loading: studentLoading,
    },
    {
      title: 'নিষ্ক্রিয় শিক্ষার্থী',
      value: formatBanglaNumber(studentData?.runningSession?.inactiveStudent),
      subtitle: 'চলতি সেশন',
      icon: 'TbUserOff',
      accent: 'rose',
      loading: studentLoading,
    },
    {
      title: 'মোট শিক্ষক/স্টাফ',
      value: formatBanglaNumber(studentData?.totalStaff),
      subtitle: 'সক্রিয়',
      icon: 'TbUserGroup',
      accent: 'indigo',
      loading: studentLoading,
    },
    {
      title: 'দাতা সদস্য',
      value: formatBanglaNumber(studentData?.totalDonor),
      subtitle: 'এন্ট্রি হিসাবে',
      icon: 'TbHeartHandshake',
      accent: 'pink',
      loading: studentLoading,
    },
    {
      title: 'মোট আয়',
      value: formatBanglaNumber(paymentTransactionData?.summary?.totalDr),
      subtitle: liveDate,
      icon: 'TbCoin',
      accent: 'emerald',
      loading: paymentLoading,
    },
    {
      title: 'মোট ব্যয়',
      value: formatBanglaNumber(paymentTransactionData?.summary?.totalCr),
      subtitle: liveDate,
      icon: 'TbReceipt',
      accent: 'orange',
      loading: paymentLoading,
    },
    {
      title: 'শিক্ষার্থীর ফি',
      value: formatBanglaNumber(paymentTransactionData?.summary?.studentFeeTotal),
      subtitle: liveDate,
      icon: 'TbAlertCircle',
      accent: 'blue',
      loading: paymentLoading,
    },
    {
      title: 'দান অনুদান',
      value: formatBanglaNumber(paymentTransactionData?.summary?.donationTotal),
      subtitle: liveDate,
      icon: 'TbHeartHandshake',
      accent: 'purple',
      loading: paymentLoading,
    },
    {
      title: 'আজকের উপস্থিত',
      value: formatBanglaNumber(attendanceData?.summary?.totalPresent ?? 0),
      subtitle: `শিক্ষার্থী • ${liveDate}`,
      icon: 'TbCheckSquare',
      accent: 'teal',
      loading: attendanceLoading,
    },
    {
      title: 'আজকের অনুপস্থিত',
      value: formatBanglaNumber(attendanceData?.summary?.totalAbsent ?? 0),
      subtitle: `শিক্ষার্থী • ${liveDate}`,
      icon: 'TbUserOff',
      accent: 'red',
      loading: attendanceLoading,
    },
    {
      title: 'আজকের উপস্থিত',
      value: formatBanglaNumber(attendanceTeacherData?.teacher?.present ?? 0),
      subtitle: `শিক্ষক • ${liveDate}`,
      icon: 'TbUserCheck',
      accent: 'cyan',
      loading: attendanceTeacherLoading,
    },
    {
      title: 'আজকের অনুপস্থিত',
      value: formatBanglaNumber(attendanceTeacherData?.teacher?.absent ?? 0),
      subtitle: `শিক্ষক • ${liveDate}`,
      icon: 'TbUserOff',
      accent: 'slate',
      loading: attendanceTeacherLoading,
    },
  ];

  /* ---------- Accent Map ---------- */
  const accentMap = {
    sky: { bar: 'bg-gradient-to-b from-sky-400 via-sky-500 to-cyan-500', iconBg: 'bg-gradient-to-br from-sky-50 to-cyan-100', iconText: 'text-sky-500', title: 'text-sky-600', glow: 'group-hover:shadow-sky-200/50', ring: 'group-hover:ring-sky-200/60' },
    emerald: { bar: 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-500', iconBg: 'bg-gradient-to-br from-emerald-50 to-teal-100', iconText: 'text-emerald-500', title: 'text-emerald-600', glow: 'group-hover:shadow-emerald-200/50', ring: 'group-hover:ring-emerald-200/60' },
    violet: { bar: 'bg-gradient-to-b from-violet-400 via-violet-500 to-purple-500', iconBg: 'bg-gradient-to-br from-violet-50 to-purple-100', iconText: 'text-violet-500', title: 'text-violet-600', glow: 'group-hover:shadow-violet-200/50', ring: 'group-hover:ring-violet-200/60' },
    rose: { bar: 'bg-gradient-to-b from-rose-400 via-rose-500 to-pink-500', iconBg: 'bg-gradient-to-br from-rose-50 to-pink-100', iconText: 'text-rose-500', title: 'text-rose-600', glow: 'group-hover:shadow-rose-200/50', ring: 'group-hover:ring-rose-200/60' },
    indigo: { bar: 'bg-gradient-to-b from-indigo-400 via-indigo-500 to-blue-500', iconBg: 'bg-gradient-to-br from-indigo-50 to-blue-100', iconText: 'text-indigo-500', title: 'text-indigo-600', glow: 'group-hover:shadow-indigo-200/50', ring: 'group-hover:ring-indigo-200/60' },
    pink: { bar: 'bg-gradient-to-b from-pink-400 via-pink-500 to-fuchsia-500', iconBg: 'bg-gradient-to-br from-pink-50 to-fuchsia-100', iconText: 'text-pink-500', title: 'text-pink-600', glow: 'group-hover:shadow-pink-200/50', ring: 'group-hover:ring-pink-200/60' },
    orange: { bar: 'bg-gradient-to-b from-orange-400 via-orange-500 to-amber-500', iconBg: 'bg-gradient-to-br from-orange-50 to-amber-100', iconText: 'text-orange-500', title: 'text-orange-600', glow: 'group-hover:shadow-orange-200/50', ring: 'group-hover:ring-orange-200/60' },
    amber: { bar: 'bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-500', iconBg: 'bg-gradient-to-br from-amber-50 to-yellow-100', iconText: 'text-amber-500', title: 'text-amber-600', glow: 'group-hover:shadow-amber-200/50', ring: 'group-hover:ring-amber-200/60' },
    teal: { bar: 'bg-gradient-to-b from-teal-400 via-teal-500 to-cyan-500', iconBg: 'bg-gradient-to-br from-teal-50 to-cyan-100', iconText: 'text-teal-500', title: 'text-teal-600', glow: 'group-hover:shadow-teal-200/50', ring: 'group-hover:ring-teal-200/60' },
    red: { bar: 'bg-gradient-to-b from-red-400 via-red-500 to-rose-500', iconBg: 'bg-gradient-to-br from-red-50 to-rose-100', iconText: 'text-red-500', title: 'text-red-600', glow: 'group-hover:shadow-red-200/50', ring: 'group-hover:ring-red-200/60' },
    cyan: { bar: 'bg-gradient-to-b from-cyan-400 via-cyan-500 to-sky-500', iconBg: 'bg-gradient-to-br from-cyan-50 to-sky-100', iconText: 'text-cyan-500', title: 'text-cyan-600', glow: 'group-hover:shadow-cyan-200/50', ring: 'group-hover:ring-cyan-200/60' },
    slate: { bar: 'bg-gradient-to-b from-slate-400 via-slate-500 to-gray-500', iconBg: 'bg-gradient-to-br from-slate-50 to-gray-100', iconText: 'text-slate-500', title: 'text-slate-600', glow: 'group-hover:shadow-slate-200/50', ring: 'group-hover:ring-slate-200/60' },
    blue: { bar: 'bg-gradient-to-b from-blue-400 via-blue-500 to-indigo-500', iconBg: 'bg-gradient-to-br from-blue-50 to-indigo-100', iconText: 'text-blue-500', title: 'text-blue-600', glow: 'group-hover:shadow-blue-200/50', ring: 'group-hover:ring-blue-200/60' },
    purple: { bar: 'bg-gradient-to-b from-purple-400 via-purple-500 to-violet-500', iconBg: 'bg-gradient-to-br from-purple-50 to-violet-100', iconText: 'text-purple-500', title: 'text-purple-600', glow: 'group-hover:shadow-purple-200/50', ring: 'group-hover:ring-purple-200/60' },
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 font-SolaimanLipi">
      {/* Background mesh glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      {/* ================= Toolbar ================= */}
      <div className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.1)] sticky top-0">
        {isLoadingAny ? (
          <ToolbarSkeleton />
        ) : (
          <div className="px-4 py-3 flex overflow-x-auto gap-4 scrollbar-hide">
            {toolbarItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="group flex flex-col items-center justify-center min-w-[76px] cursor-pointer transition-transform duration-300 hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg shadow-gray-300/40 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                  <SvgIcon name={item.icon} size={20} />
                </div>
                <span className="text-[11px] text-gray-600 mt-1.5 font-medium group-hover:text-gray-900 transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ================= Main Content ================= */}
      <div className="relative z-10 p-4 md:p-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">ড্যাশবোর্ড</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">আজকের সংক্ষিপ্ত পরিসংখ্যান</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-600 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/70 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${isFetchingAny ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              {isFetchingAny ? 'আপডেট হচ্ছে...' : 'লাইভ আপডেট'}
            </div>
            <RefreshButton onClick={handleRefreshAll} isFetching={isFetchingAny} />
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
          {statCards.map((card, index) => {
            if (card.loading) return <SkeletonCard key={index} />;
            const a = accentMap[card.accent] || accentMap.sky;

            return (
              <div
                key={index}
                className={`group relative bg-white/85 backdrop-blur-md rounded-2xl border border-white/70 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)] overflow-hidden ring-1 ring-transparent ${a.ring} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${a.glow}`}
              >
                {/* Left gradient accent bar */}
                <div className={`absolute top-0 left-0 w-2 h-full ${a.bar}`} />

                {/* Soft corner glow */}
                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full ${a.iconBg} opacity-70 blur-2xl group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Card Body */}
                <div className="relative flex items-center gap-4 p-5 pl-6">
                  <div className={`w-14 h-14 rounded-full ${a.iconBg} flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <SvgIcon name={card.icon} size={28} className={a.iconText} />
                  </div>

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

export default DashboardDesignNew;