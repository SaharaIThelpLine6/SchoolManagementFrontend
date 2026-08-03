import { useCallback, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import Button from "../components/Button/Button";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import useTranslate from "../utils/Translate";

import { useGetUserTypesQuery } from "../features/userType/userTypeSlice";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import SvgIcon from "../components/icons/SvgIcon";
import { useGetClassListQuery, useGetSubClassListQuery } from "../features/class/classQuerySlice";
import { showModal } from "../utils/ModalControlar";

/* ------------------------------------------------------------------ */
/*  DEMO / EXAMPLE DATA — remove once the real RTK Query endpoint is wired */
/* ------------------------------------------------------------------ */
const STUDENT_LIST = [
  { id: "10012", name: "আয়েশা আখতার", father: "আবু জাফর", mobile: "017263282..." },
  { id: "10102", name: "আয়শা আক্তার মাহি", father: "সাইফুল ইসলাম ইম...", mobile: "017320032..." },
  { id: "10103", name: "ইশতা আক্তার", father: "ইশার আলী", mobile: "017525515..." },
  { id: "10104", name: "আমেনা আক্তার", father: "মুমিনুল ইসলাম", mobile: "017211999..." },
  { id: "10105", name: "উম্মে হাবিবা", father: "মো: এলেম", mobile: "017191738..." },
  { id: "10106", name: "জুই আক্তার ঝুমুর", father: "মো: জুয়েল", mobile: "017754605..." },
  { id: "10107", name: "সুফিয়া জাহান শোভা", father: "ফরাদ সরকার সুমন", mobile: "013382291..." },
  { id: "10098", name: "তামিমা সুলতানা", father: "মো: সাইফুল ইসলাম", mobile: "019529359..." },
  { id: "10109", name: "আফরোজা আক্তার", father: "হোসেন শেখ", mobile: "017807109..." },
  { id: "10110", name: "রফিকুল ইসলাম", father: "জাহিদুল ইসলাম", mobile: "019852356..." },
];
/* ------------------------------------------------------------------ */

const AttendenceTimeSetting = ({ pageTitle }) => {
  const translate = useTranslate();

  const method = useForm({
    defaultValues: {
      UserTypeID: "",
      UserCode: "",
      SessionID: "",
      ClassID: "",
    },
  });

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classData } = useGetClassListQuery();
  const { data: userType = [] } = useGetUserTypesQuery();

  const [students, setStudents] = useState(STUDENT_LIST);
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    return students.filter(
      (s) =>
        s.name.includes(search) ||
        s.father.includes(search) ||
        s.id.includes(search) ||
        s.mobile.includes(search)
    );
  }, [students, search]);

  // clicking the delete icon skips/removes that student from the list
  const handleSkip = (student) => {
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
  };


  const handleShiftEntry = useCallback(() => {
    showModal(translate('Shift Entry'), 'SHIFT_ENTRY');
  }, [translate]);
  const handleSecheduleShiftTimeEntry = useCallback(() => {
    showModal(translate('Schedule Shift Time Entry'), 'SCHEDULE_SHIFT_ENTRY');
  }, [translate]);
  const handleShiftTimeSetting = useCallback(() => {
    showModal(translate('Shift Time Setting'), 'SHIFT_TIME_SETTING');
  }, [translate]);

  return (
    <FormProvider {...method}>
      <div className="font-lato bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        {/* Header & Filters */}
        <div className="filter_header border-b border-[#e9edf4] flex flex-col sm:flex-row items-start sm:items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6 gap-4">
          <h3 className="font-SolaimanLipi text-[18px] sm:text-[20px] font-bold">{pageTitle}</h3>
          <div className="flex gap-2">
            <Button onClick={() => handleShiftEntry()}>
              {translate('Shift Entry')}
            </Button>
            <Button onClick={() => handleSecheduleShiftTimeEntry()}>
              {translate('Schedule Shift Time Entry')}
            </Button>
            <Button onClick={() => handleShiftTimeSetting()}>
              {translate('Shift Time Setting')}
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            <DefaultSelect
              label={translate("User Type")}
              options={userType}
              valueField="ID"
              nameField="TypeName"
              registerKey="UserTypeID"
              placeholder={translate("Select User Type")}
            />
            <DefaultSelect
              label={"Class"}
              options={classData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ClassID"
            />

            <DefaultInput
              label={translate("User Code")}
              registerKey="UserCode"
              type="number"
              placeholder={translate("Search by user code...")}
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Left student table — example data                             */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full">
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Panel header — stacks on small screens */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-blue-500  px-3 sm:px-4 py-2.5 gap-2 sm:gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <SvgIcon name="users" className="h-4 w-4 text-slate-300" />
                <span className="text-[13px] font-semibold text-white whitespace-nowrap">
                  {translate("শিক্ষার্থীর তালিকা")}
                </span>
                <span className="rounded-full bg-blue-800/90 px-2 py-0.5 text-[11px] font-bold text-white">
                  {filteredStudents.length}
                </span>
              </div>
              <div className="relative w-full sm:max-w-[220px]">
                <SvgIcon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={translate("নাম, আইডি বা মোবাইল দিয়ে খুঁজুন")}
                  className="w-full rounded-md bg-blue-600 border border-blue-400 pl-8 pr-2 py-1.5 text-[12px] text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                />
              </div>
            </div>

            {/* Table body — horizontally scrollable on small screens so columns never get crushed */}
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-[56px_90px_1fr_1fr_130px] bg-blue-50 px-2 py-2 text-[12px] font-bold text-blue-700 border-b border-blue-100">
                  <span className="text-center">{translate("অ্যাকশন")}</span>
                  <span>{translate("আইডি")}</span>
                  <span>{translate("শিক্ষার্থীর নাম")}</span>
                  <span>{translate("পিতার নাম")}</span>
                  <span>{translate("মোবাইল")}</span>
                </div>

                <div className="max-h-[480px] overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
                      <SvgIcon name="search" className="h-8 w-8" />
                      <p className="text-[13px]">
                        {students.length === 0
                          ? translate("কোনো শিক্ষার্থী নেই")
                          : translate("কোনো ফলাফল পাওয়া যায়নি")}
                      </p>
                    </div>
                  ) : (
                    filteredStudents.map((s, idx) => (
                      <div
                        key={s.id}
                        className={`grid grid-cols-[56px_90px_1fr_1fr_130px] items-center px-2 py-2 text-[13px] border-b border-slate-100 last:border-b-0 transition-colors ${idx % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/60 hover:bg-slate-50"
                          }`}
                      >
                        <span className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleSkip(s)}
                            title={translate("এই শিক্ষার্থীকে বাদ দিন")}
                            className="flex items-center justify-center h-7 w-7 rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            <SvgIcon name="FaTrash" className="h-3.5 w-3.5" />
                          </button>
                        </span>
                        <span className="text-slate-500 font-medium truncate pr-2">{s.id}</span>
                        <span className="font-SolaimanLipi text-slate-800 truncate pr-2">{s.name}</span>
                        <span className="font-SolaimanLipi text-slate-600 truncate pr-2">{s.father}</span>
                        <span className="text-slate-500 truncate pr-2">{s.mobile}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default AttendenceTimeSetting;
// import Swal from "sweetalert2";
// import { FormProvider, useForm, useWatch } from "react-hook-form";
// import Button from "../components/Button/Button";
// import DefaultSelect from "../components/Forms/DefaultSelect";
// import DefaultInput from "../components/Forms/DefaultInput";
// import useTranslate from "../utils/Translate";


// import { useGetUserTypesQuery } from "../features/userType/userTypeSlice";
// import { useGetSessionsQuery } from "../features/session/sessionSlice";
// import SvgIcon from "../components/icons/SvgIcon";
// import { useGetClassListQuery, useGetSubClassListQuery } from "../features/class/classQuerySlice";


// const AttendenceTimeSetting = ({ pageTitle }) => {
//   const translate = useTranslate();

//   const method = useForm({
//     defaultValues: {
//       UserTypeID: "",
//       UserCode: "",
//       SessionID: "",
//       ClassID: "",
//     },
//   });


//   const { data: sessionData } = useGetSessionsQuery();
//   const { data: classData } = useGetClassListQuery();
//   const { data: userType = [] } = useGetUserTypesQuery();

//   return (
//     <FormProvider {...method}>
//       <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
//         {/* Header & Filters */}
//         <div className="filter_header border-b border-[#e9edf4] flex flex-col sm:flex-row items-start sm:items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6 gap-4">
//           <h3 className="font-SolaimanLipi text-[20px] font-bold">{pageTitle}</h3>

//         </div>

//         <div className="bg-gray-50 p-4 rounded-lg mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
//             <DefaultSelect
//               label={translate("User Type")}
//               options={userType}
//               valueField="ID"
//               nameField="TypeName"
//               registerKey="UserTypeID"
//               placeholder={translate("Select User Type")}
//             />
//             <DefaultSelect
//               label={"Session"}
//               options={sessionData ?? []}
//               valueField="SessionID"
//               nameField="SessionName"
//               registerKey="SessionID"
//             />
//             <DefaultSelect
//               label={"Class"}
//               options={classData ?? []}
//               valueField="ClassID"
//               nameField="ClassName"
//               registerKey="ClassID"
//             />

//             <DefaultInput
//               label={translate("User Code")}
//               registerKey="UserCode"
//               type="number"
//               placeholder={translate("Search by user code...")}
//             />


//           </div>
//         </div>


//       </div>
//     </FormProvider>
//   );
// };




// export default AttendenceTimeSetting