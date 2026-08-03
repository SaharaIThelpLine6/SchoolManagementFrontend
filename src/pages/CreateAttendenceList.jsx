import { useMemo, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../components/Button/Button";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import useTranslate from "../utils/Translate";

import { useGetUserTypesQuery } from "../features/userType/userTypeSlice";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import SvgIcon from "../components/icons/SvgIcon";
import { useGetClassListQuery, useGetSubClassListQuery } from "../features/class/classQuerySlice";
import { useGetAllUserForAttendancesQuery, useUsersListCreateMutation, useGetAllUserListAttendancesQuery } from "../features/attendance/attendanceSlice";
import { useGetDesignationQuery } from "../features/teachers/teachersSlice";

// Stable references so default fallbacks don't create a NEW array
// on every render (that new reference was re-triggering the
// useEffect below on every single render -> infinite update loop).
const EMPTY_ARRAY = [];

const CreateAttendenceList = ({ pageTitle }) => {
  const translate = useTranslate();

  const method = useForm({
    defaultValues: {
      UserTypeID: "",
      UserCode: "",
      SessionID: "",
      SubClassID: "",
    },
  });
  const [selectedClass, setSelectedClass] = useState("");

  console.log(selectedClass, "selectedClass");

  const { setValue, reset, watch } = method;
  const [UserTypeID, SessionID, SubClassID] = watch(["UserTypeID", "SessionID", "SubClassID"]);

  const shouldSkip =
    !UserTypeID ||
    (Number(UserTypeID) === 1 && !SessionID);

  const {
    data = EMPTY_ARRAY,
    isLoading,
    error,
  } = useGetAllUserForAttendancesQuery(
    {
      sessionId: SessionID,
      subClassId: SubClassID,
      userTypeId: UserTypeID,
    },
    {
      skip: shouldSkip,
    }
  );
  console.log(data, "data test")

  const teacherShouldSkip =
    !UserTypeID ||
    (Number(UserTypeID) === 1 && !SessionID);

  const { data: userListData = EMPTY_ARRAY, isLoading: attendanceListLoading } =
    useGetAllUserListAttendancesQuery(
      {
        classId: selectedClass,
        userTypeId: UserTypeID,
        sessionId: SessionID,
      },
      {
        skip: teacherShouldSkip,
      }
    );

  console.log(userListData, "userListData")

  const [usersListCreate, { isLoading: isCreateLoading }] = useUsersListCreateMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classData } = useGetClassListQuery();
  const { data: userType = [] } = useGetUserTypesQuery();
  const { data: designationData = [] } = useGetDesignationQuery();

  /* ----------------------- transfer-panel state ----------------------- */
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");

  // LEFT — locally editable copy of the "available" query result
  const [userData, setUserData] = useState([]);

  // RIGHT — locally editable copy of the "selected/already listed" query result
  const [selectedData, setSelectedData] = useState([]);

  // Sync LEFT from query response only when the response actually changes.
  useEffect(() => {
    console.log("data:", data);
    setUserData(data ?? []);
  }, [data]);

  // Sync RIGHT from query response only when the response actually changes.
  useEffect(() => {
    setSelectedData(userListData);
  }, [userListData]);

  const filteredAvailable = useMemo(() => {
    if (!searchLeft.trim()) return userData;

    const query = searchLeft.trim().toLowerCase();

    return userData.filter(
      (s) =>
        s.UserName?.toLowerCase().includes(query) ||
        String(s.UserCode)?.includes(query) ||
        s.Mobile1?.includes(query)
    );
  }, [userData, searchLeft]);

  const filteredSelected = useMemo(() => {
    if (!searchRight.trim()) return selectedData;

    const query = searchRight.trim().toLowerCase();

    return selectedData.filter(
      (s) =>
        s.UserName?.toLowerCase().includes(query) ||
        String(s.UserCode)?.includes(query) ||
        s.Mobile1?.includes(query)
    );
  }, [selectedData, searchRight]);

  // MIDDLE button: move ALL left students to right in one click
  const handleTransferAll = async () => {
    if (userData.length === 0) {
      Swal.fire({
        icon: "info",
        title: translate("তালিকা খালি"),
        text: translate("বাম পাশে স্থানান্তরের জন্য কোনো শিক্ষার্থী নেই।"),
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const payload = {
      students: userData.map((s) => ({
        UserID: s.UserID,
        UserTypeID: s.UserTypeID,
        SessionID: s.SessionID,
        ClassID: s.ClassID,
      })),
    };

    try {
      await usersListCreate(payload).unwrap();
      // usersListCreate mutation should invalidate the tag that
      // useGetAllUserListAttendancesQuery listens to, so userListData
      // will refetch automatically and selectedData will re-sync via
      // the useEffect above. We just clear the left pool locally.
      setUserData([]);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: translate("সমস্যা হয়েছে"),
        text: translate("তালিকা তৈরি করা যায়নি, আবার চেষ্টা করুন।"),
        confirmButtonColor: "#2563eb",
      });
    }
  };

  // per-row icon on LEFT: skip / delete a student from the left pool entirely (no transfer)
  const handleSkipOne = (student) => {
    setUserData((prev) => prev.filter((s) => s.UserID !== student.UserID));
  };



  return (
    <FormProvider {...method}>
      <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-black shrink-0 2xl:mr-6">
          {translate('User Attendance List')}
        </h2>
        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg my-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <DefaultSelect
              label={translate("User Type")}
              options={userType}
              valueField="ID"
              nameField="TypeName"
              registerKey="UserTypeID"
              placeholder={translate("Select User Type")}
            />
            {/* {
              UserTypeID === "2" && (
                <DefaultSelect
                  label={translate("Designation")}
                  options={designationData ?? []}
                  valueField="DNID"
                  nameField="Designation"
                  registerKey="DNID"
                />
              )
            } */}
            {
              UserTypeID !== "2" && (

                <DefaultSelect
                  label={translate("Session")}
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                />
              )
            }
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Dual transfer panel — LEFT (browse/select) -> RIGHT (selected) */}
        {/* ------------------------------------------------------------- */}
        <div className="flex flex-col lg:flex-row items-stretch gap-3">
          {/* LEFT — All / available students */}
          <div className="flex-[1.4] min-w-0 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between bg-blue-500 px-4 py-2.5 gap-3">
              <div className="flex items-center gap-2 shrink-0">
                {/* <SvgIcon name="list" className="h-4 w-4 text-blue-100" /> */}
                <span className="text-[13px] font-semibold text-white whitespace-nowrap">
                  {translate("সকল শিক্ষার্থী")}
                </span>
                <span className="rounded-full bg-blue-700 px-2 py-0.5 text-[11px] font-bold text-white">
                  {filteredAvailable.length}
                </span>
              </div>

              <div className="relative w-full max-w-[240px]">
                <SvgIcon
                  name="FaSearch"
                  className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-100"
                />

                <input
                  type="text"
                  value={searchLeft}
                  onChange={(e) => setSearchLeft(e.target.value)}
                  placeholder={translate("নাম, আইডি বা মোবাইল দিয়ে খুঁজুন")}
                  className="w-full rounded-md bg-blue-600 border border-blue-400 pl-8 pr-2 py-1.5 text-[12px] text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                />
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <div className="max-h-[420px] overflow-y-auto">
                <table className="min-w-[950px] w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-blue-50 border-b border-blue-100 text-blue-700 text-[12px]">
                      <th className="px-2 py-2 text-center whitespace-nowrap">
                        {translate("অ্যাকশন")}
                      </th>

                      <th className="px-2 py-2 text-left whitespace-nowrap">
                        {translate("আইডি")}
                      </th>
                      <th className="px-2 py-2 text-left whitespace-nowrap">
                        {translate(`${UserTypeID === "1" ? "শিক্ষার্থীর নাম" : "শিক্ষকের নাম"}`)}
                      </th>
                      {
                        UserTypeID === "1" && (
                          <th className="px-2 py-2 text-left whitespace-nowrap">
                            {translate("পিতার নাম")}
                          </th>
                        )
                      }
                      <th className="px-2 py-2 text-left whitespace-nowrap">
                        {translate("নাম্বার")}
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {filteredAvailable.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                            <p className="text-[13px]">
                              {translate("কোনো ফলাফল পাওয়া যায়নি")}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAvailable.map((s, idx) => (
                        <tr
                          key={s.AdmissionID ?? s.UserID}
                          className={`border-b border-slate-100 transition-colors ${idx % 2 === 0
                            ? "bg-white hover:bg-slate-50"
                            : "bg-slate-50 hover:bg-slate-100"
                            }`}
                        >
                          <td className="px-2 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSkipOne(s)}
                                title={translate("এই শিক্ষার্থীকে বাদ দিন")}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                              >
                                <SvgIcon name="FaTrash" className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>

                          <td className="px-2 py-2 text-slate-500 whitespace-nowrap">
                            {s.UserCode}
                          </td>

                          <td className="px-2 py-2 font-SolaimanLipi text-slate-800 whitespace-nowrap">
                            {s.UserName}
                          </td>
                          {
                            UserTypeID === "1" && (
                              <td className="px-2 py-2 font-SolaimanLipi text-slate-700 whitespace-nowrap">
                                {s.FatherName}
                              </td>
                            )}

                          <td className="px-2 py-2 text-slate-500 whitespace-nowrap">
                            {s.Mobile1}
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* MIDDLE — transfer control (moves ALL left students to right) */}
          <div className="flex lg:flex-col items-center justify-center gap-2 py-2">
            <button
              type="button"
              onClick={handleTransferAll}
              disabled={filteredAvailable.length === 0 || isCreateLoading}
              className={`group flex items-center justify-center h-11 w-11 lg:h-12 lg:w-12 rounded-full shadow-md transition-all duration-200 ${filteredAvailable.length === 0 || isCreateLoading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95"
                }`}
              title={translate("সকল শিক্ষার্থীকে যোগ করুন")}
            >
              <span className="text-lg font-bold tracking-tighter">&gt;&gt;&gt;</span>
            </button>
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap text-center">
              {translate("সকল যোগ করুন")}
            </span>
          </div>

          {/* RIGHT — Selected / already listed students (from userListData) */}
          <div className="flex-1 min-w-0 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between bg-blue-500 px-4 py-2.5 gap-3">
              <div className="flex items-center gap-2 shrink-0">
                {/* <SvgIcon name="users" className="h-4 w-4 text-blue-100" /> */}
                <span className="text-[13px] font-semibold text-white whitespace-nowrap">
                  {translate("নির্বাচিত শিক্ষার্থী")}
                </span>
                <span className="rounded-full bg-blue-700 px-2 py-0.5 text-[11px] font-bold text-white">
                  {filteredSelected.length}
                </span>
              </div>
              {
                UserTypeID === "1" && (
                  <div className="relative w-full max-w-[220px]">
                    <div className="flex items-center gap-2 w-full">
                      {/* Class Select */}
                      <div className="w-[160px]">
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full rounded-md bg-blue-600 border border-blue-400 px-2 py-1.5 text-[12px] text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                        >
                          <option value="" className="text-black">
                            {translate("সকল শ্রেণি")}
                          </option>

                          {classData?.map((item) => (
                            <option
                              key={item.ClassID}
                              value={item.ClassID}
                              className="text-black"
                            >
                              {item.ClassName}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  </div>
                )}
              <div className="relative w-full max-w-[220px]">
                <SvgIcon
                  name="FaSearch"
                  className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-100"
                />
                <input
                  type="text"
                  value={searchRight}
                  onChange={(e) => setSearchRight(e.target.value)}
                  placeholder={translate("নাম, আইডি বা মোবাইল দিয়ে খুঁজুন")}
                  className="w-full rounded-md bg-blue-600 border border-blue-400 pl-8 pr-2 py-1.5 text-[12px] text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                />
              </div>

            </div>

            <div className="overflow-x-auto">
              <div className="max-h-[420px] overflow-y-auto">
                <table className="min-w-[700px] w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-blue-50">
                    <tr className="border-b border-blue-100 text-[12px] font-bold text-blue-700">
                      {/* <th className="px-2 py-2 text-center whitespace-nowrap">
                        {translate("অ্যাকশন")}
                      </th> */}
                      <th className="px-2 py-2 text-left whitespace-nowrap">
                        {translate("আইডি")}
                      </th>
                      <th className="px-2 py-2 text-left whitespace-nowrap">
                        {translate(`${UserTypeID === "1" ? "শিক্ষার্থীর নাম" : "শিক্ষকের নাম"}`)}
                      </th>
                      {
                        UserTypeID === "1" && (
                          <th className="px-2 py-2 text-left whitespace-nowrap">
                            {translate("পিতার নাম")}
                          </th>
                        )
                      }
                      {
                        UserTypeID === "1" && (
                          <th className="px-2 py-2 text-left whitespace-nowrap">
                            {translate("ক্লাস")}
                          </th>
                        )
                      }

                      <th className="px-2 py-2 text-left whitespace-nowrap">
                        {translate("মোবাইল")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSelected.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                            {/* <SvgIcon name="inbox" className="h-8 w-8" /> */}
                            <p className="text-[13px]">
                              {selectedData.length === 0
                                ? translate("কোনো শিক্ষার্থী নির্বাচিত হয়নি")
                                : translate("কোনো ফলাফল পাওয়া যায়নি")}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSelected.map((s, idx) => (
                        <tr
                          key={s.AdmissionID}
                          className={`border-b border-slate-100 transition-colors ${idx % 2 === 0
                            ? "bg-white hover:bg-slate-50"
                            : "bg-slate-50 hover:bg-slate-100"
                            }`}
                        >
                          {/* <td className="px-2 py-2">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveOne(s)}
                                title={translate("বাতিল করুন")}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                              >
                                <SvgIcon name="FaTrash" className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td> */}
                          <td className="px-2 py-2 whitespace-nowrap text-slate-500">
                            {s.UserCode}
                          </td>

                          <td className="px-2 py-2 whitespace-nowrap font-SolaimanLipi text-slate-800">
                            {s.UserName}
                          </td>

                          {
                            UserTypeID === "1" && (
                              <td className="px-2 py-2 font-SolaimanLipi text-slate-700 whitespace-nowrap">
                                {s.FatherName}
                              </td>
                            )}
                          {
                            UserTypeID === "1" && (
                              <td className="px-2 py-2 font-SolaimanLipi text-slate-700 whitespace-nowrap">
                                {s.ClassName}
                              </td>
                            )}

                          <td className="px-2 py-2 whitespace-nowrap text-slate-500">
                            {s.Mobile1}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default CreateAttendenceList;