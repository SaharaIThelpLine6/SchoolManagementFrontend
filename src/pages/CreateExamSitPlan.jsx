import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
import MultiStepForm from '../components/MultiStepForm';
import ExamShift from '../view/exam/ExamShift';
import SitPlanAssign from '../view/exam/SitPlanAssign';
import { useDeleteSitPlanMutation } from '../features/exam/examSitPlanQuerySlice';

const CreateExamSitPlan = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const navigate = useNavigate()

  const { sessionId, examId } = useParams();

  const methods = useForm({
    defaultValues: {
      SessionID: sessionId || '',
      ExamID: examId || '',
    }
  });
  useEffect(() => {
    console.log(sessionId, examId, "params");
  }, [sessionId, examId])
  const {
    handleSubmit,
    watch,
  } = methods;

  const { data: sessionData } = useGetSessionsQuery();
  const { data: SubClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();



  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get('filter') || '0');


  const onSubmit = (data) => {
    console.log(data);
  }
  const watchSessionID = watch("SessionID")
  const watchExamID = watch("ExamID")

  const handleNewSitPlan = () => {
    if (!watchSessionID || !watchExamID) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select session and exam!',
      });
      return false;
    }
    // sessionID, examID check if sit plan already ready skip edit

    navigate("/exam/create_examshift/")
  }
  const columns = [
    {
      title: translate('Action'),
      field: 'ERID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.ERID)} />
          <DeleteButton onClick={() => handleDelete(row.ERID)} />
        </div>
      ),
    },
    {
      title: translate('SL'),
      field: 'ERID',
      hozAlign: 'center',
      render: (row) => <p>{row.ERID}</p>,
    },
    {
      title: translate('Session'),
      field: 'ExamRule',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="truncate w-60 text-center">{row.ExamRule}</p>
        </div>
      ),
    },
    {
      title: translate('Shifts'),
      field: 'ExamRule',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="truncate w-60 text-center">{row.ExamRule}</p>
        </div>
      ),
    },
    {
      title: translate('Status'),
      field: 'ExamRule',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="truncate w-60 text-center">{row.ExamRule}</p>
        </div>
      ),
    }
  ];


  function Step1() {
    return <>sdfsd</>;
  }

  function Step2() {
    return <>sdfsd1</>;
  }

  function Step3() {
    return <>sdfsd2</>;
  }
  return (
    <div className="font-lato bg-white p-2 lg:p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {translate('Exam Sitplan')}
          </h3>
        </div>

        <MultiStepForm
          formId="employeeForm"
          steps={[
            {
              component: ExamShift,
              props: {
                sessionId: sessionId || 1,
                examId: examId || 2,
              },
            },
            {
              component: SitPlanAssign,
              props: {
                sessionId: sessionId,
                examId: examId,
              },
            },
            {
              component: Step3,
              props: {},
            },
          ]}
        />

      </div>
    </div>
  );
};

export default CreateExamSitPlan;
