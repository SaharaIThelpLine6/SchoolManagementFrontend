import { useEffect } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
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

const emptyRow = { SubjectName: '', ArabicSubject: '', EngSubjectName: '' };

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

const toBn = (n) => Number(n).toLocaleString('bn-BD', { useGrouping: false });

const AddEditBook = ({ id }) => {
  const methods = useForm({
    defaultValues: { SubClassID: '', subjects: [emptyRow] },
  });
  const translate = useTranslate();
  const { handleSubmit, reset, setValue, watch, register, control } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subjects',
  });

  const isEditMode = !!id;
  const SubClassID = watch('SubClassID');

  const { data: subClassData = [], isLoading: isSubClassLoading } =
    useGetSubClasssQuery();
  const { data: academicSubjects = [] } = useGetAcademicSubjectsQuery(
    undefined,
    { skip: !isEditMode }
  );
  const { data: lastSerialData } = useGetLastSerialSubjectQuery(SubClassID, {
    skip: !SubClassID || isEditMode,
  });

  const [createSubject, { isLoading: isCreating }] =
    useCreateAcademicSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] =
    useUpdateAcademicSubjectMutation();

  const editData = isEditMode
    ? academicSubjects.find((subject) => subject.SubjectID == id)
    : null;

  const startSerial = Number(lastSerialData?.nextSerial) || 1;

  useEffect(() => {
    if (editData) {
      setValue('SubClassID', editData.SubClassID || '');
      setValue('SubSerial', editData.SubSerial ?? '');
      setValue('SubjectName', editData.SubjectName || '');
      setValue('ArabicSubject', editData.ArabicSubject || '');
      setValue('EngSubjectName', editData.EngSubjectName || '');
    } else if (!isEditMode) {
      reset({ SubClassID: '', subjects: [emptyRow] });
    }
  }, [editData, isEditMode, setValue, reset]);

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
        await updateSubject({
          id,
          SubClassID: formData.SubClassID,
          // SubSerial input disabled thakle form value ashe na, tai editData theke fallback
          SubSerial: formData.SubSerial || editData?.SubSerial,
          SubjectName: formData.SubjectName,
          ArabicSubject: formData.ArabicSubject,
          EngSubjectName: formData.EngSubjectName,
        }).unwrap();
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
          text:
            err?.data?.message ||
            err?.data?.error ||
            translate('Failed to update subject'),
          width: '400px',
        });
      }
    }
  };

  // 🔹 Submit logic
  const onSubmit = async (formData) => {
    if (isEditMode) {
      await handleEditWithConfirm(formData);
      return;
    }

    const subjects = (formData.subjects || [])
      .map((s) => ({
        SubjectName: s.SubjectName?.trim() || '',
        ArabicSubject: s.ArabicSubject?.trim() || '',
        EngSubjectName: s.EngSubjectName?.trim() || '',
      }))
      .filter((s) => s.SubjectName);

    if (!subjects.length) {
      toast.error(translate('Subject name is required'));
      return;
    }

    try {
      const res = await createSubject({
        SubClassID: formData.SubClassID,
        subjects,
      }).unwrap();
      toast.success(
        res?.message || translate('Subject created successfully')
      );
      hideModal();
      reset({ SubClassID: '', subjects: [emptyRow] });
    } catch (err) {
      console.error('Error:', err);
      toast.error(
        err?.data?.message ||
        err?.data?.error ||
        translate('Failed to save subject')
      );
    }
  };

  return (
    <div className="w-full p-5">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Class Group */}
          <div className="w-full md:w-2/3">
            <DefaultSelect
              label={translate('Class Group')}
              options={subClassData || []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
              require={translate('Class group is required')}
              loading={isSubClassLoading}
            />
          </div>

          {isEditMode ? (
            /* ================= EDIT MODE (single) ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DefaultInput
                label={translate('Serial Number')}
                registerKey="SubSerial"
                type="number"
                disable
                defaultValue={editData?.SubSerial}
              />
              <DefaultInput
                label={translate('Subject Name')}
                registerKey="SubjectName"
                require={translate('Subject name is required')}
              />
              <DefaultInput
                label={translate('Arabic Name')}
                registerKey="ArabicSubject"
                isRtl={true}
              />
              <DefaultInput
                label={translate('English Name')}
                registerKey="EngSubjectName"
                isRtl={true}
              />
            </div>
          ) : (
            /* ================= CREATE MODE (multiple) ================= */
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-center text-base font-semibold">
                    <th className="w-16 bg-white">{translate('Serial')}</th>
                    <th className="bg-white">{translate('Bangla')}</th>
                    <th className="bg-white">{'English Name'}</th>
                    <th className="bg-white">{'الاسم العربي'}</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="bg-white">
                      <td className="text-center text-lg bg-white">
                        {toBn(startSerial + index)}
                      </td>
                      <td className="px-2 bg-white">
                        <input
                          className={inputClass}
                          {...register(`subjects.${index}.SubjectName`, {
                            required: translate('Subject name is required'),
                          })}
                          placeholder={translate('Subject Name') + "..."}
                        />
                        {methods.formState.errors?.subjects?.[index]
                          ?.SubjectName && (
                            <p className="mt-1 text-xs text-red-500">
                              {
                                methods.formState.errors.subjects[index]
                                  .SubjectName.message
                              }
                            </p>
                          )}
                      </td>

                      <td className="px-2 bg-white">
                        <input
                          className={inputClass}
                          {...register(`subjects.${index}.EngSubjectName`)}
                          placeholder={'English Name...'}
                        />
                      </td>
                      <td className="px-2 bg-white">
                        <input
                          dir="rtl"
                          className={inputClass}
                          {...register(`subjects.${index}.ArabicSubject`)}
                          placeholder={'الاسم العربي...'}
                        />
                      </td>
                      <td className="text-center bg-white">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="rounded-md p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                          title={translate('Delete')}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Button
                type="button"
                variant="secondary"
                onClick={() => append(emptyRow)}
              >
                + {translate('Add')}
              </Button>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-2">
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