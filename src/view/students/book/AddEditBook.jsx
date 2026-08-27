import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Button from '../../../components/Button/Button';
import DefaultInput from '../../../components/Forms/DefaultInput';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import {
  useCreateAcademicSubjectMutation,
  useGetAcademicSubjectsQuery,
  useGetLastSerialSubjectQuery,
  useGetSubClasssQuery,
  useUpdateAcademicSubjectMutation,
} from '../../../features/class/classQuerySlice';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

const AddEditBook = ({ id }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, reset, setValue, watch } = methods;

  const isEditMode = !!id;
  const SubClassID = watch('SubClassID');

  const { data: subClassData = [], isLoading: isSubClassLoading } =
    useGetSubClasssQuery();
  const { data: academicSubjects = [] } = useGetAcademicSubjectsQuery(
    undefined,
    {
      skip: !isEditMode,
    }
  );
  const { data: academicSubjectss = [] } = useGetLastSerialSubjectQuery(
    SubClassID,
    {
      skip: !SubClassID,
    }
  );

  const [createSubject, { isLoading: isCreating }] =
    useCreateAcademicSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] =
    useUpdateAcademicSubjectMutation();

  const editData = isEditMode
    ? academicSubjects.find((subject) => subject.SubjectID == id)
    : null;

  useEffect(() => {
    if (editData) {
      setValue('SubClassID', editData.SubClassID || '');
      setValue('SubjectName', editData.SubjectName || '');
      setValue('ArabicSubject', editData.ArabicSubject || '');
      setValue('EngSubjectName', editData.EngSubjectName || '');
    } else {
      reset();
    }
  }, [editData, setValue, reset]);

  // 🔹 Update with confirmation
  const handleEditWithConfirm = async (formData) => {
    const result = await Swal.fire({
      title: translate('Are you sure?'),
      text: translate('You want to update this subject?'),
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
        await updateSubject({ id, ...formData }).unwrap();
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
          text: err?.data?.message || translate('Failed to update subject'),
          width: '400px',
        });
      }
    }
  };

  // 🔹 Submit logic
  const onSubmit = async (formData) => {
    if (isEditMode) {
      await handleEditWithConfirm(formData);
    } else {
      try {
        await createSubject(formData).unwrap();
        toast.success(translate('Subject created successfully'));
        hideModal();
        reset();
      } catch (err) {
        console.error('Error:', err);
        toast.error(err?.data?.message || translate('Failed to save subject'));
      }
    }
  };

  return (
    <div className="w-full border rounded-lg p-5 bg-white shadow-inner">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        {isEditMode ? translate('Update Subject') : translate('Create Subject')}
      </h2>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Left Column */}
          <DefaultInput
            label={translate('Serial Number')}
            registerKey="SubSerial"
            type="number"
            require={translate('Serial is required')}
            disable
            defaultValue={
              isEditMode ? editData?.SubSerial : academicSubjectss?.nextSerial
            }
          />

          <DefaultSelect
            label={translate('Class Group')}
            options={subClassData || []}
            valueField="SubClassID"
            nameField="SubClass"
            registerKey="SubClassID"
            require={translate('Class group is required')}
            loading={isSubClassLoading}
            unicode
          />

          {/* Right Column */}
          <DefaultInput
            label={translate('Subject Name')}
            registerKey="SubjectName"
            require={translate('Subject name is required')}
          />

          <DefaultInput
            label={translate('English Name')}
            registerKey="EngSubjectName"
            isRtl={true}
          />
          <DefaultInput
            label={translate('Arabic Name')}
            registerKey="ArabicSubject"
            isRtl={true}
          />

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-3 mt-6">
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              loading={isCreating || isUpdating}
            >
              {isEditMode ? translate('Update') : translate('Save')}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => hideModal()}
            >
              {translate('Cancel')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddEditBook;
