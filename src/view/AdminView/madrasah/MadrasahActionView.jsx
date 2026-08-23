// src/view/AdminView/madrasah/MadrasahActionView.jsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import useTranslate from '../../../utils/Translate';
import DefaultInput from '../../../components/Forms/DefaultInput';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '../../../components/Button/Button';
import { useCheckUserDomainQuery, useConnectDomainMutation } from '../../../features/Admin/domainManage/domainManageSlice';
import { closeModal } from '../../../features/modal/modalSlice';
const BASE_DOMAIN = import.meta.env.VITE_BASE_URL;
const MadrasahActionView = ({ id, meta }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const [connectDomain] = useConnectDomainMutation();

  const { handleSubmit, register } = methods
  const rowData = meta?.rowData || {};
    const { data: userDomainData } = useCheckUserDomainQuery({ UserCode: rowData.UserCode });


  useEffect(()=>{
    console.log(userDomainData);
  }, [userDomainData])

  const handleSaveRedirect = async (data) => {
    try {
      const result = await connectDomain(data).unwrap();
      console.log("unwrap resolved:", result);

      Swal.fire('Saved!', 'Redirect URL updated successfully.', 'success');
      console.log("swal fired ok");

      dispatch(closeModal());
      console.log("modal closed ok"); 
    } catch (error) {
      console.error("caught at:", error);
      Swal.fire('Error!', 'Failed to update Redirect URL.', 'error');
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <FormProvider {...methods} >
        <form onSubmit={handleSubmit(handleSaveRedirect)} className="font-default">
          <input className='hidden' {...register("UserCode")} value={rowData.UserCode} />
          <input className='hidden' {...register("tenantPath")} value={`/${rowData.UserCode}`} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translate('Primary Domain')}
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed">
              {`${BASE_DOMAIN}/${id}`}
            </div>
          </div>
          <div className='mb-2 mt-2'>
            <DefaultInput placeholder={"madrasa.com"} registerKey={"domain"} label={translate('Redirect Domain')} defaultValue={userDomainData?.Domain} />
          </div>

          <div className="text-center">
            <Button type="submit" className="mt-4 bg-blue-500 text-white">
              {translate('Save Redirect URL')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default MadrasahActionView;
