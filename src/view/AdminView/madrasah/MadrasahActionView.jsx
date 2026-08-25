// src/view/AdminView/madrasah/MadrasahActionView.jsx

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import useTranslate from '../../../utils/Translate';
import DefaultInput from '../../../components/Forms/DefaultInput';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '../../../components/Button/Button';
import {
  useCheckUserDomainQuery,
  useConnectDomainMutation
} from '../../../features/Admin/domainManage/domainManageSlice';
import { closeModal } from '../../../features/modal/modalSlice';

const BASE_DOMAIN = import.meta.env.VITE_BASE_URL;

const MadrasahActionView = ({ id, meta }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const methods = useForm();
  const { handleSubmit, register, reset } = methods;

  const [connectDomain, { isLoading: isSaving }] =
    useConnectDomainMutation();

  const rowData = meta?.rowData || {};

  const {
    data: userDomainData,
    isLoading: isDomainLoading,
    isFetching: isDomainFetching
  } = useCheckUserDomainQuery({
    UserCode: rowData.UserCode
  });

  useEffect(() => {
    if (userDomainData) {
      reset({
        UserCode: rowData.UserCode,
        tenantPath: `/${rowData.UserCode}`,
        domain: userDomainData?.Domain || ''
      });
    }
  }, [userDomainData, rowData.UserCode, reset]);

  const handleSaveRedirect = async (data) => {
    try {
      const result = await connectDomain(data).unwrap();

      console.log('unwrap resolved:', result);

      Swal.fire(
        'Saved!',
        'Redirect URL updated successfully.',
        'success'
      );

      dispatch(closeModal());
    } catch (error) {
      console.error('caught at:', error);

      Swal.fire(
        'Error!',
        'Failed to update Redirect URL.',
        'error'
      );
    }
  };

  // Show loading while domain data is loading
  if (isDomainLoading || isDomainFetching) {
    return (
      <div className="flex items-center justify-center py-10 font-default">
        <div className="text-center">
          <div className="mb-3 text-blue-500">
            {translate('Loading domain information...')}
          </div>

          <div className="text-sm text-gray-500">
            {translate('Please wait...')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(handleSaveRedirect)}
          className="font-default"
        >
          <input
            type="hidden"
            {...register('UserCode')}
          />

          <input
            type="hidden"
            {...register('tenantPath')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translate('Primary Domain')}
            </label>

            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed">
              {`${BASE_DOMAIN}/${id}`}
            </div>
          </div>

          <div className="mb-2 mt-2">
            <DefaultInput
              placeholder="madrasa.com"
              registerKey="domain"
              label={translate('Redirect Domain')}
            />
          </div>

          <div className="text-center">
            <Button
              type="submit"
              disabled={isSaving}
              className="mt-4 bg-blue-500 text-white"
            >
              {isSaving
                ? translate('Saving...')
                : translate('Save Redirect URL')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default MadrasahActionView;