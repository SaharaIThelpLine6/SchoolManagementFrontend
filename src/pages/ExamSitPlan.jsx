import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from '../components/Loading/Loading';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import ViewButton from '../components/Button/ViewButton';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import {
  useDeleteExamRuleMutation,
  useGetExamNamesQuery,
  useGetExamRulesQuery,
} from '../features/exam/examQuerySlice';
import { FormProvider, useForm } from 'react-hook-form';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { useDeleteSitPlanMutation, useGetExamSitPlansQuery, useUpdateSitPlanMutation } from '../features/exam/examSitPlanQuerySlice';
import SvgIcon from '../components/icons/SvgIcon';

const PAGE_SIZE = 10;

const ExamSitPlan = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const navigate = useNavigate()

  const methods = useForm();

  const {
    handleSubmit,
    watch,
  } = methods;

  const { data: sessionData } = useGetSessionsQuery();
  const { data: SubClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const [deleteSitPlan] = useDeleteSitPlanMutation();
  const [updateSeatPlanStatus] = useUpdateSitPlanMutation();



  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get('filter') || '0');


  const onSubmit = (data) => {
    console.log(data);
  }
  const sessionID = watch("SessionID")
  const examID = watch("ExamID")
  const { data: examSitPlans } = useGetExamSitPlansQuery({ sessionId: sessionID, examId: examID });

  const handleNewSitPlan = () => {
    if (!sessionID || !examID) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select session and exam!',
      });
      return false;
    }
    // sessionID, examID check if sit plan already ready skip edit

    navigate(`/exam/create_examshift/${sessionID}/${examID}`);
  }

  const handleDeleteSitPlan = async (sitplanid) => {
    const result = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "এই সিট প্ল্যান এবং এর সকল তথ্য স্থায়ীভাবে মুছে ফেলা হবে!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন",
      cancelButtonText: "বাতিল",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteSitPlan(sitplanid).unwrap();

      Swal.fire({
        icon: "success",
        title: "সফল!",
        text: "সিট প্ল্যান সফলভাবে মুছে ফেলা হয়েছে।",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "ঠিক আছে",
      });
    } catch (err) {
      console.error("Delete failed:", err);

      Swal.fire({
        icon: "error",
        title: "মুছে ফেলা ব্যর্থ!",
        text: err?.data?.error || "কিছু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        confirmButtonColor: "#d33",
        confirmButtonText: "বুঝেছি",
      });
    }
  };

  const handleSeatPlanStatus = async (sitplanid) => {
    const result = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "এই সিট প্ল্যান পাবলিশ করা হবে আর কখনো ইডিট করা যাবেনা",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "হ্যাঁ, পাবলিশ করুন",
      cancelButtonText: "বাতিল",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await updateSeatPlanStatus(sitplanid).unwrap();
      Swal.fire({
        icon: "success",
        title: "সফল!",
        text: "সিট প্ল্যান পাবলিশ করা হয়েছে।",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "ঠিক আছে",
      });
    } catch (err) {
      console.error("Delete failed:", err);

      Swal.fire({
        icon: "error",
        title: "মুছে পাবলিশ ব্যর্থ!",
        text: err?.data?.error || "কিছু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        confirmButtonColor: "#d33",
        confirmButtonText: "বুঝেছি",
      });
    }
  };
  const handleActiveSeatPlanStatus = async (sitplanid) => {
     await Swal.fire({
        icon: "error",
        title: "সিট প্লানটি ইতিমধ্যে পাবলিশ করা হয়েছে",
        confirmButtonColor: "#d33",
        confirmButtonText: "বুঝেছি",
      });
  };


  const columns = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      render: (row, rowIndex) => <div className='flex gap-2 items-center justify-center'>
        <Link to={`/exam/create_examshift/${row.SessionID}/${row.ExamID}`} className='p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md inline-block'>
          <SvgIcon name="FiEdit" size={18} />
        </Link>

        { row.isActive ? <button onClick={handleActiveSeatPlanStatus} type='button' className='p-1 flex justify-center items-center text-white bg-green-500 hover:bg-green-600 rounded-md'>
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-eye-x">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M13.048 17.942a9.298 9.298 0 0 1 -1.048 .058c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6a17.986 17.986 0 0 1 -1.362 1.975" />
              <path d="M22 22l-5 -5" />
              <path d="M17 22l5 -5" />
            </svg>
        </button> : <button className='p-1 flex justify-center items-center text-white bg-yellow-500 hover:bg-yellow-600 rounded-md' type='button' onClick={()=>{handleSeatPlanStatus(row?.SitPlanID)}}>


          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-eye-check">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
          <path d="M11.102 17.957c-3.204 -.307 -5.904 -2.294 -8.102 -5.957c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6a19.5 19.5 0 0 1 -.663 1.032" />
          <path d="M15 19l2 2l4 -4" />
          </svg>



            
          </button>}

        <DeleteButton onClick={() => { handleDeleteSitPlan(row?.SitPlanID) }} />
      </div>,
    },
    {
      title: translate('SL'),
      hozAlign: 'center',
      field: 'SitPlanID',
      render: (row, rowIndex) => <p>{rowIndex + 1}</p>,
    },
    {
      title: translate('Session'),
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="truncate w-60 text-center">{row.Session.SessionName}</p>
        </div>
      ),
    },
    {
      title: translate('Exam'),
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="truncate w-60 text-center">{row.Exam.ExamName}</p>
        </div>
      ),
    },
    {
      title: translate('Status'),
      field: 'isActive',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${row.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
            }
          `}>
            {row.isActive ? "Published" : "Draft"}
          </span>
        </div>
      ),
    }
  ];



  return (
    <div className="font-default bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
          <h3 className="font-default text-[20px] font-bold">
            {translate('Exam Sitplan')}
          </h3>

          <Button onClick={handleNewSitPlan}>
            {translate('Create')}
          </Button>
        </div>

        <div className='mb-4'>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DefaultSelect
                label={translate('Session')}
                nameField="SessionName"
                registerKey="SessionID"
                valueField="SessionID"
                options={sessionData ?? []}
                require="This Field is required"
                defaultSelect={false}
                unicode={true}
              />

              <DefaultSelect
                label={translate('Exam')}
                nameField="ExamName"
                registerKey="ExamID"
                valueField="ExamID"
                options={examNameData ?? []}
                require={'This Field is required'}
                unicode={true}
              />

            </form>
          </FormProvider>
        </div>

        <div>

          {
            examSitPlans && examSitPlans.length > 0 ? (
              <SortableTable
                columns={columns}
                isFilterColumn={false}
                data={examSitPlans}
              />
            ) : null
          }


        </div>

      </div>
    </div>
  );
};

export default ExamSitPlan;
