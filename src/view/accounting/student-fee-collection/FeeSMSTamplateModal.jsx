import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import DefaultInput from '../../../components/Forms/DefaultInput';
import Textarea from '../../../components/Forms/Textarea';
import DefaultRadio from '../../../components/Radio/DefaultRadio';
import ToggleSwitch from '../../../components/Switchers/ToggleSwitch';
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '../../../features/settings/settingsQuerySlice';

const FeeSMSTamplateModal = () => {
  const methods = useForm();
  const { data: settingsData, refetch } = useGetSettingsQuery();
  const [updateSetting] = useUpdateSettingsMutation();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get current values from settings data
  const currentFeeStatus = settingsData?.data?.find(
    (item) => item.ID === 6
  )?.Action;
  const currentPermissionStatus = settingsData?.data?.find(
    (item) => item.ID === 9
  )?.Action;

  const feeStatus = [
    { id: 1, name: 'সাদা-কালা' },
    { id: 2, name: 'রঙিন' },
    { id: 3, name: 'প্রেসে ছাপানো কাগজে' },
  ];

  // Set form default values when settings data loads
  useEffect(() => {
    if (settingsData?.data) {
      if (
        currentFeeStatus !== undefined &&
        [1, 2, 3].includes(currentFeeStatus)
      ) {
        methods.setValue('IsActive', currentFeeStatus);
      }

      // Convert 0/1 to boolean for toggle switch
      if (currentPermissionStatus !== undefined) {
        const permissionValue = currentPermissionStatus === 1;
        methods.setValue('PIsActive', permissionValue);
      }
    }
  }, [settingsData, methods, currentFeeStatus, currentPermissionStatus]);

  // Handle fee status change (ID: 6)
  const handleFeeStatusChange = async (value) => {
    if (value === currentFeeStatus || isUpdating) return;

    try {
      setIsUpdating(true);
      const feeResponse = await updateSetting({
        ID: 6,
        Action: parseInt(value),
      }).unwrap();

      if (feeResponse.message) {
        toast.success(
          `রসিদ টাইপ আপডেট: ${
            feeStatus.find((f) => f.id === parseInt(value))?.name
          }`,
          { toastId: `fee-status-${value}` }
        );
        await refetch();
      }
    } catch (error) {
      console.error('❌ Error updating fee status:', error);
      toast.error('রসিদ টাইপ আপডেট করতে সমস্যা হয়েছে!');
      methods.setValue('IsActive', currentFeeStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle permission toggle (ID: 9)
  const handlePermissionToggle = async (checked) => {
    if (isUpdating) return;
    const permissionAction = checked ? 1 : 0;

    if (permissionAction === currentPermissionStatus) return;

    try {
      setIsUpdating(true);
      const permissionResponse = await updateSetting({
        ID: 9,
        Action: permissionAction,
      }).unwrap();

      if (permissionResponse.message) {
        toast.success(
          `এসএমএস পারমিশন আপডেট: ${checked ? 'সক্রিয়' : 'নিষ্ক্রিয়'}`,
          { toastId: `permission-${permissionAction}` }
        );
        await refetch();
      }
    } catch (error) {
      console.error('❌ Error updating permission status:', error);
      toast.error('এসএমএস পারমিশন আপডেট করতে সমস্যা হয়েছে!');
      methods.setValue('PIsActive', !checked); // revert if failed
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreview = () => {
    console.log('Preview clicked');
  };

  // Watch for fee status change
  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === 'IsActive' && value.IsActive !== undefined) {
        handleFeeStatusChange(value.IsActive);
      }
    });
    return () => subscription.unsubscribe();
  }, [methods.watch]);

  return (
    <FormProvider {...methods}>
      <div className="bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg">
            <h2 className="text-xl font-semibold">Demo Madrasa</h2>
            <p className="text-sm opacity-90 mt-1">এসএমএস ও রসিদ সেটিং</p>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <DefaultInput
                registerKey={'UserID'}
                label={'User ID'}
                placeholder="ইউজার আইডি"
              />
              <DefaultInput
                registerKey={'ReceiptNo'}
                label={'Receipt No'}
                placeholder="রসিদ নম্বর"
              />
            </div>

            {/* Fee Permission Toggle */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <DefaultInput
                registerKey={'TotalFee'}
                label={'Total Fee'}
                placeholder="মোট ফি"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  মাসিক ফি এসএমএস পারমিশন:
                </label>
                <ToggleSwitch
                  checked={methods.watch('PIsActive') || false}
                  onChange={(e) => handlePermissionToggle(e.target.checked)}
                  label={methods.watch('PIsActive') ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                />

              </div>
            </div>

            <Textarea
              label={'এসএমএস মেসেজ'}
              registerKey={'Message'}
              placeholder="এসএমএস মেসেজ লিখুন..."
              rows={4}
            />

            <div className="border-t border-gray-200 pt-4">
              <DefaultRadio
                options={feeStatus}
                label={'রসিদ টাইপ'}
                registerKey="IsActive"
              />

            </div>

            {/* Preview Button */}
            <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePreview}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-8 rounded-md transition duration-200"
              >
                প্রিভিউ
              </button>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default FeeSMSTamplateModal;
