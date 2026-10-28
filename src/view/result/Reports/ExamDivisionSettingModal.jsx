import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Button from '../../../components/Button/Button';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import {
  useGetExamNamesQuery,
  useGetExamSessionQuery,
} from '../../../features/exam/examQuerySlice';
import {
  useCreateExamDivisionNameResultMutation,
  useGetExamDivisionNameQuery,
  useGetExamDivisionNameResultsQuery,
  useGetExamTypeQuery,
  useUpdateExamDivisionNameResultMutation,
} from '../../../features/result/resultSilce';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

const ExamDivisionSettingModal = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, reset, setValue, watch } = methods;

  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [editData, setEditData] = useState(null); // ট্র্যাক করার জন্য এই Exam এর ডেটা আগে থেকে আছে কি না

  const ExamID = watch('ExamID');
  const SessionID = watch('SessionID');

  // --- Queries ---
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: sessionData } = useGetExamSessionQuery();
  const { data: divisionSettingData, isLoading: isFetchingSettings } = useGetExamDivisionNameResultsQuery();

  const { data: examType } = useGetExamTypeQuery(
    { sessionid: SessionID, examid: ExamID },
    { skip: !ExamID }
  );

  const { data: examDivisionNameData } = useGetExamDivisionNameQuery(
    { ExamType: examType?.examType ?? null },
    { skip: !examType?.examType }
  );

  // --- Mutations ---
  const [postSetting, { isLoading: isCreating }] = useCreateExamDivisionNameResultMutation();
  const [updateSetting, { isLoading: isUpdating }] = useUpdateExamDivisionNameResultMutation();

  // --- অটোমেটিক এডিট মোড ডিটেকশন ---
  useEffect(() => {
    if (ExamID && divisionSettingData?.data) {
      // চেক করা হচ্ছে এই ExamID এর জন্য আগে থেকে ডেটা আছে কি না
      const existingSetting = divisionSettingData.data.find(
        (item) => String(item.ExamID) === String(ExamID)
      );

      if (existingSetting) {
        setEditData(existingSetting);

        // আগের সিলেক্ট করা ডিভিশনগুলো বের করা
        const existingDivisions = [];
        for (let i = 1; i <= 8; i++) {
          if (existingSetting[`DivisionID${i}`]) {
            existingDivisions.push(existingSetting[`DivisionID${i}`]);
          }
        }
        setSelectedDivisions(existingDivisions);
      } else {
        // যদি নতুন Exam হয়, তবে এডিট ডেটা নাল করে দিবে এবং ডিভিশন ফাঁকা করবে
        setEditData(null);
        setSelectedDivisions([]);
      }
    } else {
      setEditData(null);
      setSelectedDivisions([]);
    }
  }, [ExamID, divisionSettingData]);

  // --- Handle Division Toggle ---
  const toggleDivision = (divisionID) => {
    setSelectedDivisions((prev) =>
      prev.includes(divisionID)
        ? prev.filter((divId) => divId !== divisionID)
        : [...prev, divisionID]
    );
  };

  // --- Submit Logic (Create or Update) ---
  const onSubmit = async (formData) => {
    if (selectedDivisions.length === 0) {
      toast.warning(translate('Please select at least one division.'));
      return;
    }

    const formattedDivisionData = {
      ExamID: formData.ExamID,
      SessionID: formData.SessionID || null,
      DivisionID1: null,
      DivisionID2: null,
      DivisionID3: null,
      DivisionID4: null,
      DivisionID5: null,
      DivisionID6: null,
      DivisionID7: null,
      DivisionID8: null,
    };

    // সিলেক্ট করা ডিভিশনগুলো সিরিয়ালি ডাটায় বসানো
    selectedDivisions.forEach((divId, index) => {
      if (index < 8) {
        formattedDivisionData[`DivisionID${index + 1}`] = divId;
      }
    });

    if (editData) {
      // === Update Mode ===
      const result = await Swal.fire({
        title: translate('Are you sure?'),
        text: translate('You want to update this setting?'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: translate('Yes, update it!'),
        cancelButtonText: translate('Cancel'),
        width: '400px',
      });

      if (result.isConfirmed) {
        try {
          await updateSetting({ id: editData.ID, ...formattedDivisionData }).unwrap();
          await Swal.fire({
            icon: 'success',
            title: translate('Update successfully'),
            timer: 1500,
            showConfirmButton: false,
            width: '400px',
          });
          hideModal();
          reset();
        } catch (err) {
          await Swal.fire({
            icon: 'error',
            title: translate('Error'),
            text: err?.data?.message || translate('Failed to update setting'),
            width: '400px',
          });
        }
      }
    } else {
      // === Create Mode ===
      try {
        await postSetting(formattedDivisionData).unwrap();
        toast.success(translate('Setting created successfully'));
        hideModal();
        reset();
      } catch (err) {
        console.error('Error:', err);
        toast.error(err?.data?.message || translate('Failed to save setting'));
      }
    }
  };

  return (
    <div className="w-full p-4">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
            require="This Field is required"
            unicode={true}
          />

          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
              {translate('Select Divisions')}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({translate('Selected')}: {selectedDivisions.length})
              </span>
            </h3>

            {!examType ? (
              <p className="text-gray-500 text-sm">
                {translate('Please select Session and Exam to load divisions')}
              </p>
            ) : (
              <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {examDivisionNameData?.map((division) => {
                  const isSelected = selectedDivisions.includes(division.ID);
                  return (
                    <button
                      key={division.ID}
                      type="button"
                      onClick={() => toggleDivision(division.ID)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium ${isSelected
                        ? 'bg-green-500 text-white border-green-500 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                        }`}
                    >
                      {division.DivisionNames}
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* বাটন সেকশন */}
          <div className="col-span-2 flex justify-end gap-3 mt-6 border-t pt-4">
            <Button type="button" variant="secondary" onClick={() => hideModal()}>
              {translate('Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating || selectedDivisions.length === 0}
              loading={isCreating || isUpdating}
            >
              {editData ? translate('Update') : translate('Save')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ExamDivisionSettingModal;