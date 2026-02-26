import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Button from '../../components/Button/Button';
import DeleteButton from '../../components/Button/DeleteButton';
import DefaultInput from '../../components/Forms/DefaultInput';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import {
  useDeleteSelectedPerStudentFeeMutation,
  useGetMonthlyFeeAcceptQuery,
  useGetStudentFeeIncreaseDecreaseQuery,
  usePostSelectedPerStudentFeeMutation,
} from '../../features/feeCollection/feeCollectionSlice';
import { useGetSettingsQuery } from '../../features/settings/settingsQuerySlice';
import bnBijoy2Unicode from '../../utils/conveter';
import useTranslate from '../../utils/Translate';

const SelectedPerStudentFeeTable = () => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const { data: monthlyFees } = useGetMonthlyFeeAcceptQuery();
  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );

  const shouldSkip =
    !filteredSelectedPerStudentFee?.AdmissionID ||
    !filteredSelectedPerStudentFee?.StudentCode;

  const { data: infoSettings = { data: [] } } = useGetSettingsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const tbiPrintView =
    infoSettings?.data?.find((item) => item.ID === 30) || null;

  const {
    data: studentMonthFeeData,
    isLoading: isLoadingMfd,
    error: errorMfd,
    isError: isErrorMfd,
  } = useGetStudentFeeIncreaseDecreaseQuery(
    {
      AdmissionID: filteredSelectedPerStudentFee?.AdmissionID,
      UserID: filteredSelectedPerStudentFee?.UserID,
      search: filteredSelectedPerStudentFee?.StudentCode,
      ClassID: filteredSelectedPerStudentFee?.ClassID,
      SessionID: filteredSelectedPerStudentFee?.SessionID,
    },
    {
      skip: shouldSkip,
    }
  );

  const subledgerData = studentMonthFeeData?.data[0]?.subLedgerFee;
  const feeSettings = studentMonthFeeData?.data[0]?.feeSettings;

  console.log(subledgerData, 'subledgerData');

  const methods = useForm({
    defaultValues: {
      selectedSLID: '',
      subLedgerFee: [],
    },
  });

  const { watch, setValue, handleSubmit, reset, getValues } = methods;
  const subLedgerFeeValues = watch('subLedgerFee');

  const [postSelectedPerStudentFee] = usePostSelectedPerStudentFeeMutation();
  const [deleteSelectedPerStudentFee] =
    useDeleteSelectedPerStudentFeeMutation();

  useEffect(() => {
    if (subledgerData.length > 0) {
      const defaultValues = {
        selectedSLID: '',
        subLedgerFee:
          subledgerData?.map((item) => ({
            ...item,
            Amount: Number(item.Amount),
            Less: Number(item.Less),
          })) || [],
      };
      console.log('Setting default values for form:', defaultValues);
      reset(defaultValues, { keepDirty: false, keepTouched: false });
    } else if (feeSettings && feeSettings.length > 0) {
      const defaultValues = {
        selectedSLID: '',
        subLedgerFee:
          feeSettings.map((item) => ({
            ...item,
            SlName: item.SlName,
            Amount: Number(item.amount) || 0,
            Less: 0,
            isNew: true,
          })) || [],
      };
      console.log('Setting default values from feeSettings:', defaultValues);
      reset(defaultValues, { keepDirty: false, keepTouched: false });
    } else {
      const defaultValues = {
        selectedSLID: '',
        subLedgerFee: [],
      };
      console.log('Setting empty default values');
      reset(defaultValues, { keepDirty: false, keepTouched: false });
    }
    console.log('Form state after reset:', getValues());
  }, [subledgerData, reset, getValues]);

  const handleAddSubLedger = async (selectedSLID) => {
    console.log('Adding subLedger with SLID:', selectedSLID);
    if (!filteredSelectedPerStudentFee) {
      toast.warning('Please select a student to proceed with fee management.', {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }
    if (!monthlyFees || !selectedSLID) {
      toast.info('Please select a sub-ledger from the list first', {
        position: 'top-right',
        autoClose: 4000,
      });
      return;
    }

    const selectedId = Number(selectedSLID);
    const selectedItem = monthlyFees.find((sl) => sl.SLID === selectedId);

    if (!selectedItem) {
      toast.error(
        'The selected sub-ledger could not be found. Please try again.',
        {
          position: 'top-right',
          autoClose: 5000,
        }
      );
      return;
    }

    if (subLedgerFeeValues.some((item) => item.SLID === selectedId)) {
      toast.warning(
        `The sub-ledger "${bnBijoy2Unicode(
          selectedItem.SlName
        )}" is already in the list. SLID: ${selectedItem.SLID}`,
        {
          position: 'top-right',
          autoClose: 5000,
        }
      );
      return;
    }

    const newSubLedgerFee = [
      ...subLedgerFeeValues,
      {
        UserID: filteredSelectedPerStudentFee?.UserID || '',
        SLID: selectedItem.SLID,
        SlName: selectedItem.SlName,
        Amount: 0,
        Less: 0,
        isNew: true,
      },
    ];

    console.log('New subLedgerFee:', newSubLedgerFee);
    setValue('subLedgerFee', newSubLedgerFee, { shouldValidate: true });
    console.log('Form state after setValue:', getValues());

    toast.success(`Added: ${bnBijoy2Unicode(selectedItem.SlName)}`, {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const handleDelete = async (item) => {
    console.log('Deleting item with SLID:', item.SLID, 'isNew:', item.isNew);

    try {
      if (item.isNew) {
        // শুধু form state থেকে remove
        setValue(
          'subLedgerFee',
          subLedgerFeeValues.filter((sl) => sl.SLID !== item.SLID),
          { shouldValidate: true }
        );
        console.log(
          'Updated subLedgerFeeValues (new removed):',
          getValues().subLedgerFee
        );

        toast.success('New item has been successfully deleted', {
          position: 'top-right',
          autoClose: 2000,
        });
        return;
      }

      // DB item delete
      const payload = {
        AdmissionID: filteredSelectedPerStudentFee?.AdmissionID,
        SLID: item.SLID,
      };

      console.log('Delete payload:', payload);

      if (!payload.AdmissionID || !payload.SLID) {
        console.log('Invalid payload for delete:', payload);
        toast.error(
          'Invalid data for deletion. Please ensure a student is selected.',
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
        return;
      }

      const deleteToast = toast.loading('Deleting... Please wait', {
        position: 'top-right',
      });

      await deleteSelectedPerStudentFee(payload).unwrap();

      setValue(
        'subLedgerFee',
        subLedgerFeeValues.filter((sl) => sl.SLID !== item.SLID),
        { shouldValidate: true }
      );
      console.log(
        'Updated subLedgerFeeValues (db removed):',
        getValues().subLedgerFee
      );

      toast.update(deleteToast, {
        render: 'Item has been successfully deleted from database',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
        hideProgressBar: false,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('There was an error deleting the item', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const onSubmit = async (data, e) => {
    e.preventDefault();

    if (!filteredSelectedPerStudentFee) {
      toast.info(
        'শিক্ষার্থীর ফি সংক্রান্ত তথ্য পাওয়া যায়নি। আগে একজন শিক্ষার্থী নির্বাচন করুন।',
        {
          position: 'top-right',
          autoClose: 5000,
        }
      );
      return;
    }

    const admissionID = filteredSelectedPerStudentFee.AdmissionID;
    const sessionID = filteredSelectedPerStudentFee.SessionID;
    const classID = filteredSelectedPerStudentFee.ClassID;

    // 🔹 Step 1: payload তৈরি
    const payload = data.subLedgerFee.map((item) => ({
      AdmissionID: admissionID,
      UserID: item.UserID,
      SessionID: sessionID,
      ClassID: classID,
      SLID: item.SLID,
      SlName: item.SlName,
      Amount: Number(item.Amount) || 0,
      Less: Number(item.Less) || 0,
      FainalAmount: (Number(item.Amount) || 0) - (Number(item.Less) || 0),
    }));

    // 🔹 Step 2: শুধুমাত্র Action = 1 হলে invalid item চেক করবে
    if (tbiPrintView.Action === 1) {
      const hasInvalidItem = payload.some((item) => item.Amount === 0);

      if (hasInvalidItem) {
        toast.warning(
          'যেসব আইটেমের পরিমাণ ০, সেগুলো সংরক্ষণ করা সম্ভব নয় (Action = 1)।',
          {
            position: 'top-right',
            autoClose: 4000,
          }
        );
        return; // ❌ DB তে যাবে না
      }
    }

    // 🔹 Step 3: Action === 2 হলে বা সব valid হলে DB তে যাবে
    try {
      const saveToast = toast.loading('ফি সংরক্ষণ করা হচ্ছে...', {
        position: 'top-right',
      });

      await postSelectedPerStudentFee(payload).unwrap();

      toast.update(saveToast, {
        render: 'ফি সফলভাবে সংরক্ষিত হয়েছে!',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
    } catch (error) {
      console.error('API call failed:', error);
      toast.error('ফি সংরক্ষণের সময় কোনো সমস্যা হয়েছে।', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="sm:col-span-1">
            {subledgerData.length > 0 && (
              <div className="w-full max-w-xs">
                <DefaultSelect
                  label="Fees"
                  options={monthlyFees ?? []}
                  valueField="SLID"
                  nameField="SlName"
                  registerKey="selectedSLID"
                  unicode={true}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="sm:col-span-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-end">
            {subledgerData.length > 0 && (
              <Button
                type="button"
                onClick={() => handleAddSubLedger(watch('selectedSLID'))}
                variant="outline"
                className="px-4 py-2 border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-md"
              >
                {translate('Add')}
              </Button>
            )}

            <Button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {translate('Save')}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
          <table className="min-w-full table-auto text-sm md:text-base">
            <thead className="bg-[#e9ebee] text-black">
              <tr>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Action')}
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Fee Name')}
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Deduction')}
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Fee')}
                </th>
              </tr>
            </thead>
            <tbody>
              {subLedgerFeeValues?.length > 0 ? (
                subLedgerFeeValues.map((item, index) => (
                  <tr key={`${item.SLID}-${index}`} className="border-t">
                    <td className="px-4 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center h-full">
                        <DeleteButton onClick={() => handleDelete(item)} />
                      </div>
                    </td>
                    <td className="px-4 text-center whitespace-nowrap">
                      {bnBijoy2Unicode(item.SlName)}
                    </td>
                    <td className="px-2 text-center whitespace-nowrap min-w-[120px]">
                      <DefaultInput
                        registerKey={`subLedgerFee.${index}.Less`}
                        type="number"
                        defaultValue={
                          item?.Less != null
                            ? Number(item.Less)
                            : Number(item.Amount)
                        }
                        className="w-full min-w-[100px] max-w-[150px] mx-auto"
                      />
                    </td>

                    <td className="px-2 text-center whitespace-nowrap min-w-[120px]">
                      <DefaultInput
                        registerKey={`subLedgerFee.${index}.Amount`}
                        type="number"
                        defaultValue={Number(item.Amount)}
                        className="w-full min-w-[100px] max-w-[150px] mx-auto"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center">
                    No fees added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </form>
    </FormProvider>
  );
};

export default SelectedPerStudentFeeTable;
