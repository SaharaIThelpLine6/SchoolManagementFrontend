import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
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
import StudentFeeGroup from "../view/exam/StudentFeeGroup";
import { useGetNameOFExamFeeQuery } from "../features/feeCollection/feeCollectionSlice";
import DeleteButton from "../components/Button/DeleteButton";
import EditButton from "../components/Button/EditButton";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import SvgIcon from "../components/icons/SvgIcon";

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  SessionID: "",
  ExamID: "",
  SLID: "",
};

/* ---------------- পরীক্ষার রিপোর্ট পেজের কালার প্যালেট ---------------- */
const C = {
  gradient: "bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#06B6D4]",
  panel: "bg-[#FAF5FF]",
  panelBorder: "border-[#E9D5FF]",
  primary: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white",
  soft: "bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]",
};

const controlClass =
  "h-[38px] w-full border border-[#E9D5FF] rounded-md px-3 text-sm bg-white outline-none transition focus:border-[#7C3AED]";

const modalSelectClass =
  "h-[42px] w-full border border-[#E9D5FF] rounded-lg px-3 text-sm bg-white text-gray-700 outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#DDD6FE]";

// খালি/বিভিন্ন টাইপের মান নিরাপদে স্ট্রিং-এ মিলিয়ে দেখার জন্য
const includesText = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

// এক রো-এর ইউনিকনেস কী — backend-এর নিয়মের সাথে মিল রেখে
const comboKey = (row) => `${row?.SessionID}|${row?.ExamID}|${row?.SubClassID}`;

// ⭐ ফি-তে মাইনাস/এক্সপোনেন্ট টাইপ করা যাবে না
const blockNegativeKey = (e) => {
  if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
};

// পেস্ট/স্পিনার দিয়েও যেন ঋণাত্মক না ঢোকে
const sanitizeFee = (value) => String(value ?? "").replace(/[^0-9.]/g, "");

const ExamFeeDetermine = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm({ defaultValues: EMPTY_FORM });
  const { watch, setValue, register } = methods;

  const SessionID = watch("SessionID");
  const ExamID = watch("ExamID");

  const [currentPage, setCurrentPage] = useState(1);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // শ্রেণী ভিত্তিক ফি — { [SubClassID]: { checked, fee } }
  const [classFees, setClassFees] = useState({});
  const [commonFee, setCommonFee] = useState("");

  // টেবিল থেকে এডিট চাপলে কোন শ্রেণীটা ফোকাস হবে (গ্রিড রিবিল্ডের পর বসবে)
  const pendingEditRef = useRef(null);

  // কলাম হেডারের "সব নির্বাচন" চেকবক্স — আংশিক সিলেকশনে indeterminate দেখাবে
  const selectAllRef = useRef(null);

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
     পুরনো ডাটায় নিয়ম ভাঙা রো থাকতে পারে — লাল ব্যাজ দিয়ে চিনিয়ে দেওয়া হচ্ছে।
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

  /* ---------------- নির্বাচিত শিক্ষাবর্ষ+পরীক্ষার আগের রো ---------------- */
  const existingByClass = useMemo(() => {
    const map = new Map();
    if (!SessionID || !ExamID) return map;
    (examFeeSettingData ?? []).forEach((row) => {
      if (
        String(row.SessionID) === String(SessionID) &&
        String(row.ExamID) === String(ExamID)
      ) {
        // একই কম্বিনেশনে একাধিক থাকলে প্রথমটাই ধরা হচ্ছে
        if (!map.has(String(row.SubClassID))) map.set(String(row.SubClassID), row);
      }
    });
    return map;
  }, [examFeeSettingData, SessionID, ExamID]);

  // শিক্ষাবর্ষ/পরীক্ষা বদলালে পুরো গ্রিড নতুন করে সাজাও
  useEffect(() => {
    const classes = subClassListData ?? [];
    if (!SessionID || !ExamID || classes.length === 0) {
      setClassFees({});
      return;
    }

    const focus = pendingEditRef.current;
    const next = {};
    classes.forEach((c) => {
      const id = String(c.SubClassID);
      const existing = existingByClass.get(id);
      next[id] = {
        // এডিট মোডে শুধু ওই শ্রেণী, নইলে সবাই সিলেক্টেড
        checked: focus ? String(focus.SubClassID) === id : true,
        fee: existing ? String(existing.Fee ?? "") : "",
      };
    });

    if (focus) {
      const id = String(focus.SubClassID);
      if (next[id]) next[id].fee = String(focus.Fee ?? "");
      pendingEditRef.current = null;
    }

    setClassFees(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SessionID, ExamID, subClassListData, existingByClass]);

  const classRows = useMemo(() => {
    if (!SessionID || !ExamID) return [];
    return (subClassListData ?? []).map((c) => {
      const id = String(c.SubClassID);
      const state = classFees[id] ?? { checked: false, fee: "" };
      return {
        id,
        name: c.SubClass,
        checked: state.checked,
        fee: state.fee,
        existing: existingByClass.get(id),
      };
    });
  }, [subClassListData, classFees, existingByClass, SessionID, ExamID]);

  const selectedRows = classRows.filter((r) => r.checked);
  const allChecked = classRows.length > 0 && selectedRows.length === classRows.length;

  // কিছু রো সিলেক্ট থাকলে হেডার চেকবক্সে হাইফেন (−) দেখাবে
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedRows.length > 0 && !allChecked;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classFees, allChecked, showSetupModal]);

  /* ---------------- মডাল খোলা থাকলে পেছনের স্ক্রল বন্ধ + Esc ----------------
     ⭐ দুটো মডালের যেকোনো একটা খোলা থাকলেই চলবে। Esc চাপলে আগে উপরেরটা
     (ছাত্র ফি গ্রুপ) বন্ধ হবে, তারপর ফি নির্ধারণ মডাল।
  --------------------------------------------------------- */
  useEffect(() => {
    if (!showSetupModal && !showStudentFeeGroup) return;

    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (showStudentFeeGroup) setShowStudentFeeGroup(false);
      else closeSetupModal();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSetupModal, showStudentFeeGroup]);

  const setClassValue = (id, patch) =>
    setClassFees((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { checked: false, fee: "" }), ...patch },
    }));

  const toggleAll = () =>
    setClassFees((prev) => {
      const next = { ...prev };
      classRows.forEach((r) => {
        next[r.id] = { ...(next[r.id] ?? { fee: "" }), checked: !allChecked };
      });
      return next;
    });

  /* ---------------- কমন ফি — টাইপ করলেই অটো বসে যাবে ----------------
     ⭐ কোনো বাটন চাপতে হয় না; শুধু যারা সিলেক্টেড তাদের ঘরেই বসে।
  --------------------------------------------------------- */
  const handleCommonFeeChange = (e) => {
    const value = sanitizeFee(e.target.value);
    setCommonFee(value);

    if (value === "" || isNaN(Number(value)) || Number(value) <= 0) return;

    setClassFees((prev) => {
      const next = { ...prev };
      classRows.forEach((r) => {
        if (r.checked) {
          next[r.id] = { ...(next[r.id] ?? {}), checked: true, fee: String(value) };
        }
      });
      return next;
    });
  };

  /* ---------------- ফিল্টার + সার্চ প্রয়োগ ---------------- */
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

  // ফিল্টার বদলালে আবার প্রথম পেজে
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterSession, filterExam, filterSubClass, filterSLID]);

  // ডাটা কমে গেলে (ডিলিটের পর) পেজ যেন রেঞ্জের বাইরে না থাকে
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

  /* ---------------- মডাল খোলা/বন্ধ ---------------- */
  const openSetupModal = () => {
    pendingEditRef.current = null;
    setCommonFee("");
    methods.reset(EMPTY_FORM);
    setShowSetupModal(true);
  };

  const closeSetupModal = () => {
    setShowSetupModal(false);
    setCommonFee("");
  };

  // টেবিলের রো এডিট — মডাল খুলে ওই শ্রেণীটাই গ্রিডে ফোকাস হবে
  const handleEdit = (row) => {
    pendingEditRef.current = { SubClassID: row.SubClassID, Fee: row.Fee };
    setCommonFee("");
    setValue("SessionID", String(row.SessionID ?? ""));
    setValue("ExamID", String(row.ExamID ?? ""));
    setValue("SLID", String(row.SLID ?? ""));
    setShowSetupModal(true);
  };

  /* ---------------- রিসেট ----------------
     ⭐ শুধু হাতে লেখা ফি-গুলো মুছবে — শিক্ষাবর্ষ/পরীক্ষা/ফি-র নাম সিলেকশন
     আর চেকবক্স যেমন আছে তেমনই থাকবে। আগে থেকে নির্ধারিত শ্রেণীর ঘরে
     ডাটাবেজের মানটাই ফিরে আসবে।
  --------------------------------------------------------- */
  const handleResetFees = () => {
    setCommonFee("");
    setClassFees((prev) => {
      const next = { ...prev };
      classRows.forEach((r) => {
        next[r.id] = {
          ...(next[r.id] ?? {}),
          fee: r.existing ? String(r.existing.Fee ?? "") : "",
        };
      });
      return next;
    });
  };

  // Delete Exam Fee Setting data
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "একবার মুছে ফেলা হলে পুনরুদ্ধার করা যাবে না!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7C3AED",
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
          confirmButtonColor: "#7C3AED",
        });

        refetch(); // Reload table
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "ত্রুটি ঘটেছে!",
          text:
            error?.data?.message ||
            error?.data?.error ||
            "ডেটা মুছে ফেলতে ব্যর্থ হয়েছে।",
          confirmButtonColor: "#7C3AED",
        });
        console.error("Delete error:", error);
      }
    }
  };

  /* ---------------- এক ক্লিকে নির্বাচিত শ্রেণীর ফি সেভ ----------------
     নতুন শ্রেণী হলে POST, আগে থেকে নির্ধারিত থাকলে PUT —
     তাই একই কম্বিনেশনে ডুপ্লিকেট রো তৈরি হয় না।
  --------------------------------------------------------- */
  const handleSaveAll = async () => {
    const { SessionID: sid, ExamID: eid, SLID: slid } = methods.getValues();

    if (!sid || !eid || !slid) {
      Swal.fire({
        icon: "warning",
        title: "ফর্ম অসম্পূর্ণ",
        text: "শিক্ষাবর্ষ, পরীক্ষা এবং ফি-এর নাম নির্বাচন করুন।",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    if (selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "কোনো শ্রেণী নির্বাচন করা হয়নি",
        text: "অন্তত একটি শ্রেণী/জামাত নির্বাচন করুন।",
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    // ⭐ ফি অবশ্যই ০-এর বেশি হতে হবে — ০ দিয়ে সেভ করা যাবে না
    const invalid = selectedRows.filter(
      (r) => r.fee === "" || isNaN(Number(r.fee)) || Number(r.fee) <= 0
    );
    if (invalid.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "ফি সঠিক নয়",
        text: `${invalid.map((r) => r.name).join(", ")} — এই শ্রেণীগুলোর ফি ০-এর বেশি একটি সংখ্যা হতে হবে।`,
        confirmButtonColor: "#7C3AED",
      });
      return;
    }

    setSaving(true);
    let created = 0;
    let updated = 0;
    const failed = [];

    for (const row of selectedRows) {
      const payload = {
        SessionID: Number(sid),
        ExamID: Number(eid),
        SubClassID: Number(row.id),
        Fee: Number(row.fee),
        SLID: slid,
      };

      try {
        if (row.existing?.ID) {
          await updateExamFeeSetting({ id: row.existing.ID, body: payload }).unwrap();
          updated += 1;
        } else {
          await postExamFeeSetting(payload).unwrap();
          created += 1;
        }
      } catch (error) {
        failed.push(
          `${row.name}: ${
            error?.data?.message || error?.data?.error || "ব্যর্থ হয়েছে"
          }`
        );
        console.error("Exam Fee Setting Error:", row.name, error);
      }
    }

    setSaving(false);
    refetch();

    if (failed.length === 0) {
      closeSetupModal();
      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        html: `নতুন যোগ: <b>${created}</b> টি<br/>আপডেট: <b>${updated}</b> টি`,
        confirmButtonColor: "#7C3AED",
      });
    } else {
      Swal.fire({
        icon: created + updated > 0 ? "warning" : "error",
        title: "আংশিক সম্পন্ন",
        html: `নতুন যোগ: <b>${created}</b> টি, আপডেট: <b>${updated}</b> টি<br/><br/><span style="color:#dc2626">${failed.join(
          "<br/>"
        )}</span>`,
        confirmButtonColor: "#7C3AED",
      });
    }
  };

  /* ---------------- লেবেল — লাল তারকা সহ একটাই কোলন ---------------- */
  const ModalLabel = ({ children, required }) => (
    <label className="mb-1.5 block text-[13px] font-bold text-[#5B21B6]">
      {children}
      {required && <span className="text-red-500"> *</span>} :
    </label>
  );

  // Table Data Columns
  const columns = [
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
      render: (row) => <>{row?.Exam_Name?.ExamName}</>,
    },
    {
      title: translate("Class/Jamaat"),
      hozAlign: "center",
      render: (row) => <>{row?.Class?.SubClass}</>,
    },
    {
      title: translate("Fee Name"),
      hozAlign: "center",
      render: (row) => <>{getFeeName(row?.SLID)}</>,
    },
    {
      title: translate("Fee"),
      hozAlign: "center",
      render: (row) => (
        <span className="font-bold text-[#6D28D9]">{row?.Fee}</span>
      ),
    },
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
  ];

  return (
    <div className="font-SolaimanLipi space-y-4 bg-transparent">
      {/* ---------------- গ্রেডিয়েন্ট হেডার ---------------- */}
      <div className={`${C.gradient} rounded-xl shadow-lg px-5 py-4 text-white`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-white/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M9 15h6M9 11h6" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-[20px] font-bold leading-tight">
                {translate("Exam Fee Determine")}
              </h3>
              <p className="text-xs sm:text-sm text-white/80">
                শিক্ষাবর্ষ ও পরীক্ষা বেছে নিয়ে সব শ্রেণী/জামাতের ফি এক ক্লিকে নির্ধারণ করুন
              </p>
            </div>
          </div>

          {/* ফি নির্ধারণের পুরো ফর্ম মডালে খুলবে */}
          <button
            type="button"
            onClick={openSetupModal}
            className="flex items-center gap-2 bg-white text-[#6D28D9] font-bold text-sm px-4 py-2 rounded-lg shadow hover:bg-[#F5F3FF] transition"
          >
            <SvgIcon name="FaPlus" size={13} />
            নতুন যুক্ত করুন
          </button>
        </div>
      </div>

      <div className="bg-transparent p-6 md:p-4 rounded-xl shadow-none">
        {/* ডুপ্লিকেট থাকলে সতর্কবার্তা */}
        {duplicateRowCount > 0 && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {duplicateRowCount} টি রো-তে একই শিক্ষাবর্ষ, পরীক্ষা ও শ্রেণীর ফি একাধিকবার নির্ধারণ করা
            আছে। এতে পরীক্ষার্থী তালিকায় ভুল ফি দেখাতে পারে — বাড়তি রো-গুলো মুছে ফেলুন।
          </div>
        )}

        {/* ---------------- সার্চ + ফিল্টার বার ---------------- */}
        <div className={`${C.panel} border ${C.panelBorder} rounded-xl p-4`}>
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h4 className="text-sm font-bold text-[#5B21B6]">
              {translate("Search & Filter")}
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#6D28D9] border border-[#DDD6FE]">
              {filteredData.length} / {examFeeSettingData?.length ?? 0}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* সার্চ */}
            <div className="relative lg:col-span-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A78BFA]">
                <SvgIcon name="FiSearch" size={14} />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={translate("Search")}
                className={`${controlClass} pl-8`}
              />
            </div>

            {/* শিক্ষাবর্ষ */}
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className={controlClass}
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
              className={controlClass}
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
              className={controlClass}
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
                className={controlClass}
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
                  className="h-[38px] shrink-0 px-3 rounded-md border border-[#DDD6FE] bg-white text-sm font-medium text-[#6D28D9] hover:bg-[#F5F3FF] transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- নির্ধারিত ফি-র তালিকা ---------------- */}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <SortableTable
                columns={columns}
                data={paginatedData}
                isFilterColumn={false}
              />
            </div>
          )}
        </div>

        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ---------------- ফি নির্ধারণ — মডাল ----------------
          ⭐ backdrop-blur বাদ দেওয়া হয়েছে — এটা নতুন containing block বানায়,
          যার ভেতরে নেস্টেড <dialog> এর top-layer রেন্ডার ভেঙে যায়।
          ⭐ ছাত্র ফি গ্রুপ খোলা থাকলে এই মডাল শুধু লুকিয়ে থাকবে (আনমাউন্ট নয়),
          তাই ফর্মের ডেটা ও সিলেকশন অক্ষত থাকবে।
      --------------------------------------------------------- */}
      {showSetupModal && (
        <div
          style={{ display: showStudentFeeGroup ? "none" : undefined }}
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeSetupModal();
          }}
        >
          <div className="my-6 w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* মডাল হেডার */}
            <div className={`${C.gradient} flex items-center justify-between px-5 py-3.5`}>
              <div>
                <h4 className="text-[17px] font-bold text-white">
                  {translate("Exam Fee Determine")}
                </h4>
                <p className="text-[12px] text-white/80">
                  শিক্ষাবর্ষ, পরীক্ষা ও ফি-এর নাম বেছে নিয়ে শ্রেণীভিত্তিক ফি দিন
                </p>
              </div>
              <button
                type="button"
                onClick={closeSetupModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* মডাল বডি */}
            <div className="max-h-[75vh] overflow-y-auto px-5 py-5">
              <FormProvider {...methods}>
                <form className="w-full" onSubmit={(e) => e.preventDefault()}>
                  <div className={`${C.panel} border ${C.panelBorder} rounded-xl p-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <ModalLabel required>{translate("Session")}</ModalLabel>
                        <select className={modalSelectClass} {...register("SessionID")}>
                          <option value="">নির্বাচন করুন</option>
                          {(sessionData ?? []).map((s) => (
                            <option key={s.SessionID} value={s.SessionID}>
                              {s.SessionName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <ModalLabel required>{translate("Exam Name")}</ModalLabel>
                        <select className={modalSelectClass} {...register("ExamID")}>
                          <option value="">নির্বাচন করুন</option>
                          {(examNameData ?? []).map((e) => (
                            <option key={e.ExamID} value={e.ExamID}>
                              {e.ExamName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <ModalLabel required>{translate("Fee Name")}</ModalLabel>
                        <div className="flex items-center gap-2">
                          <select className={modalSelectClass} {...register("SLID")}>
                            <option value="">নির্বাচন করুন</option>
                            {(nameOfExamFeeData ?? []).map((f) => (
                              <option key={f.SLID} value={f.SLID}>
                                {f.SlName}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowStudentFeeGroup(true)}
                            title="নতুন ফি-এর নাম যুক্ত করুন"
                            className={`h-[42px] w-[42px] shrink-0 rounded-lg ${C.primary} flex items-center justify-center transition`}
                          >
                            <SvgIcon name="FaPlus" size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </FormProvider>

              {/* ---------------- শ্রেণী/জামাত গ্রিড ---------------- */}
              <div className="mt-4">
                {!SessionID || !ExamID ? (
                  <div className={`${C.soft} rounded-xl px-4 py-8 text-center text-sm font-medium`}>
                    শিক্ষাবর্ষ ও পরীক্ষা নির্বাচন করলে সব শ্রেণী/জামাতের তালিকা এখানে দেখাবে।
                  </div>
                ) : (
                  <div className={`border ${C.panelBorder} rounded-xl overflow-hidden bg-white`}>
                    {/* এক লাইনের টুলবার — টাইটেল, কমন ফি, রিসেট */}
                    <div className={`${C.panel} border-b ${C.panelBorder} px-4 py-3 flex items-center justify-between gap-2 flex-wrap`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#5B21B6] whitespace-nowrap">
                          {translate("Class/Jamaat")} — ফি নির্ধারণ
                        </h4>
                        <span
                          title="আগে থেকে নির্ধারিত শ্রেণীগুলো আপডেট হবে, বাকিগুলো নতুন যোগ হবে।"
                          className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#7C3AED] text-white cursor-help"
                        >
                          {selectedRows.length} / {classRows.length}
                        </span>
                      </div>

                      {/* <div className="flex items-center gap-2 flex-nowrap">
                        <button
                          type="button"
                          onClick={handleResetFees}
                          title="শুধু লেখা ফি-গুলো মুছবে"
                          className="h-[34px] shrink-0 px-2.5 rounded-md text-xs font-bold bg-white text-[#6D28D9] border border-[#DDD6FE] hover:bg-[#F5F3FF] transition whitespace-nowrap"
                        >
                          {translate("Reset")}
                        </button>
                        <input
                          type="number"
                          value={commonFee}
                          onChange={handleCommonFeeChange}
                          onKeyDown={blockNegativeKey}
                          min="0"
                          placeholder="সকল শ্রেণী ফি"
                          title="এখানে ফি লিখলেই নির্বাচিত সব শ্রেণীতে বসে যাবে"
                          className="h-[34px] w-[130px] shrink-0 border border-[#E9D5FF] rounded-md px-3 text-sm bg-white outline-none transition focus:border-[#7C3AED]"
                        />
                      </div> */}
                      <div className="flex items-center gap-2 flex-nowrap">
                        {/* ⭐ প্রথমে ফি-এর ইনপুট বক্স */}
                        <input
                          type="number"
                          value={commonFee}
                          onChange={handleCommonFeeChange}
                          onKeyDown={blockNegativeKey}
                          min="0"
                          placeholder="সকল শ্রেণী ফি"
                          title="এখানে ফি লিখলেই নির্বাচিত সব শ্রেণীতে বসে যাবে"
                          className="h-[34px] w-[130px] shrink-0 border border-[#E9D5FF] rounded-md px-3 text-sm bg-white outline-none transition focus:border-[#7C3AED]"
                        />
                        
                        {/* ⭐ এরপরে রিসেট বাটন */}
                        <button
                          type="button"
                          onClick={handleResetFees}
                          title="শুধু লেখা ফি-গুলো মুছবে"
                          className="h-[34px] shrink-0 px-2.5 rounded-md text-xs font-bold bg-white text-[#6D28D9] border border-[#DDD6FE] hover:bg-[#F5F3FF] transition whitespace-nowrap"
                        >
                          {translate("Reset")}
                        </button>
                      </div>
                    </div>

                    {/* কলাম হেডার — প্রথম ঘরে সব নির্বাচন/সব বাদ চেকবক্স */}
                    <div className="grid grid-cols-[40px_1fr] sm:grid-cols-[40px_1fr_160px_120px] gap-2 items-center px-4 py-2 bg-[#F5F3FF] text-[12px] font-bold text-[#5B21B6]">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleAll}
                        disabled={classRows.length === 0}
                        title="সব নির্বাচন / সব বাদ"
                        className="h-4 w-4 accent-[#7C3AED] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      />
                      <span>{translate("Class/Jamaat")}</span>
                      <span className="hidden sm:block">{translate("Fee")}</span>
                      <span className="hidden sm:block text-center">অবস্থা</span>
                    </div>

                    {/* রো গুলো */}
                    <div className="max-h-[340px] overflow-y-auto divide-y divide-[#F3E8FF]">
                      {classRows.map((row) => (
                        <div
                          key={row.id}
                          className={`grid grid-cols-[40px_1fr] sm:grid-cols-[40px_1fr_160px_120px] gap-2 items-center px-4 py-2 transition ${
                            row.checked ? "bg-white" : "bg-gray-50/60"
                          } hover:bg-[#FAF5FF]`}
                        >
                          <input
                            type="checkbox"
                            checked={row.checked}
                            onChange={(e) =>
                              setClassValue(row.id, { checked: e.target.checked })
                            }
                            className="h-4 w-4 accent-[#7C3AED] cursor-pointer"
                          />

                          <span className="text-sm font-medium text-gray-700">
                            {row.name}
                          </span>

                          <input
                            type="number"
                            value={row.fee}
                            onChange={(e) =>
                              setClassValue(row.id, {
                                fee: sanitizeFee(e.target.value),
                                checked: true,
                              })
                            }
                            onKeyDown={blockNegativeKey}
                            min="0"
                            placeholder="ফি"
                            className={`${controlClass} col-start-2 sm:col-start-auto`}
                          />

                          <div className="col-start-2 sm:col-start-auto flex sm:justify-center">
                            {row.existing ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                                নির্ধারিত
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]">
                                নতুন
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* মডাল ফুটার */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3.5">
              <button
                type="button"
                onClick={closeSetupModal}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-[13px] font-bold text-gray-600 transition hover:bg-gray-100"
              >
                {translate("Cancel")}
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className={`rounded-lg px-6 py-2 text-[13px] font-bold ${C.primary} shadow-sm transition ${
                  saving ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {saving
                  ? "সংরক্ষণ হচ্ছে..."
                  : `সব সংরক্ষণ করুন (${selectedRows.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Student Fee Group — মডাল ----------------
          ⭐ z-50 এবং পোর্টাল ছাড়া — এর ভেতরের "Sub Sidiary Ledger" মডালটা
          রিডাক্স দিয়ে লেআউট লেভেলে রেন্ডার হয়, তাই এই ওভারলে বেশি z-index
          বা body-পোর্টাল পেলে ওটাকে ঢেকে ফেলে।
      --------------------------------------------------------- */}
      {showStudentFeeGroup && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-6 w-full max-w-5xl rounded-xl shadow-2xl">
            <StudentFeeGroup onBack={() => setShowStudentFeeGroup(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamFeeDetermine;
