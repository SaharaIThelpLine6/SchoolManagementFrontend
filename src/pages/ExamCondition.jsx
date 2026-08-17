import { useEffect } from 'react';
import Loading from '../components/Loading/Loading';
import { useGetSettingsQuery } from '../features/settings/settingsQuerySlice';
import PointVCondition from './PointVCondition';
import MultiStepForm from '../components/MultiStepForm';
import ExamShift from '../view/exam/ExamShift';
import SitPlanAssign from '../view/exam/SitPlanAssign';
import { useDispatch } from 'react-redux';
import { setPageName, setQuickBarConfig } from '../features/auth/authSlice';
import { useDeleteExamConditionMutation, useGetExamConditionsQuery, useLazyGetExamConditonEntryQuery } from '../features/exam/examQuerySlice';
import SortableTable from '../components/Tables/SortableTable';
import useTranslate from '../utils/Translate';
import Button from '../components/Button/Button';
import SvgIcon from '../components/icons/SvgIcon';
import { showModal } from '../utils/ModalControlar';
import Swal from 'sweetalert2';
import DeleteButton from '../components/Button/DeleteButton';
const ExamCondition = ({ pageTitle }) => {
  // const { data, error, isLoading } = useGetExamConditionsSettingsQuery();
  const { data: response, isLoading, error, refetch } = useGetSettingsQuery();
  const { data: examConditions } = useGetExamConditionsQuery();
  const [deleteExamCondition] = useDeleteExamConditionMutation();
  const data = response?.data.find((item) => item.ID == 20);
  const dispatch = useDispatch();
  const translate = useTranslate();
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [getExamConditionEntry, { data: examConditionData, isLoading: isExamConditionLoading, error: examConditionError, isFetching: isExamConditionFetching, },] = useLazyGetExamConditonEntryQuery();

  const handleExamCondetionModal = () => {
    showModal("Exam Condition Settings", "EXAM_CONDITION_SETTINGS", null, { closeOnOutSide: false })
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

        const deleteExamConditionResponse = await deleteExamCondition({
          SessionID: data.SessionID,
          ExamID: data.ExamID,
          SubClassID: data.SubClassID,
        }).then((response) => {
          if(response?.data) {
            Swal.fire("Deleted!", response?.data?.message, "success");
            refetch();
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
      title: translate('Action'), hozAlign: 'center', render: (row) => {
        return (
          <div className='flex gap-2 justify-center items-center'>
            <Button type='button' tooltip_message='Result Entry'>
              <SvgIcon
                name={"TbChecklist"}
                size={14}
              />
            </Button>
            <Button type='button' tooltip_message='Edit Exam Condition' onClick={() => { handleConditionEdit(row) }}>
              <SvgIcon
                name={"FiEdit"}
                size={14}
              />
            </Button>
            <DeleteButton onClick={() => { handleDelete(row) }} />

          </div>
        );
      },
    },
    {
      title: translate('Session'), hozAlign: 'center', render: (row) => {
        return (
          <>{row?.Session.SessionName}</>
        );
      },
    },
    {
      title: translate('Exam'),
      hozAlign: 'center',
      unicode: true,
      render: (row) => {
        return (
          <>{row?.Exam.ExamName}</>
        );
      }
    },
    {
      title: translate('Sub Class'),
      hozAlign: 'center',
      unicode: true,
      render: (row) => {
        return (
          <>{row?.SubClass.SubClass}</>
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

      <div className="quick_action bg-white font-default grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <div className="flex items-center justify-start gap-2">
          <button className='border border-blue-600 text-blue-600 rounded-[10px] py-1 px-4 flex items-center gap-1' onClick={handleExamCondetionModal}> <SvgIcon name={"TbPlus"} />  {translate("Add New")}</button>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className="text-[16px] text-center font-bold">{translate(pageTitle)}</h2>
        </div>

        <div className="flex items-center justify-end gap-2">
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <SortableTable
          columns={columns}
          isFilterColumn={false}
          data={examConditions}
        />
      </div>


    </div>
  );
};
//  
export default ExamCondition;
