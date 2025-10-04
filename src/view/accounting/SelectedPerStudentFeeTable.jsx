import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../../components/Button/Button';
import DeleteButton from '../../components/Button/DeleteButton';
import DefaultInput from '../../components/Forms/DefaultInput';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import {
  useDeleteSelectedPerStudentFeeMutation,
  useGetMonthlyFeeAcceptQuery,
  usePostSelectedPerStudentFeeMutation,
} from '../../features/feeCollection/feeCollectionSlice';
import { setFilteredSelectedPerStudentFee } from '../../features/student/studentSlice';
import bnBijoy2Unicode from '../../utils/conveter';
import useTranslate from '../../utils/Translate';

const SelectedPerStudentFeeTable = ({ resetForm }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const { data: monthlyFees } = useGetMonthlyFeeAcceptQuery();
  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );

  console.log(monthlyFees, 'monthlyFees');

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
    console.log(
      'filteredSelectedPerStudentFee:',
      filteredSelectedPerStudentFee
    );
    if (filteredSelectedPerStudentFee) {
      const defaultValues = {
        selectedSLID: '',
        subLedgerFee:
          filteredSelectedPerStudentFee.subLedgerFee?.map((item) => ({
            ...item,
            Amount: Number(item.Amount),
            Less: Number(item.Less),
          })) || [],
      };
      console.log('Setting default values for form:', defaultValues);
      reset(defaultValues, { keepDirty: false, keepTouched: false });
    } else {
      console.log('Resetting form to empty values');
      reset(
        {
          selectedSLID: '',
          subLedgerFee: [],
        },
        { keepDirty: false, keepTouched: false }
      );
    }
    console.log('Form state after reset:', getValues());
  }, [filteredSelectedPerStudentFee, reset, getValues]);

  const handleAddSubLedger = async (selectedSLID) => {
    console.log('Adding subLedger with SLID:', selectedSLID);
    if (!filteredSelectedPerStudentFee) {
      await Swal.fire({
        icon: 'warning',
        title: 'No Student Selected',
        text: 'Please select a student to proceed with fee management.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    if (!monthlyFees || !selectedSLID) {
      await Swal.fire({
        icon: 'info',
        title: 'Oops...',
        text: 'Please select a sub-ledger from the list first',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const selectedId = Number(selectedSLID);
    const selectedItem = monthlyFees.find((sl) => sl.SLID === selectedId);

    if (!selectedItem) {
      await Swal.fire({
        icon: 'error',
        title: 'Not Found',
        text: 'The selected sub-ledger could not be found. Please try again.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (subLedgerFeeValues.some((item) => item.SLID === selectedId)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Already Added',
        html: `
          <div style="text-align: center;">
            <p>The sub-ledger <strong>"${bnBijoy2Unicode(
              selectedItem.SlName
            )}"</strong> is already in the list.</p>
            <p>SLID: ${selectedItem.SLID}</p>
          </div>
        `,
        confirmButtonText: 'Understood',
        confirmButtonColor: '#6c757d',
      });
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

    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    await toast.fire({
      icon: 'success',
      title: `Added: ${bnBijoy2Unicode(selectedItem.SlName)}`,
    });
  };

  const handleDelete = async (item) => {
    console.log('Deleting item with SLID:', item.SLID, 'isNew:', item.isNew);
    try {
      const result = await Swal.fire({
        title: 'Delete Confirmation',
        html: `Are you sure you want to delete this item?<br><strong>SLID: ${item.SLID}</strong>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Keep',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          confirmButton: 'btn btn-danger',
          cancelButton: 'btn btn-secondary',
        },
      });

      if (result.isConfirmed) {
        if (item.isNew) {
          console.log(
            'Deleting new item (not saved in DB) with SLID:',
            item.SLID
          );
          setValue(
            'subLedgerFee',
            subLedgerFeeValues.filter((sl) => sl.SLID !== item.SLID),
            { shouldValidate: true }
          );
          console.log('Updated subLedgerFeeValues:', getValues().subLedgerFee);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'New item has been successfully deleted',
            timer: 2000,
            showConfirmButton: false,
          });
          return;
        }

        const payload = {
          AdmissionID: filteredSelectedPerStudentFee?.AdmissionID,
          SLID: item.SLID,
        };

        console.log('Delete payload:', payload);

        if (!payload.AdmissionID || !payload.SLID) {
          console.log('Invalid payload for delete:', payload);
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: 'Invalid data for deletion. Please ensure a student is selected.',
            confirmButtonText: 'OK',
          });
          return;
        }

        Swal.fire({
          title: 'Deleting...',
          text: 'Please wait while we delete the item',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await deleteSelectedPerStudentFee(payload).unwrap();

        setValue(
          'subLedgerFee',
          subLedgerFeeValues.filter((sl) => sl.SLID !== item.SLID),
          { shouldValidate: true }
        );
        console.log('Updated subLedgerFeeValues:', getValues().subLedgerFee);

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Item has been successfully deleted from database',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'There was an error deleting the item',
        confirmButtonText: 'OK',
      });
    }
  };

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    if (!filteredSelectedPerStudentFee) {
      Swal.fire({
        icon: 'info',
        title: 'No Data',
        text: 'Student fee information is not available. Please select a student first.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const admissionID = filteredSelectedPerStudentFee.AdmissionID;
    const sessionID = filteredSelectedPerStudentFee.SessionID;
    const classID = filteredSelectedPerStudentFee.ClassID;

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

    console.log('Payload for API:', payload);

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save/update the fees?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await postSelectedPerStudentFee(payload).unwrap();
        Swal.fire({
          title: 'Success!',
          text: 'Fees saved/updated successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        reset({
          selectedSLID: '',
          subLedgerFee: [],
        });
        // resetForm();
        dispatch(setFilteredSelectedPerStudentFee(null));
      } catch (error) {
        console.error('API call failed:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong while saving fees.',
          icon: 'error',
        });
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-end justify-start gap-4 my-5">
          <div className="w-48">
            <DefaultSelect
              label="Fees"
              options={monthlyFees ?? []}
              valueField="SLID"
              nameField="SlName"
              registerKey="selectedSLID"
              unicode={true}
            />
          </div>

          <Button
            type="button"
            className="px-6 h-10"
            onClick={() => handleAddSubLedger(watch('selectedSLID'))}
          >
            {translate('Add')}
          </Button>
          <div className="mt-4">
            <Button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded"
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
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center h-full">
                        <DeleteButton onClick={() => handleDelete(item)} />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {bnBijoy2Unicode(item.SlName)}
                    </td>
                    <td className="px-2 py-2 text-center whitespace-nowrap min-w-[120px]">
                      <DefaultInput
                        registerKey={`subLedgerFee.${index}.Less`}
                        type="number"
                        defaultValue={Number(item.Less)}
                        className="w-full min-w-[100px] max-w-[150px] mx-auto"
                      />
                    </td>
                    <td className="px-2 py-2 text-center whitespace-nowrap min-w-[120px]">
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
