import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  banglaDigitMap,
  banglaMonthMap,
  englishMonthMap,
  arabicMonthMap,
  months,
} from "../../Data/monthsData";
import { fetchClassData } from "../../features/class/classSlice";
import {
  useEditMonthMutation,
  useGetMonthListQuery,
  useInsertMonthMutation,
} from "../../features/months/montListSlice";
import { fetchSettingsData } from "../../features/settings/settingsSlice";
import { hideModal } from "../../utils/ModalControlar";
import useTranslate from "../../utils/Translate";
import Button from "../Button/Button";
import Input from "../Input/Input";
import DefaultSelect from "./DefaultSelect";

const DESKTOP_QUERY = "(min-width: 768px)";

/* ---------- Class chip ---------- */
const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor">
    <path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9h-2zM9 7a3 3 0 0 1 6 0v2H9V7z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClassChip = ({ label, selected, locked, disabled, onClick }) => {
  const base =
    "relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 select-none";
  const state = locked
    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
    : selected
      ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-2 ring-blue-100"
      : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50/50 active:scale-95";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked || disabled}
      title={locked ? "এই সেশনে ইতিমধ্যে মাসের নাম আছে" : undefined}
      className={`${base} ${state}`}
    >
      {selected && !locked && <CheckIcon />}
      {label}
      {locked && (
        <span className="absolute -top-2 -right-1 w-4 h-4 rounded-full bg-white border border-pink-300 text-pink-500 flex items-center justify-center shadow-sm">
          <LockIcon />
        </span>
      )}
    </button>
  );
};

const MonthNamesForm = ({ id, isEdit = false }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const inputRefs = useRef({});

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const handler = (e) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { academicSession, status: settingsStatus } = useSelector(
    (state) => state.settings
  );
  const { classList, status: classStatus } = useSelector(
    (state) => state.class
  );

  // ✅ skip সরানো হয়েছে — locked class বের করার জন্য সবসময় লাগবে
  const { data: monthsList = [] } = useGetMonthListQuery();

  const [insertMonth, { isLoading: isSaving }] = useInsertMonthMutation();
  const [editMonth, { isLoading: isUpdating }] = useEditMonthMutation();

  const methods = useForm({
    defaultValues: {
      monthData: months.map(() => ({ bangla: "", english: "", arabic: "" })),
      ClassIDs: [],
      SessionID: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = methods;

  const { fields } = useFieldArray({ control, name: "monthData" });

  // ✅ ClassIDs custom field validation
  useEffect(() => {
    register("ClassIDs", {
      validate: (v) =>
        (Array.isArray(v) && v.length > 0) || translate("Class is required"),
    });
  }, [register]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedIds = watch("ClassIDs") || [];
  const sessionId = watch("SessionID");

  // ✅ নির্বাচিত session এ যে class গুলোর data আছে সেগুলো lock
  const lockedIds = useMemo(() => {
    if (isEdit || !sessionId) return new Set();
    return new Set(
      monthsList
        .filter((m) => String(m.SessionID) === String(sessionId))
        .map((m) => Number(m.ClassID))
    );
  }, [monthsList, sessionId, isEdit]);

  // session বদলালে locked class selection থেকে বাদ
  useEffect(() => {
    if (isEdit || lockedIds.size === 0) return;
    const current = methods.getValues("ClassIDs") || [];
    const filtered = current.filter((cid) => !lockedIds.has(cid));
    if (filtered.length !== current.length) {
      setValue("ClassIDs", filtered, { shouldValidate: true });
    }
  }, [lockedIds, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  const defaultValues = useMemo(() => {
    if (!isEdit || !id) return null;

    const item = monthsList.find((m) => String(m.ID) === String(id));
    if (!item) return null;

    const monthDataArray = months.map((_, index) => ({
      bangla: item[`Month${index + 1}`] || "",
      english: item[`EnglishMonth${index + 1}`] || "",
      arabic: item[`ArabicMonth${index + 1}`] || "",
    }));

    return {
      monthData: monthDataArray,
      ClassIDs: item?.ClassID ? [Number(item.ClassID)] : [],
      SessionID: item?.SessionID || "",
    };
  }, [id, monthsList, isEdit]);

  useEffect(() => {
    if (settingsStatus === "idle") dispatch(fetchSettingsData());
    if (classStatus === "idle") dispatch(fetchClassData());
  }, [dispatch, settingsStatus, classStatus]);

  useEffect(() => {
    if (isEdit && defaultValues) {
      reset(defaultValues);
    } else if (!isEdit) {
      reset({
        ClassIDs: [],
        SessionID: "",
        monthData: months.map(() => ({ bangla: "", english: "", arabic: "" })),
      });
    }
  }, [defaultValues, isEdit, reset]);

  const isLoading =
    settingsStatus !== "succeeded" || classStatus !== "succeeded";

  if (isEdit && !defaultValues) {
    return (
      <div className="text-center py-10 font-bold text-teal-600">
        Loading Month Data...
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="text-center py-10 font-bold text-teal-600">
        Loading Data...
      </div>
    );

  /* ---------- Class chip handlers ---------- */
  const toggleClass = (classId) => {
    const next = selectedIds.includes(classId)
      ? selectedIds.filter((c) => c !== classId)
      : [...selectedIds, classId];
    setValue("ClassIDs", next, { shouldValidate: true, shouldDirty: true });
  };

  const selectableIds = classList
    .map((c) => Number(c.ClassID))
    .filter((cid) => !lockedIds.has(cid));
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((cid) => selectedIds.includes(cid));

  const toggleAll = () =>
    setValue("ClassIDs", allSelected ? [] : selectableIds, {
      shouldValidate: true,
      shouldDirty: true,
    });

  // edit এ শুধু ওই class টাই দেখাবে
  const visibleClasses = isEdit
    ? classList.filter((c) => selectedIds.includes(Number(c.ClassID)))
    : classList;

  const convertBanglaToEnglishDigit = (str) =>
    str
      .split("")
      .map((char) => banglaDigitMap[char] ?? char)
      .join("");

  const autoConvertMonthName = (value, type) => {
    const num = parseInt(convertBanglaToEnglishDigit(value), 10);
    if (!num || num < 1 || num > 12) return null;

    if (type === "bangla") return banglaMonthMap[num];
    if (type === "english") return englishMonthMap[num];
    if (type === "arabic") return arabicMonthMap[num];
    return null;
  };

  const handleKeyDown = (e, index, fieldType) => {
    if (e.key !== "Enter" && e.key !== "Tab") return;

    const inputVal = e.target.value.trim();
    if (!inputVal) return;

    const convertedVal = autoConvertMonthName(inputVal, fieldType);
    if (!convertedVal) return;

    e.preventDefault();
    e.stopPropagation();

    e.target.value = convertedVal;

    setValue(`monthData.${index}.${fieldType}`, convertedVal, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const nextIndex = index + 1;
    if (nextIndex >= months.length) return;

    const nextInput = inputRefs.current[`${nextIndex}-${fieldType}`];
    if (nextInput) {
      nextInput.focus();
      try {
        nextInput.select();
      } catch (err) {
        /* ignore */
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = { SessionID: data.SessionID };

      data.monthData.forEach((item, index) => {
        const i = index + 1;
        payload[`Month${i}`] = item.bangla;
        payload[`EnglishMonth${i}`] = item.english;
        payload[`ArabicMonth${i}`] = item.arabic;
      });

      if (isEdit) {
        await editMonth({ id, ClassID: data.ClassIDs[0], ...payload }).unwrap();
      } else {
        await insertMonth({ ClassIDs: data.ClassIDs, ...payload }).unwrap();
      }

      Swal.fire({
        title: translate(
          isEdit ? "Updated successfully!" : "Saved successfully!"
        ),
        text:
          !isEdit && data.ClassIDs.length > 1
            ? `${data.ClassIDs.length} টি ক্লাসের জন্য সংরক্ষণ হয়েছে`
            : undefined,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      reset();
      hideModal();
    } catch (error) {
      console.error("Save failed", error);
      const existNames = error?.data?.existClassNames;
      Swal.fire({
        icon: "error",
        title: translate("Failed to save data"),
        text: existNames?.length
          ? `${error?.data?.message}: ${existNames.join(", ")}`
          : error?.data?.message || "Something went wrong",
      });
    }
  };

  const registerWithRef = (name, key) => {
    const { ref, ...rest } = register(name, { required: "Required" });
    return {
      ...rest,
      ref: (el) => {
        ref(el);
        if (el) {
          inputRefs.current[key] = el;
        } else {
          delete inputRefs.current[key];
        }
      },
    };
  };

  const placeholders = {
    bangla: "বাংলা নাম...",
    english: "English name...",
    arabic: "الاسم العربي...",
  };

  const renderInput = (index, type) => (
    <Input
      label="hidden"
      {...registerWithRef(`monthData.${index}.${type}`, `${index}-${type}`)}
      onKeyDown={(e) => handleKeyDown(e, index, type)}
      placeholder={placeholders[type]}
      dir={type === "arabic" ? "rtl" : undefined}
      error={!!errors?.monthData?.[index]?.[type]}
      autoComplete="off"
    />
  );

  const busy = isSaving || isUpdating;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="font-SolaimanLipi"
      >
        {/* Top: Session + Class chips */}
        <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="max-w-sm">
            <DefaultSelect
              options={academicSession}
              require={translate("Session is required")}
              nameField={"SessionName"}
              valueField={"SessionID"}
              registerKey={"SessionID"}
              type={"number"}
              label="Session"
              unicode
              disabled={isEdit}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                {translate("Class")}
                {!isEdit && selectedIds.length > 0 && (
                  <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {selectedIds.length} নির্বাচিত
                  </span>
                )}
              </label>

              {!isEdit && selectableIds.length > 1 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {allSelected ? "সব বাদ দিন" : "সব নির্বাচন"}
                </button>
              )}
            </div>

            <div
              className={`flex flex-wrap gap-x-2.5 gap-y-3 p-3 rounded-lg bg-gray-50 border ${errors?.ClassIDs ? "border-red-400" : "border-gray-100"
                }`}
            >
              {visibleClasses.map((c) => {
                const cid = Number(c.ClassID);
                return (
                  <ClassChip
                    key={cid}
                    label={(c.ClassName || "").trim()}
                    selected={selectedIds.includes(cid)}
                    locked={lockedIds.has(cid)}
                    disabled={isEdit}
                    onClick={() => toggleClass(cid)}
                  />
                );
              })}
            </div>

            {errors?.ClassIDs && (
              <p className="mt-1.5 text-xs text-red-500">
                {errors.ClassIDs.message}
              </p>
            )}
          </div>
        </div>

        {/* Month Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {isDesktop ? (
            <div className="grid grid-cols-12 bg-blue-600 text-white font-semibold text-sm">
              <div className="col-span-2 p-3 text-center border-r border-blue-500">
                {translate("Month")}
              </div>
              <div className="col-span-3 p-3 text-center border-r border-blue-500">
                {translate("Bangla Name")}
              </div>
              <div className="col-span-3 p-3 text-center border-r border-blue-500">
                {translate("English Name")}
              </div>
              <div className="col-span-4 p-3 text-center">
                {translate("Arabic Name")}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 bg-blue-600 text-white font-semibold text-xs">
              <div className="p-2 text-center border-r border-blue-500">
                {translate("Bangla Name")}
              </div>
              <div className="p-2 text-center border-r border-blue-500">
                {translate("English Name")}
              </div>
              <div className="p-2 text-center">{translate("Arabic Name")}</div>
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={`border-b border-gray-100 transition-colors hover:bg-blue-50/30 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
              >
                {isDesktop ? (
                  <div className="grid grid-cols-12">
                    <div className="col-span-2 flex items-center justify-center p-2 text-sm font-medium text-gray-700 border-r border-gray-100 bg-gray-100/50">
                      {translate(months[index])}
                    </div>
                    <div className="col-span-3 p-1.5 border-r border-gray-100">
                      {renderInput(index, "bangla")}
                    </div>
                    <div className="col-span-3 p-1.5 border-r border-gray-100">
                      {renderInput(index, "english")}
                    </div>
                    <div className="col-span-4 p-1.5">
                      {renderInput(index, "arabic")}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    <div className="text-xs font-semibold text-gray-700 bg-gray-100/70 inline-block px-2 py-0.5 rounded">
                      {translate(months[index])}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {renderInput(index, "bangla")}
                      {renderInput(index, "english")}
                      {renderInput(index, "arabic")}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons - sticky at bottom */}
        <div className="sticky bottom-0 -mx-4 px-4 py-3 mt-6 bg-white/95 backdrop-blur border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 z-10">
          <Button
            type="button"
            onClick={hideModal}
            className="!bg-gray-500 hover:!bg-gray-600 !text-white !px-6 w-full sm:w-auto"
          >
            {translate("Close")}
          </Button>
          <Button
            type="submit"
            disabled={busy}
            className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-8 shadow-md w-full sm:w-auto disabled:opacity-60"
          >
            {busy ? "..." : translate(isEdit ? "Update" : "Save")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default MonthNamesForm;
// import { useEffect, useMemo, useRef, useState } from "react";
// import { FormProvider, useForm, useFieldArray } from "react-hook-form";
// import { useDispatch, useSelector } from "react-redux";
// import Swal from "sweetalert2";
// import {
//   banglaDigitMap,
//   banglaMonthMap,
//   englishMonthMap,
//   arabicMonthMap,
//   months,
// } from "../../Data/monthsData";
// import { fetchClassData } from "../../features/class/classSlice";
// import {
//   useEditMonthMutation,
//   useGetMonthListQuery,
//   useInsertMonthMutation,
// } from "../../features/months/montListSlice";
// import { fetchSettingsData } from "../../features/settings/settingsSlice";
// import { hideModal } from "../../utils/ModalControlar";
// import useTranslate from "../../utils/Translate";
// import Button from "../Button/Button";
// import Input from "../Input/Input";
// import DefaultSelect from "./DefaultSelect";

// const DESKTOP_QUERY = "(min-width: 768px)";

// const MonthNamesForm = ({ id, isEdit = false }) => {
//   const translate = useTranslate();
//   const dispatch = useDispatch();
//   const inputRefs = useRef({});

//   // শুধু একটি layout render করার জন্য
//   const [isDesktop, setIsDesktop] = useState(
//     typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches
//   );

//   useEffect(() => {
//     const mq = window.matchMedia(DESKTOP_QUERY);
//     const handler = (e) => setIsDesktop(e.matches);
//     setIsDesktop(mq.matches);
//     mq.addEventListener("change", handler);
//     return () => mq.removeEventListener("change", handler);
//   }, []);

//   const { academicSession, status: settingsStatus } = useSelector(
//     (state) => state.settings
//   );
//   const { classList, status: classStatus } = useSelector(
//     (state) => state.class
//   );

//   console.log(classList, "classList")

//   const { data: monthsList = [] } = useGetMonthListQuery(undefined, {
//     skip: !isEdit,
//   });

//   const [insertMonth] = useInsertMonthMutation();
//   const [editMonth] = useEditMonthMutation();

//   const methods = useForm({
//     defaultValues: {
//       monthData: months.map(() => ({ bangla: "", english: "", arabic: "" })),
//       ClassID: "",
//       SessionID: "",
//     },
//   });

//   const {
//     register,
//     handleSubmit,
//     reset,
//     setValue,
//     control,
//     formState: { errors },
//   } = methods;

//   const { fields } = useFieldArray({
//     control,
//     name: "monthData",
//   });

//   const defaultValues = useMemo(() => {
//     if (!isEdit || !id) return null;

//     const item = monthsList.find((m) => String(m.ID) === String(id));
//     if (!item) return null;

//     const monthDataArray = months.map((_, index) => ({
//       bangla: item[`Month${index + 1}`] || "",
//       english: item[`EnglishMonth${index + 1}`] || "",
//       arabic: item[`ArabicMonth${index + 1}`] || "",
//     }));

//     return {
//       monthData: monthDataArray,
//       ClassID: item?.ClassID || "",
//       SessionID: item?.SessionID || "",
//     };
//   }, [id, monthsList, isEdit]);

//   useEffect(() => {
//     if (settingsStatus === "idle") dispatch(fetchSettingsData());
//     if (classStatus === "idle") dispatch(fetchClassData());
//   }, [dispatch, settingsStatus, classStatus]);

//   useEffect(() => {
//     if (isEdit && defaultValues) {
//       reset(defaultValues);
//     } else if (!isEdit) {
//       reset({
//         ClassID: "",
//         SessionID: "",
//         monthData: months.map(() => ({ bangla: "", english: "", arabic: "" })),
//       });
//     }
//   }, [defaultValues, isEdit, reset]);

//   const isLoading =
//     settingsStatus !== "succeeded" || classStatus !== "succeeded";

//   if (isEdit && !defaultValues) {
//     return (
//       <div className="text-center py-10 font-bold text-teal-600">
//         Loading Month Data...
//       </div>
//     );
//   }

//   if (isLoading)
//     return (
//       <div className="text-center py-10 font-bold text-teal-600">
//         Loading Data...
//       </div>
//     );

//   const convertBanglaToEnglishDigit = (str) =>
//     str
//       .split("")
//       .map((char) => banglaDigitMap[char] ?? char)
//       .join("");

//   const autoConvertMonthName = (value, type) => {
//     const num = parseInt(convertBanglaToEnglishDigit(value), 10);
//     if (!num || num < 1 || num > 12) return null;

//     if (type === "bangla") return banglaMonthMap[num];
//     if (type === "english") return englishMonthMap[num];
//     if (type === "arabic") return arabicMonthMap[num];
//     return null;
//   };

//   const handleKeyDown = (e, index, fieldType) => {
//     if (e.key !== "Enter" && e.key !== "Tab") return;

//     const inputVal = e.target.value.trim();
//     if (!inputVal) return;

//     const convertedVal = autoConvertMonthName(inputVal, fieldType);
//     if (!convertedVal) return;

//     e.preventDefault();
//     e.stopPropagation();

//     e.target.value = convertedVal;

//     setValue(`monthData.${index}.${fieldType}`, convertedVal, {
//       shouldValidate: true,
//       shouldDirty: true,
//     });

//     // একই column এর পরের মাসে যাবে (Bangla -> Bangla, English -> English, Arabic -> Arabic)
//     const nextIndex = index + 1;

//     // শেষ মাসের পরে আর যাবে না
//     if (nextIndex >= months.length) return;

//     const nextInput = inputRefs.current[`${nextIndex}-${fieldType}`];

//     if (nextInput) {
//       nextInput.focus();
//       try {
//         nextInput.select();
//       } catch (err) {
//         /* ignore */
//       }
//     }
//   };

//   const onSubmit = async (data) => {
//     try {
//       const payload = {
//         ClassID: data.ClassID,
//         SessionID: data.SessionID,
//       };

//       data.monthData.forEach((item, index) => {
//         const i = index + 1;
//         payload[`Month${i}`] = item.bangla;
//         payload[`EnglishMonth${i}`] = item.english;
//         payload[`ArabicMonth${i}`] = item.arabic;
//       });

//       if (isEdit) {
//         await editMonth({ id, ...payload }).unwrap();
//       } else {
//         await insertMonth(payload).unwrap();
//       }

//       Swal.fire({
//         title: translate(
//           isEdit ? "Updated successfully!" : "Saved successfully!"
//         ),
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false,
//       });

//       reset();
//       hideModal();
//     } catch (error) {
//       console.error("Save failed", error);
//       Swal.fire({
//         icon: "error",
//         title: translate("Failed to save data"),
//         text: error?.data?.message || "Something went wrong",
//       });
//     }
//   };

//   const registerWithRef = (name, key) => {
//     const { ref, ...rest } = register(name, { required: "Required" });
//     return {
//       ...rest,
//       ref: (el) => {
//         ref(el);
//         if (el) {
//           inputRefs.current[key] = el;
//         } else {
//           delete inputRefs.current[key];
//         }
//       },
//     };
//   };

//   const placeholders = {
//     bangla: "বাংলা নাম...",
//     english: "English name...",
//     arabic: "الاسم العربي...",
//   };

//   const renderInput = (index, type) => (
//     <Input
//       label="hidden"
//       {...registerWithRef(`monthData.${index}.${type}`, `${index}-${type}`)}
//       onKeyDown={(e) => handleKeyDown(e, index, type)}
//       placeholder={placeholders[type]}
//       dir={type === "arabic" ? "rtl" : undefined}
//       error={!!errors?.monthData?.[index]?.[type]}
//       autoComplete="off"
//     />
//   );

//   return (
//     <FormProvider {...methods}>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="font-default bg-gray-50 p-3 sm:p-4 rounded-lg"
//       >
//         {/* Top: Session & Class */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded shadow-sm border border-gray-200">
//           <DefaultSelect
//             options={academicSession}
//             require={translate("Session is required")}
//             nameField={"SessionName"}
//             valueField={"SessionID"}
//             registerKey={"SessionID"}
//             type={"number"}
//             label="Academic Session"
//             unicode
//             disabled={isEdit}
//           />

//           <DefaultSelect
//             options={classList}
//             require={translate("Class is required")}
//             nameField={"ClassName"}
//             valueField={"ClassID"}
//             registerKey={"ClassID"}
//             type={"number"}
//             label="Class"
//             unicode
//             disabled={isEdit}
//           />
//         </div>

//         {/* Month Table */}
//         <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
//           {isDesktop ? (
//             /* Desktop header */
//             <div className="grid grid-cols-12 bg-blue-600 text-white font-semibold text-sm">
//               <div className="col-span-2 p-3 text-center border-r border-blue-500">
//                 {translate("Month")}
//               </div>
//               <div className="col-span-3 p-3 text-center border-r border-blue-500">
//                 {translate("Bangla Name")}
//               </div>
//               <div className="col-span-3 p-3 text-center border-r border-blue-500">
//                 {translate("English Name")}
//               </div>
//               <div className="col-span-4 p-3 text-center">
//                 {translate("Arabic Name")}
//               </div>
//             </div>
//           ) : (
//             /* Mobile header */
//             <div className="grid grid-cols-3 bg-blue-600 text-white font-semibold text-xs">
//               <div className="p-2 text-center border-r border-blue-500">
//                 {translate("Bangla Name")}
//               </div>
//               <div className="p-2 text-center border-r border-blue-500">
//                 {translate("English Name")}
//               </div>
//               <div className="p-2 text-center">{translate("Arabic Name")}</div>
//             </div>
//           )}

//           <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
//             {fields.map((field, index) => (
//               <div
//                 key={field.id}
//                 className={`border-b border-gray-100 transition-colors hover:bg-blue-50/30 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
//                   }`}
//               >
//                 {isDesktop ? (
//                   /* Desktop row */
//                   <div className="grid grid-cols-12">
//                     <div className="col-span-2 flex items-center justify-center p-2 text-sm font-medium text-gray-700 border-r border-gray-100 bg-gray-100/50">
//                       {translate(months[index])}
//                     </div>

//                     <div className="col-span-3 p-1.5 border-r border-gray-100">
//                       {renderInput(index, "bangla")}
//                     </div>

//                     <div className="col-span-3 p-1.5 border-r border-gray-100">
//                       {renderInput(index, "english")}
//                     </div>

//                     <div className="col-span-4 p-1.5">
//                       {renderInput(index, "arabic")}
//                     </div>
//                   </div>
//                 ) : (
//                   /* Mobile card */
//                   <div className="p-3 space-y-2">
//                     <div className="text-xs font-semibold text-gray-700 bg-gray-100/70 inline-block px-2 py-0.5 rounded">
//                       {translate(months[index])}
//                     </div>

//                     <div className="grid grid-cols-1 gap-2">
//                       {renderInput(index, "bangla")}
//                       {renderInput(index, "english")}
//                       {renderInput(index, "arabic")}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
//           <Button
//             type="button"
//             onClick={hideModal}
//             className="!bg-gray-500 hover:!bg-gray-600 !text-white !px-6 w-full sm:w-auto"
//           >
//             {translate("Close")}
//           </Button>
//           <Button
//             type="submit"
//             className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-8 shadow-md w-full sm:w-auto"
//           >
//             {translate(isEdit ? "Update" : "Save")}
//           </Button>
//         </div>
//       </form>
//     </FormProvider>
//   );
// };

// export default MonthNamesForm;
