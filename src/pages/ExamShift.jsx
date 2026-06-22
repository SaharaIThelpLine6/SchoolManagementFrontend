import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
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
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { FormProvider, useForm } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';

const PAGE_SIZE = 10;

const ExamShift = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const methods = useForm();

  const {
    handleSubmit
  } = methods;

  const { data: sessionData } = useGetSessionsQuery();
  const { data: SubClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();


  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get('filter') || '0');


  const onSubmit = (data) => {
    console.log(data);


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

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {translate('Exam Shift')}
          </h3>





          {/* 



          <Button onClick={() => handleOpenModal()}>
            {translate('Create')}
          </Button> */}
        </div>

        <div>
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
          <SortableTable
            columns={columns}
            isFilterColumn={false}
          />
        </div>

      </div>
    </div>
  );
};

export default ExamShift;
