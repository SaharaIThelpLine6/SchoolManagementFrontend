// hooks/ReportPageHooks/useReportFilters.js
//
// 🔴 ১) ফিল্টার না দিলে ডাটা লোড হবে না:
//    requiredFilters (যেমন শিক্ষাবর্ষ + জামাত) পূরণ না হওয়া পর্যন্ত RTK Query
//    `skip` থাকে — ব্যাকএন্ডে কোনো কল-ই যায় না।
//
// 🟢 ২) ফিল্টার মনে থাকবে:
//    সব রিপোর্ট একই ফিল্টার শেয়ার করে এবং localStorage এ সেভ থাকে। তাই
//    ১ নং রিপোর্টে ফিল্টার করে ২ নং রিপোর্টে গেলে আবার সেট করতে হবে না,
//    পেজ রিফ্রেশ করলেও ফিল্টার থেকে যাবে।

import { useEffect, useMemo, useState } from "react";
import { useGetResidentialQuery } from "../../features/settings/settingsQuerySlice";
import {
  useGetReportFiltersQuery,
  useGetStudentReportListQuery,
} from "../../features/reports/reportQuerySlice";

export const REPORT_FILTERS_STORAGE_KEY = "studentReport_filters";

export function defaultReportFilters() {
  return {
    SessionID: "",
    SubClassID: "",
    gender: "",
    admissionType: "",
    ResidentialStatusId: "",
    is_active: "",
    DistrictID: "",
    permanentPoliceStationID: "",
    // 🔹 ক্লায়েন্ট-সাইড অপশন (ব্যাকএন্ডে যায় না)
    language: "bangla", // 🌐 গ্লোবাল ভাষা — বাংলা / আরবি
    BookLine: "3",      // কয়টি বিষয়ের খাতা — BanglaAttendenceSubjectWari
    IsActive: "",       // ভর্তির আগে/পরে — AdmissionFormPdf
  };
}

// ------- localStorage হেল্পার -------
const readStoredFilters = () => {
  const base = defaultReportFilters();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(REPORT_FILTERS_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return base;

    // শুধু চেনা key গুলোই নেওয়া হবে — পুরনো/ভুল ডাটা ঢুকবে না
    const out = { ...base };
    Object.keys(base).forEach((key) => {
      const value = parsed[key];
      if (typeof value === "string" || typeof value === "number") {
        out[key] = String(value);
      }
    });
    return out;
  } catch {
    return base;
  }
};

const writeStoredFilters = (filters) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REPORT_FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    /* ignore */
  }
};

export default function useReportFilters(options = {}) {
  const { requiredFilters = ["SessionID", "SubClassID"] } = options;

  // 🟢 আগের ফিল্টার থাকলে সেটা দিয়েই শুরু
  const [filters, setFilters] = useState(readStoredFilters);

  // 🟢 ফিল্টার বদলালেই সেভ
  useEffect(() => {
    writeStoredFilters(filters);
  }, [filters]);

  // ড্রপডাউনের অপশন (হালকা ডাটা — এটা সবসময় লোড হয়)
  const { data: filterOptions, isLoading: optionsLoading } = useGetReportFiltersQuery();
  const sessions = filterOptions?.sessions || [];
  const subClasses = filterOptions?.subClasses || [];
  const districts = filterOptions?.districts || [];
  const thanas = filterOptions?.thanas || [];

  // Residential (আবাসিক/অনাবাসিক/ডে-কেয়ার/নাইট কেয়ার/উভয়)
  const { data: residentialData = [] } = useGetResidentialQuery();

  // 🔹 কোন কোন ফিল্টার এখনো বাকি
  const missingFilters = requiredFilters.filter((key) => !filters[key]);
  const isReady = missingFilters.length === 0;

  const queryParams = useMemo(
    () => ({
      SessionID: filters.SessionID,
      SubClassID: filters.SubClassID,
      gender: filters.gender,
      NewOldId: filters.admissionType,
      ResidentialStatusId: filters.ResidentialStatusId,
      is_active: filters.is_active,
      DistrictID: filters.DistrictID,
      permanentPoliceStationID: filters.permanentPoliceStationID,
    }),
    [filters]
  );

  // 🔴 skip — ফিল্টার না দিলে ব্যাকএন্ডে কল যাবে না
  const {
    data: fetchedData,
    isFetching,
    isLoading,
    isError,
    refetch,
  } = useGetStudentReportListQuery(queryParams, { skip: !isReady });

  const filteredData = isReady && Array.isArray(fetchedData) ? fetchedData : [];
  const dataLoading = isReady && (isFetching || isLoading);

  const resetFilters = () => setFilters(defaultReportFilters());

  return {
    filters,
    setFilters,
    resetFilters,
    requiredFilters,
    missingFilters,
    isReady,
    sessions,
    subClasses,
    districts,
    thanas,
    residentialData,
    optionsLoading,
    filteredData,
    dataLoading,
    isError,
    refetch,
  };
}
