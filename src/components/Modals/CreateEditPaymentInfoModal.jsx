import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '../../components/Button/Button';
import DefaultInput from '../../components/Forms/DefaultInput';
import {
  useCreateAcademicSubjectMutation,
  useGetAcademicSubjectsQuery,
  useGetLastSerialSubjectQuery,
  useGetSubClasssQuery,
  useUpdateAcademicSubjectMutation,
} from '../../features/class/classQuerySlice';
import { useGetMaddrasahSSLQuery } from '../../features/payment/paymentSlice';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';

const CreateEditPaymentInfoModal = ({ id }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, reset, setValue, watch } = methods;

  // 🔹 Check if edit mode
  const isEditMode = !!id;
  const SubClassID = watch('SubClassID');
  // 🔹 Fetch subclass and subjects
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
  const { data: maddrasaData = [] } = useGetMaddrasahSSLQuery(SubClassID, {
    skip: !SubClassID,
  });
  console.log(maddrasaData, 'maddrasaData');

  // 🔹 Mutations
  const [createSubject, { isLoading: isCreating }] =
    useCreateAcademicSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] =
    useUpdateAcademicSubjectMutation();

  // 🔹 Find edit data if editing
  const editData = isEditMode
    ? academicSubjects.find((subject) => subject.SubjectID == id)
    : null;

  // 🔹 Prefill data when editing
  useEffect(() => {
    if (editData) {
      // setValue('SubSerial', editData.SubSerial || '');
      setValue('SubClassID', editData.SubClassID || '');
      setValue('SubjectName', editData.SubjectName || '');
      setValue('ArabicSubject', editData.ArabicSubject || '');
      setValue('EngSubjectName', editData.EngSubjectName || '');
    } else {
      reset();
    }
  }, [editData, setValue, reset]);

  // 🔹 Submit logic
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateSubject({ id, ...formData }).unwrap();
        toast.success(translate('Subject updated successfully'));
      } else {
        await createSubject(formData).unwrap();
        toast.success(translate('Subject created successfully'));
      }

      hideModal();
      reset();
    } catch (err) {
      console.error('Error:', err);
      toast.error(err?.data?.message || translate('Failed to save subject'));
    }
  };

  return (
    <div className="w-full border rounded-lg p-5 bg-white shadow-inner">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <SearchableMultiStudentSelect
            label="Maddrasah"
            registerKey="notDoneStudents"
            options={studentOptions}
            valueField="UserCode"
            nameField="InstituteName"
          />

          {/* Right Column */}
          <DefaultInput
            label={translate('Store ID')}
            registerKey="StoreID"
            require={translate('Store id is required')}
          />

          <DefaultInput
            label={translate('Store Password')}
            registerKey="StorePass"
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

export default CreateEditPaymentInfoModal;
