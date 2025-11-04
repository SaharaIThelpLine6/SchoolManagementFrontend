import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '../../components/Button/Button';
import DefaultInput from '../../components/Forms/DefaultInput';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import Loading from '../../components/Loading/Loading';
import { useGetClassListQuery } from '../../features/class/classQuerySlice';
import {
  useGetLastSubclassQuery,
  useGetSubclassQuery,
  usePostSubClassMutation,
  useUpdateSubClassMutation,
} from '../../features/session/sessionSlice';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';

const SubclassCreateUpdatemodal = ({ id }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, reset, setValue, watch } = methods;
  const ClassID = watch('ClassID');

  // 🔹 Check if edit mode
  const isEditMode = !!id;
  // 🔹 Query & Mutations
  const { data: classes = [] } = useGetClassListQuery();

  // ✅ সঠিক উপায়
  const selectedClass = classes.find(
    (item) => item.ClassID === Number(ClassID)
  );

  const className = selectedClass ? selectedClass.ClassName : '';

  // 🔹 Fetch data only in edit mode - fixed query options
  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetSubclassQuery(id, {
    skip: !isEditMode,
    refetchOnMountOrArgChange: true, // Add this to force refetch
  });

  const { data: singleData = [] } = useGetLastSubclassQuery();
  const serialNumber = singleData?.lastSerial + 1;

  // 🔹 Properly extract data based on your API response structure
  const subClassData = useMemo(() => {
    if (!responseData) return null;

    // Check different possible response structures
    if (responseData.data) {
      return responseData.data; // If response is { data: {...} }
    } else if (responseData.subClass) {
      return responseData.subClass; // If response is { subClass: {...} }
    } else {
      return responseData; // If response is the direct object
    }
  }, [responseData]);

  // 🔹 Mutations
  const [addSubClass, { isLoading: isAdding }] = usePostSubClassMutation();
  const [updateSubClass, { isLoading: isUpdating }] =
    useUpdateSubClassMutation();

  useEffect(() => {
    if (subClassData) {
      setValue('ClassID', subClassData.ClassID);
    }
  }, [subClassData, setValue]);

  // 🔹 Reset form when modal closes or id changes
  useEffect(() => {
    if (!isEditMode) {
      reset();
    }
  }, [isEditMode, reset]);

  // 🔹 Submit logic
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateSubClass({ id, data: formData }).unwrap();
        toast.success(translate('Sub class updated successfully'));
      } else {
        await addSubClass(formData).unwrap();
        toast.success(translate('Sub class created successfully'));
      }
      hideModal();
      reset();
    } catch (err) {
      toast.error(translate('Failed to save sub class'));
      console.error(err);
    }
  };

  if (isLoading && isEditMode) return <Loading />;
  if (isError) return <div className="text-red-500">Error loading data</div>;

  return (
    <div className="w-full border rounded-lg p-5 bg-white shadow-inner">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        {isEditMode
          ? translate('Update Sub Class')
          : translate('Create Sub Class')}
      </h2>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <DefaultSelect
              label="Class ID"
              options={classes ?? []}
              valueField="ClassID"
              nameField="ClassName"
              unicode
              registerKey="ClassID"
              require={translate('Class ID is required')}
            />
            <DefaultInput
              label={translate('Serial')}
              registerKey="Serial"
              defaultValue={isEditMode ? subClassData?.Serial : serialNumber}
              type="number"
              placeholder={'Enter sub class serial...'}
            />
            <DefaultInput
              label={translate('Sub Class Bangla')}
              registerKey="SubClass"
              require={translate('Sub class name is required')}
              defaultValue={isEditMode ? subClassData?.SubClass : className}
              placeholder={'Enter sub class bangla name...'}
            />
            <DefaultInput
              label={translate('English Name')}
              registerKey="SubClassEng"
              defaultValue={subClassData?.SubClassEng}
              placeholder={'Enter subclass english name...'}
            />
            <DefaultInput
              label={translate('Arabic Name')}
              registerKey="SubClassAra"
              defaultValue={subClassData?.SubClassAra}
              placeholder={'Enter sub class arobic name...'}
            />
          </div>

          <div className="flex gap-3 mt-4 justify-end">
            <Button
              type="submit"
              disabled={isAdding || isUpdating}
              loading={isAdding || isUpdating}
            >
              {isEditMode ? translate('Update') : translate('Save')}
            </Button>
            <Button
              type="button"
              onClick={() => hideModal()}
              variant="secondary"
            >
              {translate('Cancel')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default SubclassCreateUpdatemodal;
