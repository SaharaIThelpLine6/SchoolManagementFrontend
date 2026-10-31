// import { useDispatch } from "react-redux";
// import { useGetExamNamesQuery } from "/src/features/exam/examQuerySlice";
// import { useEffect, useState } from "react";
// import { setPageName, setQuickBarConfig } from "../features/auth/authSlice";
// import SortableTable from "../components/Tables/SortableTable";
// import { FormProvider, useForm } from "react-hook-form";
// import ThemeInputBox1 from "../components/Forms/ThemeInputBox1";
// import useTranslate from "../utils/Translate";
// import {
//   useDeleteExamNameMutation,
//   usePostNewExamMutation,
//   useUpdateExamnameMutation,
// } from "../features/exam/examQuerySlice";
// import { toast } from "react-toastify";
// import DeleteButton from "../components/Button/DeleteButton";
// import EditButton from "../components/Button/EditButton";
// import Swal from "sweetalert2";

// const Exam = ({ pageTitle }) => {
//   const title = "Add Exam";
//   const field = "Exam Name";
//   const methods = useForm();
//   const [filteredClassList, setFilteredClassList] = useState([]);
//   const [editMode, setEditMode] = useState(0);
//   const {
//     data: examNames,
//     error: examNameError,
//     isLoading,
//   } = useGetExamNamesQuery();
//   const dispatch = useDispatch();
//   const translate = useTranslate();
//   const [addExam, { isLoading: examNameInsertLoding, isError, isSuccess }] =
//     usePostNewExamMutation();
//   const [
//     updateExam,
//     {
//       isLoading: examNameUpdateLoading,
//       isError: examNameUpdateError,
//       isSuccess: examnameUpdateSuccessful,
//     },
//   ] = useUpdateExamnameMutation();
//   const [
//     deleteExam,
//     {
//       isLoading: examNameDeleteLoading,
//       isError: examNameDeleteError,
//       isSuccess: examnameDeleteSuccessful,
//     },
//   ] = useDeleteExamNameMutation();
//   useEffect(() => {
//     dispatch(setPageName(pageTitle));
//     if (examNames && examNames.length > 0) {
//       const transformedData = examNames.map((item) => ({
//         id: item.ExamID.toString(),
//         "Exam Name": item.ExamName,
//         "Exam Arabic": item.ExamAraName,
//         "Exam English": item.ExamEngName,
//       }));
//       setFilteredClassList(transformedData);
//     }
//   }, [examNames]);
//   const onSubmit = async (data) => {
//     if (!data.ExamName) {
//       console.error("All fields are required");
//       return;
//     }
//     try {
//       if (editMode === 0) {
//         const response = await addExam(data).unwrap();
//         console.log("Response:", response);
//         if (response) {
//           setEditMode(0);
//           methods.reset({
//             ExamName: "",
//             ExamEngName: "",
//             ExamAraName: "",
//           });
//         }
//       } else {
//         console.log(
//           "Edit mode is active, but no update logic implemented yet."
//         );
//         const body = {
//           ID: editMode,
//           ...data,
//         };
//         const response = await updateExam(body).unwrap();
//         console.log("Response:", response);
//         if (response) {
//           methods.reset({
//             ExamName: "",
//             ExamEngName: "",
//             ExamAraName: "",
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//     }
//   };

//   const handleExamNameEdit = (id) => {
//     console.log(id);

//     const examToEdit = examNames.find((exam) => exam.ExamID === id);
//     if (examToEdit) {
//       setEditMode(id);
//       methods.reset({
//         ExamName: examToEdit.ExamName,
//         ExamEngName: examToEdit.ExamEngName,
//         ExamAraName: examToEdit.ExamAraName,
//       });
//     }
//   };

//   const handleExamNameDelete = async (id) => {
//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await deleteExam({ ID: id }).unwrap();
//         console.log("Response:", response);

//         if (response) {
//           // Optionally reset the form or update state
//           methods.reset({
//             ExamName: "",
//             ExamEngName: "",
//             ExamAraName: "",
//           });

//           Swal.fire("Deleted!", "Exam has been deleted.", "success");
//         }
//       } catch (error) {
//         toast.error(error?.data?.error || "Failed to delete exam name");
//         console.error("Error deleting exam name:", error);
//       }
//     }
//   };

//   const tableTitleHeaders = [
//     {
//       title: "Exam Name",
//       field: "ExamName",
//       hozAlign: "left",
//       unicode: false,
//     },
//     {
//       title: "Exam Arabic",
//       field: "ExamAraName",
//       hozAlign: "left",
//       unicode: false,
//     },
//     {
//       title: "Exam English",
//       field: "ExamEngName",
//       hozAlign: "left",
//       unicode: false,
//     },
//     {
//       title: translate("Action"),
//       field: "ID",
//       hozAlign: "center",
//       render: (row) => (
//         <div className="flex justify-center items-center gap-2">
//           <EditButton onClick={() => handleExamNameEdit(row.ExamID)} />
//           <DeleteButton onClick={() => handleExamNameDelete(row.ExamID)} />
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
//       <div className="w-full flex flex-col lg:flex-row justify-space-between items-start mb-4 gap-6 pt-4">
//         <div className="w-full lg:w-2/5">
//           <FormProvider {...methods}>
//             <form
//               onSubmit={methods.handleSubmit(onSubmit)}
//               className="font-SolaimanLipi"
//             >
//               <div className="mb-3">
//                 <ThemeInputBox1
//                   label={field}
//                   registerKey={"ExamName"}
//                   require={"Exam Name is require"}
//                   type={"text"}
//                 />
//               </div>
//               <div className="mb-3">
//                 <ThemeInputBox1
//                   label={"English"}
//                   registerKey={"ExamEngName"}
//                   type={"text"}
//                 />
//               </div>
//               <div className="mb-3">
//                 <ThemeInputBox1
//                   label={"عربي"}
//                   registerKey={"ExamAraName"}
//                   type={"text"}
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="bg-theme-color transation ease-linear font-bold font-SolaimanLipi duration-500 inline-block px-[40px] py-2  text-white rounded-md mt-4  hover:bg-[#121212]"
//               >
//                 {translate("Save")}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setEditMode(0);
//                   methods.reset({
//                     ExamName: "",
//                     ExamEngName: "",
//                     ExamAraName: "",
//                   });
//                 }}
//                 className="bg-[#121212] transation ease-linear duration-500 font-bold font-SolaimanLipi inline-block px-[40px] py-2  text-white rounded-md mt-4  hover:bg-slate-700 ms-[20px]"
//               >
//                 {translate("Add New")}
//               </button>
//             </form>
//           </FormProvider>
//         </div>
//         <div className="w-full lg:w-3/5">
//           {isLoading ? (
//             <div>Loading...</div>
//           ) : examNameError ? (
//             <div>Error: {examNameError.message}</div>
//           ) : (
//             <SortableTable columns={tableTitleHeaders} data={examNames} />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Exam;






























import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

import { setPageName } from '../features/auth/authSlice';
import {
  useDeleteExamNameMutation,
  useGetExamNamesQuery,
  usePostNewExamMutation,
  useUpdateExamnameMutation,
} from '../features/exam/examQuerySlice';

import useTranslate from '../utils/Translate';

import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import ThemeInputBox1 from '../components/Forms/ThemeInputBox1';
import SortableTable from '../components/Tables/SortableTable';

const EMPTY_FORM = {
  ExamName: '',
  ExamEngName: '',
  ExamAraName: '',
};

const Exam = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm({ defaultValues: EMPTY_FORM });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(0); // 0 = নতুন, অন্যথায় ExamID
  const [search, setSearch] = useState('');

  const {
    data: examNames,
    error: examNameError,
    isLoading,
  } = useGetExamNamesQuery();

  const [addExam, { isLoading: examNameInsertLoading }] =
    usePostNewExamMutation();
  const [updateExam, { isLoading: examNameUpdateLoading }] =
    useUpdateExamnameMutation();
  const [deleteExam] = useDeleteExamNameMutation();

  const isSaving = examNameInsertLoading || examNameUpdateLoading;

  useEffect(() => {
    dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // মডাল খোলা থাকলে পেছনের স্ক্রল বন্ধ + Esc দিলে বন্ধ
  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const filteredExams = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return examNames || [];

    return (examNames || []).filter((item) =>
      [item?.ExamName, item?.ExamEngName, item?.ExamAraName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword))
    );
  }, [examNames, search]);

  const openCreateModal = () => {
    setEditMode(0);
    methods.reset(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(0);
    methods.reset(EMPTY_FORM);
  };

  const handleExamNameEdit = (id) => {
    const examToEdit = (examNames || []).find((exam) => exam.ExamID === id);
    if (!examToEdit) return;

    setEditMode(id);
    methods.reset({
      ExamName: examToEdit.ExamName || '',
      ExamEngName: examToEdit.ExamEngName || '',
      ExamAraName: examToEdit.ExamAraName || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    if (!data.ExamName) return;

    try {
      if (editMode === 0) {
        await addExam(data).unwrap();
      } else {
        await updateExam({ ID: editMode, ...data }).unwrap();
      }

      closeModal();

      Swal.fire({
        icon: 'success',
        title: editMode === 0 ? 'যুক্ত হয়েছে' : 'আপডেট হয়েছে',
        html: `<div style="font-size:15px;line-height:1.9;color:#374151">
                 <b style="color:#4F46E5">${data.ExamName}</b> — পরীক্ষার নামটি সফলভাবে
                 ${editMode === 0 ? 'সংরক্ষণ' : 'আপডেট'} করা হয়েছে।
               </div>`,
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#4F46E5',
        customClass: { popup: 'font-SolaimanLipi' },
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি ঘটেছে!',
        text: error?.data?.error || 'সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে',
        customClass: { popup: 'font-SolaimanLipi' },
      });
    }
  };

  const handleExamNameDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      html: `<div style="font-size:15px;line-height:1.9;color:#374151">
               <b style="color:#DC2626">${name || ''}</b> — পরীক্ষার নামটি মুছে ফেলা হবে।<br/>
               এটি আর ফিরিয়ে আনা যাবে না।
             </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'বাতিল',
      customClass: { popup: 'font-SolaimanLipi' },
    });

    if (!result.isConfirmed) return;

    try {
      await deleteExam({ ID: id }).unwrap();
      methods.reset(EMPTY_FORM);

      Swal.fire({
        icon: 'success',
        title: 'মুছে ফেলা হয়েছে',
        text: 'পরীক্ষার নামটি সফলভাবে মুছে ফেলা হয়েছে।',
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#4F46E5',
        customClass: { popup: 'font-SolaimanLipi' },
      });
    } catch (error) {
      toast.error(error?.data?.error || 'Failed to delete exam name');
    }
  };

  const tableTitleHeaders = [
    {
      title: 'Exam Name',
      field: 'ExamName',
      hozAlign: 'left',
      unicode: false,
    },
    {
      title: 'Exam Arabic',
      field: 'ExamAraName',
      hozAlign: 'left',
      unicode: false,
    },
    {
      title: 'Exam English',
      field: 'ExamEngName',
      hozAlign: 'left',
      unicode: false,
    },
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleExamNameEdit(row.ExamID)} />
          <DeleteButton
            onClick={() => handleExamNameDelete(row.ExamID, row.ExamName)}
          />
        </div>
      ),
    },
  ];

  return (
    // এখানে bg-white বাদ দিয়ে bg-transparent করে দেওয়া হয়েছে
    <div className="font-SolaimanLipi overflow-hidden rounded-xl bg-transparent shadow-none">
      
      {/* ---------- হেডার ---------- */}
      <div className="flex flex-col gap-3 bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
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
            <h3 className="text-[19px] font-bold leading-tight text-white">
              পরীক্ষার নাম
            </h3>
            <p className="text-[12.5px] text-white/80">
              পরীক্ষার নাম যুক্ত, সম্পাদনা ও মুছে ফেলার তালিকা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-white/20 px-3 py-2 text-[13px] font-semibold text-white">
            মোট: {examNames?.length || 0}
          </span>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
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
              <path d="M12 5v14M5 12h14" />
            </svg>
            নতুন যুক্ত করুন
          </button>
        </div>
      </div>

      <div className="p-5 md:p-4">
        {/* ---------- সার্চ ---------- */}
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 px-4 py-3">
          <span className="text-[13px] font-bold text-gray-600">খুঁজুন:</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="পরীক্ষার নাম লিখুন..."
            className="h-9 w-full rounded-lg border border-indigo-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-72"
          />
        </div>

        {/* ---------- তালিকা ---------- */}
        {isLoading ? (
          <div className="py-8 text-center text-gray-400">লোড হচ্ছে...</div>
        ) : examNameError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 py-4 text-center text-red-500">
            তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।
          </div>
        ) : (
          /* এখানে টেবিলকে সাদা ব্যাকগ্রাউন্ড, রাউন্ডেড এবং শ্যাডো দেওয়া হয়েছে */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <SortableTable columns={tableTitleHeaders} data={filteredExams} />
          </div>
        )}
      </div>

      {/* ---------- মডাল ---------- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* মডাল হেডার */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] px-5 py-3.5">
              <h4 className="text-[17px] font-bold text-white">
                {editMode === 0 ? 'নতুন পরীক্ষা যুক্ত করুন' : 'পরীক্ষা সম্পাদনা'}
              </h4>
              <button
                type="button"
                onClick={closeModal}
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
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="space-y-3 px-5 py-5">
                  <ThemeInputBox1
                    label={'Exam Name'}
                    registerKey={'ExamName'}
                    require={'Exam Name is require'}
                    type={'text'}
                  />
                  <ThemeInputBox1
                    label={'English'}
                    registerKey={'ExamEngName'}
                    type={'text'}
                  />
                  <ThemeInputBox1
                    label={'عربي'}
                    registerKey={'ExamAraName'}
                    type={'text'}
                  />
                </div>

                {/* মডাল ফুটার */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3.5">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-[13px] font-bold text-gray-600 transition hover:bg-gray-100"
                  >
                    {translate('Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-indigo-600 px-6 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? 'সংরক্ষণ হচ্ছে...' : translate('Save')}
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;
