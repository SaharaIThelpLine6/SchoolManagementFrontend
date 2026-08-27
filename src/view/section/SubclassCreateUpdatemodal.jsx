import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
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

  // ✅ সঠিক উপায়
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
    refetchOnMountOrArgChange: true,
  });

  const { data: singleData = [] } = useGetLastSubclassQuery();
  const serialNumber = singleData?.lastSerial + 1;

  // 🔹 Properly extract data based on your API response structure
  const subClassData = useMemo(() => {
    if (!responseData) return null;
    if (responseData.data) {
      return responseData.data;
    } else if (responseData.subClass) {
      return responseData.subClass;
    } else {
      return responseData;
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

  // 🔹 Edit with confirmation
  const handleEditWithConfirm = async (formData) => {
    const result = await Swal.fire({
      title: translate('Are you sure?'),
      text: translate('You want to update this sub class?'),
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
        await updateSubClass({ id, data: formData }).unwrap();
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
          text: err?.data?.message || translate('Failed to update sub class'),
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
        await addSubClass(formData).unwrap();
        toast.success(translate('Sub class created successfully'));
        hideModal();
        reset();
      } catch (err) {
        toast.error(translate('Failed to save sub class'));
        console.error(err);
      }
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
