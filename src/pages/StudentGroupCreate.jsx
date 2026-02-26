import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import { setPageName } from '../features/auth/authSlice';
import useTranslate from '../utils/Translate';

import DragAndDropTables from '../components/DragAndDropTables';
import { permissionsDataList } from '../Data/permissions';
import { usePostGetStudentListMutation } from '../features/exam/examQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import FilteringForm from '../view/exam/average-condition/FilteringForm';

const StudentGroupCreate = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { handleSubmit } = methods;
  const [filter, setFilter] = useState(null);
  // Initialize table data
  const [leftRows, setLeftRows] = useState([]);
  const [rightRows, setRightRows] = useState([]);

  const [postGetStudentList] = usePostGetStudentListMutation();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
    // Initialize table data
  }, [dispatch, pageTitle]);

  const onSubmit = async () => {
    try {
      // Prepare the payload in the required format
      const payload = {
        SessionID: filter.SessionId,
        ExamID: filter.ExamId,
        SubClassID: filter.SubClassId,
        userids: rightRows.map((row) => row.UserID),
      };

      console.log('Submitting data:', payload);

      // Call your API using RTK Query
      const result = await postGetStudentList(payload).unwrap();

      // Show success message
      Swal.fire({
        icon: 'success',
        title: translate('Successfully Saved'),
        text: result?.message || translate('Data saved successfully'),
      }).then(() => {
        // Optional: Reset form state if needed
        if (methods) methods.reset();
        // Clear selection
        // setSelectedRows({ left: [], right: [] });
        // Reset tables to initial state if needed
        setLeftRows(studentData?.Exam_StudentLoadView || []);
        setRightRows([]);
      });
    } catch (error) {
      console.error('Submission error:', error);
      Swal.fire({
        icon: 'error',
        title: translate('Error Occurred!'),
        text:
          error?.data?.message ||
          error?.message ||
          translate('Failed to save data'),
      });
    }
  };
  return (
    <>
      <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="filter_header flex items-center justify-between mb-6">
          <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
            {translate('Exam List Made')}
          </h3>
        </div>
        <FormProvider {...methods}>
          <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <div className="col-span-3">
                <FilteringForm onFilter={setFilter} />
              </div>
            </div>
            <div className="flex justify-end">
              <ViewPermission
                permissionId={permissionsDataList.exam_list_generation}
                permissionType="insert"
              >
                <Button type="submit" className="w-full md:w-auto">
                  {translate('Save')}
                </Button>
              </ViewPermission>
            </div>
          </form>
        </FormProvider>
        {/* Tables */}
        <DragAndDropTables
          filter={filter}
          setLeftRows={setLeftRows}
          leftRows={leftRows}
          setRightRows={setRightRows}
          rightRows={rightRows}
        />
      </div>
    </>
  );
};

export default StudentGroupCreate;
