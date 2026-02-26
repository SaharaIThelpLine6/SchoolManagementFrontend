import { useEffect, useState } from 'react'; // useEffect ইম্পোর্ট করুন
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '../../components/Button/Button';
import DefaultInput from '../../components/Forms/DefaultInput';
import {
  useGetMaddrasahDatabasesQuery,
  useGetMaddrasahSSLQuery,
  usePostMaddrasahSSLMutation,
  useUpdateMaddrasahSSLMutation,
} from '../../features/payment/paymentSlice';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import SearchableSingleStudentSelect from '../Forms/SearchableSingleStudentSelect';
import Loading from '../Loading/Loading';

const CreateEditPaymentInfoModal = ({ id }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, reset, setValue, watch } = methods;

  // Check if edit mode
  const isEditMode = !!id;

  console.log(id, 'id');

  // State for database search
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10000;

  // Fetch databases with search
  const { data: databaseResponse, isLoading: isDatabasesLoading } =
    useGetMaddrasahDatabasesQuery({
      page,
      limit,
      search,
      sortBy: 'InstituteName',
      sortOrder: 'ASC',
    });

  // Mutations for SSL config
  const [createSslConfig, { isLoading: isCreating }] =
    usePostMaddrasahSSLMutation();
  const [updateSslConfig, { isLoading: isUpdating }] =
    useUpdateMaddrasahSSLMutation();

  const { data: editData } = useGetMaddrasahSSLQuery(id, {
    skip: !id,
  });

  console.log(editData, 'editData');

  // Prepare options for dropdown
  const maddrasaOptions = databaseResponse?.data || [];

  // Watch the UserCode value
  const userCodeValue = watch('UserCode');

  // Prefill form if in edit mode
  useEffect(() => {
    if (id && editData) {
      console.log('Prefilling form with:', editData);

      // সার্চ সেট করুন
      setSearch(editData.SchoolID || '');

      // UserCode সেট করুন
      setValue('UserCode', editData.SchoolID || '');

      // অন্যান্য ফিল্ডও সেট করুন
      setValue('StoreID', editData.StoreID || '');
      setValue('StorePass', editData.StorePass || '');
    }
  }, [id, editData, setValue]);

  // হ্যান্ডেল সার্চ চেঞ্জ
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  // হ্যান্ডেল সিলেকশন চেঞ্জ
  const handleSelectionChange = (selectedOption) => {
    if (selectedOption) {
      setValue('UserCode', selectedOption.UserCode);
    } else {
      setValue('UserCode', '');
    }
  };

  // Handle form submission
  const onSubmit = async (formData) => {
    try {
      const payload = {
        schoolId: formData.UserCode,
        storeId: formData.StoreID,
        storePass: formData.StorePass,
      };
      console.log(payload, 'payload');

      if (isEditMode) {
        await updateSslConfig({ id, data: payload }).unwrap();
        toast.success(translate('SSL configuration updated successfully'));
      } else {
        await createSslConfig(payload).unwrap();
        toast.success(translate('SSL configuration created successfully'));
      }

      hideModal();
      reset();
    } catch (err) {
      console.error('Error:', err);
      toast.error(
        err?.data?.error || translate('Failed to save SSL configuration')
      );
    }
  };

  if (isDatabasesLoading) return <Loading />;

  return (
    <div className="w-full border rounded-lg p-5 bg-white shadow-inner">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="col-span-2">
            <SearchableSingleStudentSelect
              label="মাদ্রাসা নির্বাচন করুন"
              registerKey="UserCode"
              options={maddrasaOptions}
              valueField="UserCode"
              nameField="InstituteName"
              require={true}
              unicode={true}
              placeholder="মাদ্রাসার নাম লিখুন..."
              disabled={isEditMode} // Disable in edit mode
              onSearchChange={handleSearchChange}
              onChange={handleSelectionChange}
              defaultValue={isEditMode ? editData?.SchoolID : undefined}
              defaultLabel={
                isEditMode
                  ? maddrasaOptions.find(
                      (opt) => opt.UserCode === editData?.SchoolID
                    )?.InstituteName || ''
                  : undefined
              }
            />
          </div>

          {isDatabasesLoading && (
            <p className="text-sm text-gray-500">
              {translate('Loading databases...')}
            </p>
          )}

          <DefaultInput
            label={translate('Store ID')}
            registerKey="StoreID"
            require={translate('Store ID is required')}
            placeholder="Enter Store ID"
            defaultValue={id ? editData?.StoreID : ''}
          />

          <DefaultInput
            label={translate('Store Password')}
            registerKey="StorePass"
            require={translate('Store Password is required')}
            placeholder="Enter Store Password"
            defaultValue={id ? editData?.StorePass : ''}
          />

          {/* ডিবাগিং জন্য - বর্তমান মান দেখতে */}
          {/* <div className="col-span-2 text-xs text-gray-500">
            Current UserCode: {userCodeValue}
            <br />
            Edit Data SchoolID: {editData?.SchoolID}
          </div> */}

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              loading={isCreating || isUpdating}
              className="min-w-[120px]"
            >
              {isEditMode ? translate('Update') : translate('Save')}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                hideModal();
                reset();
              }}
              className="min-w-[120px]"
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
