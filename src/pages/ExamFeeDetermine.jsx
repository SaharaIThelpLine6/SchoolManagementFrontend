import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";

import { setPageName } from "../features/auth/authSlice";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
import {
  useDeleteExamFeeSettingMutation,
  useGetExamFeeSettingQuery,
  useGetExamNamesQuery,
  usePostExamFeeSettingMutation,
  useUpdateExamFeeSettingMutation,
} from "../features/exam/examQuerySlice";

import useTranslate from "../utils/Translate";

import SortableTable from "../components/Tables/SortableTable";
import Loading from "../components/Loading/Loading";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import StudentFeeGroup from "../view/exam/StudentFeeGroup";
import { useGetNameOFExamFeeQuery } from "../features/feeCollection/feeCollectionSlice";
import DeleteButton from "../components/Button/DeleteButton";
import EditButton from "../components/Button/EditButton";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import SvgIcon from "../components/icons/SvgIcon";

const PAGE_SIZE = 10;

// ফাঁকা ফর্ম — সেভ/রিসেট দুই জায়গাতেই একই মান ব্যবহার হবে
const EMPTY_FORM = {
  ID: "",
  SessionID: "",
  ExamID: "",
  SubClassID: "",
  SLID: "",
  Fee: "",
};

// ফিল্টার বারের সেলেক্ট/ইনপুটের কমন ক্লাস — main ফর্মের DefaultSelect ব্যবহার করলে
// ওটা methods (react-hook-form) এর সাথে বাঁধা পড়ে যেত, তাই ফিল্টারে প্লেইন কন্ট্রোল
const filterControlClass =
  "h-[38px] w-full border border-[#e9edf4] rounded-md px-3 text-sm bg-white outline-none transition focus:border-[#1B3A57]";

// খালি/বিভিন্ন টাইপের মান নিরাপদে স্ট্রিং-এ মিলিয়ে দেখার জন্য
const includesText = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

// এক রো-এর ইউনিকনেস কী — backend-এর নিয়মের সাথে মিল রেখে
const comboKey = (row) => `${row?.SessionID}|${row?.ExamID}|${row?.SubClassID}`;

const ExamFeeDetermine = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm({ defaultValues: EMPTY_FORM });
  const { watch, handleSubmit } = methods;

  // এডিট মোডে আছি কিনা — ID থাকলে সেভ চাপলে আপডেট হবে, নতুন রো হবে না
  const editingID = watch("ID");

  const [currentPage, setCurrentPage] = useState(1);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);

  /* ---------------- সার্চ + ফিল্টার state ---------------- */
  const [search, setSearch] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [filterSubClass, setFilterSubClass] = useState("");
  const [filterSLID, setFilterSLID] = useState("");

  const [postExamFeeSetting] = usePostExamFeeSettingMutation();
  const [updateExamFeeSetting] = useUpdateExamFeeSettingMutation();
  const [deleteExamFeeSetting] = useDeleteExamFeeSettingMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: nameOfExamFeeData } = useGetNameOFExamFeeQuery();

  const {
    data: examFeeSettingData,
    isLoading: isExamFeeSettingLoading,
    isError: isExamFeeSettingError,
    refetch,
  } = useGetExamFeeSettingQuery();

  // SLID → ফি-র নাম, টেবিলে আর সার্চে দুই জায়গাতেই লাগে
  const feeNameBySLID = useMemo(() => {
    const map = new Map();
    (nameOfExamFeeData ?? []).forEach((f) => map.set(String(f.SLID), f.SlName));
    return map;
  }, [nameOfExamFeeData]);

  const getFeeName = (slid) => feeNameBySLID.get(String(slid)) ?? slid ?? "";

  /* ---------------- ডুপ্লিকেট শনাক্তকরণ ----------------
     backend-এর নিয়ম: এক Session + Exam + SubClass কম্বিনেশনে একটাই রো।
     পুরনো ডাটায় এই নিয়ম ভাঙা রো থাকতে পারে (যেগুলো পরীক্ষার্থী তালিকায়
     ফি দ্বিগুণ দেখানোর কারণ) — সেগুলো টেবিলে লাল ব্যাজ দিয়ে চিনিয়ে দেওয়া হচ্ছে।
  --------------------------------------------------------- */
  const duplicateKeys = useMemo(() => {
    const count = new Map();
    (examFeeSettingData ?? []).forEach((row) => {
      const key = comboKey(row);
      count.set(key, (count.get(key) || 0) + 1);
    });
    return new Set([...count.entries()].filter(([, n]) => n > 1).map(([k]) => k));
  }, [examFeeSettingData]);

  const isDuplicate = (row) => duplicateKeys.has(comboKey(row));

  const duplicateRowCount = useMemo(
    () => (examFeeSettingData ?? []).filter(isDuplicate).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [examFeeSettingData, duplicateKeys]
  );

  /* ---------------- ফিল্টার + সার্চ প্রয়োগ ----------------
     ড্রপডাউনগুলো সরাসরি ID মিলিয়ে দেখে,
     সার্চ বক্স সব দৃশ্যমান টেক্সটে (আইডি, শিক্ষাবর্ষ, পরীক্ষা, শ্রেণী, ফি-র নাম, ফি) খোঁজে।
  --------------------------------------------------------- */
  const filteredData = useMemo(() => {
    const rows = examFeeSettingData ?? [];
    const q = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (filterSession && String(row.SessionID) !== String(filterSession)) return false;
      if (filterExam && String(row.ExamID) !== String(filterExam)) return false;
      if (filterSubClass && String(row.SubClassID) !== String(filterSubClass)) return false;
      if (filterSLID && String(row.SLID) !== String(filterSLID)) return false;

      if (!q) return true;

      return (
        includesText(row.ID, q) ||
        includesText(row.Fee, q) ||
        includesText(row.SLID, q) ||
        includesText(getFeeName(row.SLID), q) ||
        includesText(row?.AcademicSession?.SessionName, q) ||
        includesText(row?.Exam_Name?.ExamName, q) ||
        includesText(row?.Class?.SubClass, q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examFeeSettingData, search, filterSession, filterExam, filterSubClass, filterSLID, feeNameBySLID]);

  const totalPages = Math.ceil((filteredData?.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData?.slice(start, start + PAGE_SIZE) || [];
  }, [filteredData, currentPage]);

  // ফিল্টার বদলালে আবার প্রথম পেজে — নাহলে ৩ নম্বর পেজে থেকে খালি টেবিল দেখাত
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterSession, filterExam, filterSubClass, filterSLID]);

  // ডাটা কমে গেলে (ডিলিটের পর) বর্তমান পেজ যেন রেঞ্জের বাইরে না থাকে
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const isFiltering = Boolean(search || filterSession || filterExam || filterSubClass || filterSLID);

  const clearFilters = () => {
    setSearch("");
    setFilterSession("");
    setFilterExam("");
    setFilterSubClass("");
    setFilterSLID("");
  };

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const handleShowStudentFeeGroup = () => {
    setShowStudentFeeGroup(true);
  };

  // Update Handle — এডিট মোডে ঢোকা
  const handleEdit = (row) => {
    methods.reset({
      ID: row.ID,
      SessionID: row.SessionID,
      ExamID: row.ExamID,
      SubClassID: row.SubClassID,
      Fee: row.Fee,
      SLID: row.SLID,
    });
    // ফর্ম উপরে, তাই স্ক্রল করে নিয়ে যাওয়া
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // এডিট বাতিল / ফর্ম খালি করা
  const handleResetForm = () => methods.reset(EMPTY_FORM);

  // Delete Exam Feee Setting data
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "একবার মুছে ফেলা হলে পুনরুদ্ধার করা যাবে না!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
      cancelButtonText: "বাতিল",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteExamFeeSetting(id).unwrap();

        Swal.fire({
          icon: "success",
          title: "সফলভাবে মুছে ফেলা হয়েছে",
          text: response?.message || "ডেটা সফলভাবে মুছে ফেলা হয়েছে।",
        });

        // যে রো-টা মুছলাম সেটাই যদি ফর্মে এডিট মোডে থাকে, ফর্ম খালি করে দাও
        if (String(methods.getValues("ID")) === String(id)) handleResetForm();

        refetch(); // Reload table
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "ত্রুটি ঘটেছে!",
          text:
            error?.data?.message ||
            error?.data?.error ||
            "ডেটা মুছে ফেলতে ব্যর্থ হয়েছে।",
        });
        console.error("Delete error:", error);
      }
    }
  };

  // Data Create Exam Fee Setting
  const onSubmit = async (data) => {
    if (!data.SessionID || !data.SubClassID || !data.ExamID || !data.SLID) {
      Swal.fire({
        icon: "warning",
        title: "ফর্ম অসম্পূর্ণ",
        text: "শিক্ষাবর্ষ, পরীক্ষা, শ্রেণী এবং ফি-র নাম নির্বাচন করুন।",
      });
      return;
    }

    // ⭐ ফি অবশ্যই ০-এর বেশি হতে হবে — ০ দিয়ে সেভ করা যাবে না
    if (
      data.Fee === "" ||
      data.Fee === null ||
      data.Fee === undefined ||
      isNaN(Number(data.Fee)) ||
      Number(data.Fee) <= 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "ফি সঠিক নয়",
        text: "ফি ০-এর বেশি একটি সংখ্যা হতে হবে।",
      });
      return;
    }

    const payload = {
      SessionID: Number(data.SessionID),
      ExamID: Number(data.ExamID),
      SubClassID: Number(data.SubClassID),
      Fee: Number(data.Fee),
      SLID: data.SLID,
    };

    try {
      let response;
      // ⚠️ Fee = 0 বৈধ নয় — ফি ০-এর বেশি না হলে সেভ হবে না
      if (data.ID) {
        response = await updateExamFeeSetting({
          id: data.ID,
          body: payload,
        }).unwrap();
      } else {
        response = await postExamFeeSetting(payload).unwrap();
      }

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "Exam Fee Setting সফলভাবে সংরক্ষিত হয়েছে।",
      }).then(() => {
        refetch();
        // ⭐ সেভের পর ফর্ম খালি — নাহলে ID ফর্মে থেকে যেত আর
        //    পরের বার "নতুন" ভেবে সেভ করলে আসলে পুরনো রো-ই আপডেট হতো
        handleResetForm();
      });
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.data?.error ||
        "অজানা একটি ত্রুটি ঘটেছে।";

      // ডুপ্লিকেট হলে backend কোন রো-টা আগে থেকে আছে সেটা পাঠায় —
      // সরাসরি ওই রো এডিট করার সুযোগ দিচ্ছি
      const existingID = error?.data?.existingID ?? error?.data?.data?.existingID;

      if (existingID) {
        const confirm = await Swal.fire({
          icon: "warning",
          title: "আগেই নির্ধারণ করা আছে",
          text: errMsg,
          showCancelButton: true,
          confirmButtonText: "ওই রো-টি এডিট করুন",
          cancelButtonText: "বাতিল",
        });

        if (confirm.isConfirmed) {
          const row = (examFeeSettingData ?? []).find(
            (r) => String(r.ID) === String(existingID)
          );
          if (row) handleEdit(row);
        }
        return;
      }

      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: errMsg,
      });
      console.error("Exam Fee Setting Error:", error);
    }
  };

  // Table Data Columns
  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEdit(row)} />
          <DeleteButton onClick={() => handleDelete(row.ID)} />
        </div>
      ),
    },
    {
      title: translate("ID"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <span>{row?.ID}</span>
          {isDuplicate(row) && (
            <span
              title="এই শিক্ষাবর্ষ, পরীক্ষা ও শ্রেণীতে একাধিক রো আছে — বাড়তিগুলো মুছে ফেলুন"
              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200"
            >
              ডুপ্লিকেট
            </span>
          )}
        </div>
      ),
    },
    {
      title: translate("Session"),
      hozAlign: "center",
      render: (row) => <>{row?.AcademicSession?.SessionName}</>,
    },
    {
      title: translate("Exam Name"),
      hozAlign: "center",
      render: (row) => <>{(row?.Exam_Name?.ExamName)}</>,
    },
    {
      title: translate("Class/Jamaat"),
      hozAlign: "center",
      render: (row) => <>{(row?.Class?.SubClass)}</>,
    },
    {
      title: translate("Fee Name"),
      hozAlign: "center",
      render: (row) => <>{getFeeName(row?.SLID)}</>,
    },
    {
      title: translate("Fee"),
      field: "Fee",
      hozAlign: "center",
    },
  ];

  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
  }

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
        <h3 className="text-base sm:text-[20px] font-bold">
          {translate("Exam Fee Determine")}
        </h3>

        {/* এডিট মোডে আছি কিনা — না দেখালে বোঝাই যায় না যে সেভ চাপলে আপডেট হবে */}
        {editingID && (
          <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            সম্পাদনা করছেন — আইডি {editingID}
          </span>
        )}
      </div>

      {/* ডুপ্লিকেট থাকলে সতর্কবার্তা */}
      {duplicateRowCount > 0 && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
          {duplicateRowCount} টি রো-তে একই শিক্ষাবর্ষ, পরীক্ষা ও শ্রেণীর ফি একাধিকবার নির্ধারণ করা
          আছে। এতে পরীক্ষার্থী তালিকায় ভুল ফি দেখাতে পারে — বাড়তি রো-গুলো মুছে ফেলুন।
        </div>
      )}

      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...methods.register("ID")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            <div className="flex flex-col space-y-4">
              <DefaultSelect
                label={translate("Session") + " :"}
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
                unicode={true}
              />
              <DefaultSelect
                label={translate("Exam Name") + " :"}
                options={examNameData ?? []}
                valueField="ExamID"
                nameField="ExamName"
                registerKey="ExamID"
                unicode={true}
              />
              <DefaultSelect
                label={
                  <p className="text-gray-700 font-medium">
                    {translate("Class/Jamaat")}:
                  </p>
                }
                options={subClassListData ?? []}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
                unicode={true}
              />
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <DefaultSelect
                  label={`${translate("Fee Name")}:`}
                  nameField="SlName"
                  registerKey="SLID"
                  valueField="SLID"
                  options={nameOfExamFeeData ?? []}
                  unicode={true}
                />
                <Button
                  onClick={handleShowStudentFeeGroup}
                  className="bg-[#EDEDED] mt-7 rounded-md py-3"
                >
                  <SvgIcon name={"FaPlus"} size={14} />
                </Button>
              </div>
              <DefaultInput registerKey="Fee" label={`${translate("Fee")}: `} />
            </div>
          </div>
          <div className="w-full flex flex-wrap gap-2">
            <Button type="submit" className="w-full md:w-auto">
              {editingID ? translate("Update") : translate("Save")}
            </Button>
            <Button
              type="button"
              onClick={handleResetForm}
              className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white"
            >
              {editingID ? translate("Cancel") : translate("Reset")}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* ---------------- সার্চ + ফিল্টার বার ---------------- */}
      <div className="mt-6 border-t border-[#e9edf4] pt-4">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <h4 className="text-sm font-bold text-gray-700">
            {translate("Search & Filter")}
          </h4>
          <span className="text-xs font-medium text-gray-500">
            {filteredData.length} / {examFeeSettingData?.length ?? 0}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* সার্চ */}
          <div className="relative lg:col-span-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SvgIcon name="FiSearch" size={14} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={translate("Search")}
              className={`${filterControlClass} pl-8`}
            />
          </div>

          {/* শিক্ষাবর্ষ */}
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className={filterControlClass}
          >
            <option value="">{translate("Session")}</option>
            {(sessionData ?? []).map((s) => (
              <option key={s.SessionID} value={s.SessionID}>
                {s.SessionName}
              </option>
            ))}
          </select>

          {/* পরীক্ষা */}
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className={filterControlClass}
          >
            <option value="">{translate("Exam Name")}</option>
            {(examNameData ?? []).map((e) => (
              <option key={e.ExamID} value={e.ExamID}>
                {e.ExamName}
              </option>
            ))}
          </select>

          {/* শ্রেণী */}
          <select
            value={filterSubClass}
            onChange={(e) => setFilterSubClass(e.target.value)}
            className={filterControlClass}
          >
            <option value="">{translate("Class/Jamaat")}</option>
            {(subClassListData ?? []).map((c) => (
              <option key={c.SubClassID} value={c.SubClassID}>
                {c.SubClass}
              </option>
            ))}
          </select>

          {/* ফি-র নাম */}
          <div className="flex items-center gap-2">
            <select
              value={filterSLID}
              onChange={(e) => setFilterSLID(e.target.value)}
              className={filterControlClass}
            >
              <option value="">{translate("Fee Name")}</option>
              {(nameOfExamFeeData ?? []).map((f) => (
                <option key={f.SLID} value={f.SLID}>
                  {f.SlName}
                </option>
              ))}
            </select>

            {isFiltering && (
              <button
                type="button"
                onClick={clearFilters}
                title={translate("Clear")}
                className="h-[38px] shrink-0 px-3 rounded-md border border-[#e9edf4] bg-[#EDEDED] text-sm font-medium text-gray-600 hover:bg-gray-200 transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        {isExamFeeSettingLoading ? (
          <Loading />
        ) : isExamFeeSettingError ? (
          <div className="text-red-500 text-center py-4">
            {translate("Failed to load exam fee settings. Please try again.")}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-gray-400 italic text-center py-8 text-sm">
            {isFiltering
              ? translate("No matching data found")
              : translate("No data available")}
          </div>
        ) : (
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />
        )}
      </div>

      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ExamFeeDetermine;












































// import { useEffect, useMemo, useState } from "react";
// import { useDispatch } from "react-redux";
// import { useLocation } from "react-router-dom";
// import { FormProvider, useForm } from "react-hook-form";
// import Swal from "sweetalert2";

// import { setPageName } from "../features/auth/authSlice";
// import { useGetSessionsQuery } from "../features/session/sessionSlice";
// import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
// import {
//   useDeleteExamFeeSettingMutation,
//   useGetExamFeeSettingQuery,
//   useGetExamNamesQuery,
//   usePostExamFeeSettingMutation,
//   useUpdateExamFeeSettingMutation,
// } from "../features/exam/examQuerySlice";

// import useTranslate from "../utils/Translate";

// import SortableTable from "../components/Tables/SortableTable";
// import Loading from "../components/Loading/Loading";
// import DefaultInput from "../components/Forms/DefaultInput";
// import DefaultSelect from "../components/Forms/DefaultSelect";
// import Button from "../components/Button/Button";
// import StudentFeeGroup from "../view/exam/StudentFeeGroup";
// import { useGetNameOFExamFeeQuery } from "../features/feeCollection/feeCollectionSlice";
// import DeleteButton from "../components/Button/DeleteButton";
// import EditButton from "../components/Button/EditButton";
// import DefaultPagination from "../components/Pagination/DefaultPagination";
// import SvgIcon from "../components/icons/SvgIcon";

// const PAGE_SIZE = 10;

// const ExamFeeDetermine = ({ pageTitle }) => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const translate = useTranslate();
//   const methods = useForm();
//   const { watch, handleSubmit } = methods;

//   const [currentPage, setCurrentPage] = useState(1);
//   const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);

//   const [postExamFeeSetting] = usePostExamFeeSettingMutation();
//   const [updateExamFeeSetting] = useUpdateExamFeeSettingMutation();
//   const [deleteExamFeeSetting] = useDeleteExamFeeSettingMutation();

//   const { data: sessionData } = useGetSessionsQuery();
//   const { data: subClassListData } = useGetSubClassListQuery();
//   const { data: examNameData } = useGetExamNamesQuery();
//   const { data: nameOfExamFeeData } = useGetNameOFExamFeeQuery();

//   const {
//     data: examFeeSettingData,
//     isLoading: isExamFeeSettingLoading,
//     isError: isExamFeeSettingError,
//     refetch,
//   } = useGetExamFeeSettingQuery();

//   const totalPages = Math.ceil((examFeeSettingData?.length || 0) / PAGE_SIZE);

//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * PAGE_SIZE;
//     return examFeeSettingData?.slice(start, start + PAGE_SIZE) || [];
//   }, [examFeeSettingData, currentPage]);

//   useEffect(() => {
//     if (pageTitle) dispatch(setPageName(pageTitle));
//   }, [dispatch, pageTitle]);

//   const handleShowStudentFeeGroup = () => {
//     setShowStudentFeeGroup(true);
//   };

//   // Update Handle
//   const handleEdit = (row) => {
//     methods.reset({
//       ID: row.ID,
//       SessionID: row.SessionID,
//       ExamID: row.ExamID,
//       SubClassID: row.SubClassID,
//       Fee: row.Fee,
//       SLID: row.SLID,
//     });
//   };

//   // Delete Exam Feee Setting data
//   const handleDelete = async (id) => {
//     const result = await Swal.fire({
//       title: "আপনি কি নিশ্চিত?",
//       text: "একবার মুছে ফেলা হলে পুনরুদ্ধার করা যাবে না!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
//       cancelButtonText: "বাতিল",
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await deleteExamFeeSetting(id).unwrap();

//         Swal.fire({
//           icon: "success",
//           title: "সফলভাবে মুছে ফেলা হয়েছে",
//           text: response?.message || "ডেটা সফলভাবে মুছে ফেলা হয়েছে।",
//         });

//         refetch(); // Reload table
//       } catch (error) {
//         Swal.fire({
//           icon: "error",
//           title: "ত্রুটি ঘটেছে!",
//           text:
//             error?.data?.message ||
//             error?.data?.error ||
//             "ডেটা মুছে ফেলতে ব্যর্থ হয়েছে।",
//         });
//         console.error("Delete error:", error);
//       }
//     }
//   };

//   // Data Create Exam Fee Setting
//   const onSubmit = async (data) => {
//     if (!data.SessionID || !data.SubClassID || !data.ExamID) {
//       Swal.fire({
//         icon: "warning",
//         title: "ফর্ম অসম্পূর্ণ",
//         text: "Session, SubClass এবং Exam নির্বাচন করুন।",
//       });
//       return;
//     }

//     const payload = {
//       SessionID: Number(data.SessionID),
//       ExamID: Number(data.ExamID),
//       SubClassID: Number(data.SubClassID),
//       Fee: Number(data.Fee),
//       SLID: data.SLID,
//     };

//     try {
//       let response;
//       if (data.ID) {
//         response = await updateExamFeeSetting({
//           id: data.ID,
//           body: payload,
//         }).unwrap();
//       } else {
//         response = await postExamFeeSetting(payload).unwrap();
//       }

//       Swal.fire({
//         icon: "success",
//         title: "সফলভাবে সংরক্ষণ হয়েছে",
//         text: response?.message || "Exam Fee Setting সফলভাবে সংরক্ষিত হয়েছে।",
//       }).then(() => {
//         refetch();
//         // methods.reset();
//       });
//     } catch (error) {
//       const errMsg =
//         error?.data?.message ||
//         error?.data?.error ||
//         "অজানা একটি ত্রুটি ঘটেছে।";
//       Swal.fire({
//         icon: "error",
//         title: "ত্রুটি ঘটেছে!",
//         text: errMsg,
//       });
//       console.error("Exam Fee Setting Error:", error);
//     }
//   };

//   // Table Data Columns
//   const columns = [
//     {
//       title: translate("Action"),
//       hozAlign: "center",
//       render: (row) => (
//         <div className="flex justify-center items-center gap-2">
//           <EditButton onClick={() => handleEdit(row)} />
//           <DeleteButton onClick={() => handleDelete(row.ID)} />
//         </div>
//       ),
//     },
//     {
//       title: translate("ID"),
//       hozAlign: "center",
//       render: (row) => <>{row?.ID}</>,
//     },
//     {
//       title: translate("Session"),
//       hozAlign: "center",
//       render: (row) => <>{row?.AcademicSession?.SessionName}</>,
//     },
//     {
//       title: translate("Exam Name"),
//       hozAlign: "center",
//       render: (row) => <>{(row?.Exam_Name?.ExamName)}</>,
//     },
//     {
//       title: translate("Class/Jamaat"),
//       hozAlign: "center",
//       render: (row) => <>{(row?.Class?.SubClass)}</>,
//     },
//     {
//       title: translate("Fee Name"),
//       field: "SLID",
//       hozAlign: "center",
//     },
//     {
//       title: translate("Fee"),
//       field: "Fee",
//       hozAlign: "center",
//     },
//   ];

//   if (showStudentFeeGroup) {
//     return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
//   }

//   return (
//     <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
//       <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
//         <h3 className="text-base sm:text-[20px] font-bold">
//           {translate("Exam Fee Determine")}
//         </h3>
//       </div>

//       <FormProvider {...methods}>
//         <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
//           <input type="hidden" {...methods.register("ID")} />
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
//             <div className="flex flex-col space-y-4">
//               <DefaultSelect
//                 label={translate("Session") + " :"}
//                 options={sessionData ?? []}
//                 valueField="SessionID"
//                 nameField="SessionName"
//                 registerKey="SessionID"
//                 unicode={true}
//               />
//               <DefaultSelect
//                 label={translate("Exam Name") + " :"}
//                 options={examNameData ?? []}
//                 valueField="ExamID"
//                 nameField="ExamName"
//                 registerKey="ExamID"
//                 unicode={true}
//               />
//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={subClassListData ?? []}
//                 valueField="SubClassID"
//                 nameField="SubClass"
//                 registerKey="SubClassID"
//                 unicode={true}
//               />
//             </div>

//             <div className="flex flex-col space-y-4">
//               <div className="flex items-center gap-2">
//                 <DefaultSelect
//                   label={`${translate("Fee Name")}:`}
//                   nameField="SlName"
//                   registerKey="SLID"
//                   valueField="SLID"
//                   options={nameOfExamFeeData ?? []}
//                   unicode={true}
//                 />
//                 <Button
//                   onClick={handleShowStudentFeeGroup}
//                   className="bg-[#EDEDED] mt-7 rounded-md py-3"
//                 >
//                   <SvgIcon name={"FaPlus"} size={14} />
//                 </Button>
//               </div>
//               <DefaultInput registerKey="Fee" label={`${translate("Fee")}: `} />
//             </div>
//           </div>
//           <div className="w-full flex flex-wrap gap-2">
//             <Button type="submit" className="w-full md:w-auto">
//               {translate("Save")}
//             </Button>
//             <Button
//               type="button"
//               onClick={() =>
//                 methods.reset({
//                   SLID: "",
//                   SessionID: "",
//                   ExamID: "",
//                   SubClassID: "",
//                   Fee: "",
//                 })
//               }
//               className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white"
//             >
//               {translate("Reset")}
//             </Button>
//           </div>
//         </form>
//       </FormProvider>

//       <div className="mt-5">
//         {isExamFeeSettingLoading ? (
//           <Loading />
//         ) : isExamFeeSettingError ? (
//           <div className="text-red-500 text-center py-4">
//             {translate("Failed to load exam fee settings. Please try again.")}
//           </div>
//         ) : (
//           <SortableTable
//             columns={columns}
//             data={paginatedData}
//             isFilterColumn={false}
//           />
//         )}
//       </div>

//       <DefaultPagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={setCurrentPage}
//       />
//     </div>
//   );
// };

// export default ExamFeeDetermine;
