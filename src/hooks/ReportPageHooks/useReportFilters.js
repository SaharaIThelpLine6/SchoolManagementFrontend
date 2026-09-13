// hooks/useReportFilters.js
//
// ReportBuilder এর ফিল্টার লজিক এখান থেকে বের করে আনা হলো, যাতে
// BanglaAttendence-এর মতো অন্য যেকোনো রিপোর্টও একই ফিল্টার + লাইভ ডাটা
// (session/subClass/gender/admissionType/residential/userStatus/district/
// thana অনুযায়ী ফিল্টার করা student_report_list) ব্যবহার করতে পারে।
import { useMemo, useState } from "react";
import { useGetResidentialQuery } from "../../features/settings/settingsQuerySlice";
import {
  useGetReportFiltersQuery,
  useGetStudentReportListQuery,
} from "../../features/reports/reportQuerySlice";

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
    BookLine: "3",
  };
}

export default function useReportFilters() {
  const [filters, setFilters] = useState(defaultReportFilters());

  const { data: filterOptions } = useGetReportFiltersQuery();
  const sessions = filterOptions?.sessions || [];
  const subClasses = filterOptions?.subClasses || [];
  const districts = filterOptions?.districts || [];
  const thanas = filterOptions?.thanas || [];

  // Residential (আবাসিক/অনাবাসিক/ডে-কেয়ার/নাইট কেয়ার/উভয়)
  const { data: residentialData = [] } = useGetResidentialQuery();

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

  const { data: filteredData = [], isFetching: dataLoading } = useGetStudentReportListQuery(queryParams);

  const resetFilters = () => setFilters(defaultReportFilters());

  return {
    filters,
    setFilters,
    resetFilters,
    sessions,
    subClasses,
    districts,
    thanas,
    residentialData,
    filteredData,
    dataLoading,
  };
}
