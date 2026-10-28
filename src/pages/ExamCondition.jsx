import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Loading from '../components/Loading/Loading';
import { useGetSettingsQuery } from '../features/settings/settingsQuerySlice';
import { useDispatch } from 'react-redux';
import { setPageName } from '../features/auth/authSlice';
import { useDeleteExamConditionMutation, useDuplicateExamConditionsMutation, useGetExamConditionsQuery, useGetExamFilterExamsQuery, useGetExamFilterSubclassesQuery, useGetExamSessionQuery, useLazyGetExamConditonEntryQuery } from '../features/exam/examQuerySlice';
import SortableTable from '../components/Tables/SortableTable';
import useTranslate from '../utils/Translate';
import Button from '../components/Button/Button';
import DefaultSelect from '../components/Forms/DefaultSelect';
import SvgIcon from '../components/icons/SvgIcon';
import { showModal } from '../utils/ModalControlar';
import Swal from 'sweetalert2';
import DeleteButton from '../components/Button/DeleteButton';

const conditionKey = (row) => `${row.SessionID}:${row.ExamID}:${row.SubClassID}`;
const conditionLabel = (row) => [
  row.Session?.SessionName ?? row.SessionID,
  row.Exam?.ExamName ?? row.ExamID,
  row.SubClass?.SubClass ?? row.SubClassID,
].join(' / ');

const ExamCondition = ({ pageTitle }) => {
  // const { data, error, isLoading } = useGetExamConditionsSettingsQuery();
  const { isLoading, error } = useGetSettingsQuery();
  const [deleteExamCondition] = useDeleteExamConditionMutation();
  const [, { isLoading: isPasting, data: pasteResponse, reset: resetPasteResponse }] = useDuplicateExamConditionsMutation({
    fixedCacheKey: 'exam-condition-paste',
  });
  const [copiedConditions, setCopiedConditions] = useState([]);
  const [pasteResult, setPasteResult] = useState(null);
  const dispatch = useDispatch();
  const translate = useTranslate();

  const methods = useForm({
    defaultValues: {
      SessionID: '',
      ExamID: '',
      SubClassID: '',
    },
  });
  const { control, setValue } = methods;
  const sessionID = useWatch({ control, name: 'SessionID' });
  const examID = useWatch({ control, name: 'ExamID' });
  const subClassID = useWatch({ control, name: 'SubClassID' });
  const { data: examConditions, refetch: refetchExamConditions, isFetching: isConditionsFetching } = useGetExamConditionsQuery({
    SessionID: sessionID,
    ExamID: examID,
    SubClassID: subClassID,
  });

  const { data: sessionData } = useGetExamSessionQuery();
  const { data: examNameData } = useGetExamFilterExamsQuery(
    { SessionID: sessionID },
    { skip: !sessionID }
  );
  const { data: subclassListData } = useGetExamFilterSubclassesQuery(
    { SessionID: sessionID, ExamID: examID },
    { skip: !sessionID || !examID }
  );
  useEffect(() => {
    setValue('ExamID', '');
    setValue('SubClassID', '');
  }, [sessionID, setValue]);

  useEffect(() => {
    setValue('SubClassID', '');
  }, [examID, setValue]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (!pasteResponse) return;
    const sourceMap = new Map(copiedConditions.map((row) => [conditionKey(row), row]));
    setPasteResult({
      ...pasteResponse,
      sessionName: pasteResponse.target?.SessionName,
      examName: pasteResponse.target?.ExamName,
      results: pasteResponse.results.map((item) => ({
        ...item,
        label: conditionLabel(sourceMap.get(conditionKey(item.source)) ?? item.source),
      })),
    });
    setCopiedConditions([]);
    resetPasteResponse();
  }, [pasteResponse, copiedConditions, resetPasteResponse]);

  const [getExamConditionEntry] = useLazyGetExamConditonEntryQuery();

  const handleExamCondetionModal = () => {
    showModal("Exam Condition Settings", "EXAM_CONDITION_SETTINGS", null, { closeOnOutSide: false, header: "sticky" })
  }

  const handleConditionEdit = async (data) => {
    try {
      const response = await getExamConditionEntry({
        SessionID: data.SessionID,
        ExamID: data.ExamID,
        SubClassID: data.SubClassID,
      }).unwrap();

      showModal(
        "Exam Condition Settings",
        "EXAM_CONDITION_SETTINGS_EDIT",
        response,
        { closeOnOutSide: false }
      );
    } catch (error) {
      console.error("Failed to fetch exam condition:", error);
      Swal.fire({
        icon: "error",
        title: translate("Failed to save division"),
        text: error?.data?.message || error?.data?.error || translate("Please try again."),
      });
    }
  };

  const copiedKeys = new Set(copiedConditions.map(conditionKey));

  const handleToggleCopyCondition = (row) => {
    setCopiedConditions((previous) => previous.some((item) => conditionKey(item) === conditionKey(row))
      ? previous.filter((item) => conditionKey(item) !== conditionKey(row))
      : [...previous, row]);
    setPasteResult(null);
  };

  const handlePasteConditions = () => {
    if (!copiedConditions.length || isPasting) return;
    showModal('Paste Exam Conditions', 'EXAM_CONDITION_PASTE', copiedConditions, { closeOnOutSide: false });
  };

  const handleDelete = async (data) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete the exam condition.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // Show loading
        Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          }
        });

        await deleteExamCondition({
          SessionID: data.SessionID,
          ExamID: data.ExamID,
          SubClassID: data.SubClassID,
        }).then((response) => {
          if (response?.data) {
            Swal.fire("Deleted!", response?.data?.message, "success");
            refetchExamConditions();
          } else if (response.error) {
            throw new Error(response.error.data?.error || response.error.data?.message || "Delete operation failed");
          }
        });
      }
    } catch (error) {
      console.error("Failed to delete exam condition:", error);
      Swal.close();

      // ✅ Show the actual error message from the backend
      Swal.fire({
        icon: "error",
        title: translate("Failed to delete exam condition"),
        text: error?.message || error?.data?.error || error?.data?.message || translate("Please try again."),
      });
    }
  };

  const columns = [
    {
      title: translate('Session'), hozAlign: 'center', render: (row) => {
        return (
          <>{row?.Session?.SessionName}</>
        );
      },
    },
    {
      title: translate('Exam'),
      hozAlign: 'center',
      unicode: true,
      render: (row) => {
        return (
          <>{row?.Exam?.ExamName}</>
        );
      }
    },
    {
      title: translate('Sub Class'),
      hozAlign: 'center',
      unicode: true,
      render: (row) => {
        return (
          <>{row?.SubClass?.SubClass}</>
        );
      }
    },
    {
      title: translate("Result Type"),
      hozAlign: 'center',
      unicode: true,
      render: (row) => {
        return (
          <>{row?.ExamType == 1 ? "দরসিয়াত" : row?.ExamType == 2 ? "হিফজ কন্ডিশন ভিত্তিক" : row?.ExamType == 3 ? "গড়ে যা আসবে তাই" : row?.ExamType == 4 ? "পয়েন্ট ভিত্তিক" : ""}</>
        );
      }
    },
    {
      title: translate('Action'), hozAlign: 'center', fixedWidth: 200, render: (row) => {
        const isCopied = copiedKeys.has(conditionKey(row));
        return (
          <div className='flex w-full flex-nowrap gap-2 justify-center items-center'>
            <Button type='button' className='!px-2 !py-2' tooltip_message='Result Entry' aria-label={translate('Result Entry')}>
              <SvgIcon
                name={"TbChecklist"}
                size={14}
              />
            </Button>
            <Button type='button' className='!px-2 !py-2' tooltip_message='Edit Exam Condition' aria-label={translate('Edit Exam Condition')} onClick={() => { handleConditionEdit(row) }}>
              <SvgIcon
                name={"FiEdit"}
                size={14}
              />
            </Button>
            <Button
              type="button"
              tooltip_message={translate(isCopied ? 'Remove from copied' : 'Copy condition')}
              aria-label={`${translate(isCopied ? 'Remove from copied' : 'Copy condition')} ${conditionLabel(row)}`}
              aria-pressed={isCopied}
              className={`!px-2 !py-2 ${isCopied ? '!bg-green-600 hover:!bg-green-700' : ''}`}
              onClick={() => handleToggleCopyCondition(row)}
              disabled={isPasting}
            >
              <SvgIcon name="Copy" size={16} />
            </Button>
            <DeleteButton onClick={() => { handleDelete(row) }} />

          </div>
        );
      },
    },
    // {
    //   title: 'Exam Start Date',
    //   hozAlign: 'center',
    //   unicode: true,
    //   render: (row) => {
    //     return (
    //       <>{row?.SubClass.SubClass}</>
    //     );
    //   }
    // },
    // {
    //   title: 'Exam End Date',
    //   hozAlign: 'center',
    //   unicode: true,
    //   render: (row) => {
    //     return (
    //       <>{row?.SubClass.SubClass}</>
    //     );
    //   }
    // },
    // {
    //   title: 'Result',
    //   hozAlign: 'center',
    //   unicode: true,
    //   render: (row) => {
    //     return (
    //       <>{row?.SubClass.SubClass}</>
    //     );
    //   }
    // },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-md shadow-md text-red-600 text-center">
        Failed to load exam conditions.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-md shadow-md">

      <div className="quick_action bg-white font-default flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className="text-[20px] text-center font-bold">{translate(pageTitle)}</h2>
        </div>
        <div className="flex items-center justify-start gap-2">
          <button className='inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700' onClick={handleExamCondetionModal}> <SvgIcon name={"TbPlus"} />  {translate("Add New")}</button>
        </div>


      </div>

      <FormProvider {...methods}>
        <div className="mt-5 mb-4 grid grid-cols-1 gap-3 md:grid-cols-3 print:hidden">
          <DefaultSelect
            label={translate('Session')}
            options={sessionData ?? []}
            registerKey="SessionID"
            nameField="SessionName"
            valueField="SessionID"
            defaultSelect={false}
          />
          <DefaultSelect
            label={translate('Exam')}
            options={examNameData ?? []}
            registerKey="ExamID"
            nameField="ExamName"
            valueField="ExamID"
            disabled={!sessionID}
            unicode
          />
          <DefaultSelect
            label={translate('Sub Class')}
            options={subclassListData ?? []}
            registerKey="SubClassID"
            nameField="SubClass"
            valueField="SubClassID"
            disabled={!sessionID || !examID}
            unicode
          />
        </div>
      </FormProvider>

      {copiedConditions.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handlePasteConditions}
            disabled={isPasting}
          >
            {translate('Paste')} ({copiedConditions.length})
          </Button>
          <span className="text-sm text-gray-600" role="status">
            {copiedConditions.length} {translate('conditions copied')}
          </span>
          <button
            type="button"
            className="text-sm text-red-600 underline disabled:opacity-50"
            onClick={() => setCopiedConditions([])}
            disabled={isPasting}
          >
            {translate('Clear copied')}
          </button>
        </div>
      )}

      {pasteResult && (
        <section className="mt-4 rounded-lg border border-gray-200 p-4" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">
              {[pasteResult.sessionName, pasteResult.examName].filter(Boolean).join(' / ')}: {pasteResult.succeeded} {translate('created')}, {pasteResult.failed} {translate('failed')}
            </p>
            <button type="button" aria-label={translate('Close')} onClick={() => setPasteResult(null)}>
              <SvgIcon name="FiX" size={16} />
            </button>
          </div>
          <ul className="mt-2 max-h-72 space-y-2 overflow-y-auto text-sm">
            {pasteResult.results.map((item, index) => (
              <li key={`${conditionKey(item.source)}:${index}`} className={item.status === 'success' ? 'text-green-700' : 'text-red-600'}>
                {item.label} — {item.status === 'success' ? translate('Created successfully') : translate(item.message)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-5 space-y-3 md:hidden">
        {(examConditions ?? []).map((row) => (
          <details
            key={conditionKey(row)}
            className={`group min-w-0 overflow-hidden rounded-lg border ${copiedKeys.has(conditionKey(row)) ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white'}`}
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-lg p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">
                <span className="block break-words font-semibold text-theme-dark">
                  {row.SubClass?.SubClass ?? row.SubClassID}
                </span>
                <span className="mt-1 block break-words text-sm text-gray-600">
                  {row.Exam?.ExamName ?? row.ExamID}
                </span>
              </span>
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180">
                <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div className="border-t border-gray-200 px-4 pb-4">
              <dl className="divide-y divide-gray-100 text-sm">
                {columns.slice(0, -1).map((column, index) => (
                  <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3 py-3">
                    <dt className="min-w-0 break-words font-medium text-gray-600">{column.title}</dt>
                    <dd className="min-w-0 break-words text-right text-theme-dark">{column.render(row)}</dd>
                  </div>
                ))}
              </dl>
              <div className="border-t border-gray-100 pt-3">
                <p className="mb-3 text-sm font-medium text-gray-600">{translate('Action')}</p>
                {columns[columns.length - 1].render(row)}
              </div>
            </div>
          </details>
        ))}
        {!examConditions?.length && (
          <p role="status" className="rounded-lg border border-gray-200 p-4 text-center text-sm text-gray-600">
            {translate(isConditionsFetching ? 'Loading...' : 'No data available for the selected filters')}
          </p>
        )}
      </div>

      <div className="mt-5 hidden overflow-x-auto md:block">
        <SortableTable
          columns={columns}
          isFilterColumn={false}
          data={examConditions ?? []}
        />
      </div>


    </div>
  );
};
ExamCondition.propTypes = { pageTitle: PropTypes.string };
//  
export default ExamCondition;
