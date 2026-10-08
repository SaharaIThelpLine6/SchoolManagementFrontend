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

const MonthNamesForm = ({ id, isEdit = false }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const inputRefs = useRef({});

  // শুধু একটি layout render করার জন্য
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

  const { data: monthsList = [] } = useGetMonthListQuery(undefined, {
    skip: !isEdit,
  });

  const [insertMonth] = useInsertMonthMutation();
  const [editMonth] = useEditMonthMutation();

  const methods = useForm({
    defaultValues: {
      monthData: months.map(() => ({ bangla: "", english: "", arabic: "" })),
      ClassID: "",
      SessionID: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = methods;

  const { fields } = useFieldArray({
    control,
    name: "monthData",
  });

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
      ClassID: item?.ClassID || "",
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
        ClassID: "",
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

    // একই column এর পরের মাসে যাবে (Bangla -> Bangla, English -> English, Arabic -> Arabic)
    const nextIndex = index + 1;

    // শেষ মাসের পরে আর যাবে না
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
      const payload = {
        ClassID: data.ClassID,
        SessionID: data.SessionID,
      };

      data.monthData.forEach((item, index) => {
        const i = index + 1;
        payload[`Month${i}`] = item.bangla;
        payload[`EnglishMonth${i}`] = item.english;
        payload[`ArabicMonth${i}`] = item.arabic;
      });

      if (isEdit) {
        await editMonth({ id, ...payload }).unwrap();
      } else {
        await insertMonth(payload).unwrap();
      }

      Swal.fire({
        title: translate(
          isEdit ? "Updated successfully!" : "Saved successfully!"
        ),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      reset();
      hideModal();
    } catch (error) {
      console.error("Save failed", error);
      Swal.fire({
        icon: "error",
        title: translate("Failed to save data"),
        text: error?.data?.message || "Something went wrong",
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

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="font-default bg-gray-50 p-3 sm:p-4 rounded-lg"
      >
        {/* Top: Session & Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded shadow-sm border border-gray-200">
          <DefaultSelect
            options={academicSession}
            require={translate("Session is required")}
            nameField={"SessionName"}
            valueField={"SessionID"}
            registerKey={"SessionID"}
            type={"number"}
            label="Academic Session"
            unicode
            disabled={isEdit}
          />

          <DefaultSelect
            options={classList}
            require={translate("Class is required")}
            nameField={"ClassName"}
            valueField={"ClassID"}
            registerKey={"ClassID"}
            type={"number"}
            label="Class"
            unicode
            disabled={isEdit}
          />
        </div>

        {/* Month Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {isDesktop ? (
            /* Desktop header */
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
            /* Mobile header */
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
                  /* Desktop row */
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
                  /* Mobile card */
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

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button
            type="button"
            onClick={hideModal}
            className="!bg-gray-500 hover:!bg-gray-600 !text-white !px-6 w-full sm:w-auto"
          >
            {translate("Close")}
          </Button>
          <Button
            type="submit"
            className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-8 shadow-md w-full sm:w-auto"
          >
            {translate(isEdit ? "Update" : "Save")}
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

//     // পরের field ঠিক করা
//     let nextIndex = index;
//     let nextType = fieldType;

//     if (fieldType === "bangla") {
//       nextType = "english";
//     } else if (fieldType === "english") {
//       nextType = "arabic";
//     } else if (fieldType === "arabic") {
//       nextType = "bangla";
//       nextIndex = index + 1;
//     }

//     // শেষ field এর পরে আর যাবে না
//     if (nextIndex >= months.length) return;

//     const nextInput = inputRefs.current[`${nextIndex}-${nextType}`];

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