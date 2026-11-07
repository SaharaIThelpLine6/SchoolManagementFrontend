import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Button from '../../../components/Button/Button';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import { useGetExamNamesQuery } from '../../../features/exam/examQuerySlice';
import {
  useCreateExamDivisionNameResultMutation,
  useDeleteExamDivisionNameResultMutation,
  useGetExamDivisionNameQuery,
  useGetExamDivisionNameResultsQuery,
  useGetExamTypeQuery,
  useUpdateExamDivisionNameResultMutation,
} from '../../../features/result/resultSilce';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

const MAX_DIVISIONS = 8;

// ---------- Icons ----------
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

// ---------- Helpers ----------
const getDivisionIds = (setting) => {
  const ids = [];
  for (let i = 1; i <= MAX_DIVISIONS; i++) {
    if (setting?.[`DivisionID${i}`]) ids.push(setting[`DivisionID${i}`]);
  }
  return ids;
};

const getErrorMessage = (err) => {
  if (!err) return '';
  return (
    err?.data?.error ||
    err?.data?.message ||
    err?.error ||
    (typeof err?.data === 'string' ? err.data : '') ||
    ''
  );
};

// ---------- Error Alert ----------
const ErrorAlert = ({ title, message }) => (
  <div
    role="alert"
    className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700"
  >
    <AlertIcon />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold">{title}</p>
      {message && (
        <p className="mt-1 break-words text-xs text-rose-600/90">{message}</p>
      )}
    </div>
  </div>
);

const ExamDivisionSettingModal = () => {
  const methods = useForm({ defaultValues: { ExamID: '' } });
  const translate = useTranslate();
  const { handleSubmit, reset, setValue, watch } = methods;

  const [selectedDivisions, setSelectedDivisions] = useState([]);

  const ExamID = watch('ExamID');

  // --- Queries ---
  const { data: examNameData } = useGetExamNamesQuery();

  // Saved setting list (Divisions array shoho, route theke-i name ashe)
  const { data: divisionSettingData, isLoading: isFetchingSettings } =
    useGetExamDivisionNameResultsQuery();

  // Exam type (404 hole error ashbe)
  const {
    data: examType,
    error: examTypeError,
    isFetching: isFetchingExamType,
  } = useGetExamTypeQuery({ examid: ExamID }, { skip: !ExamID });

  // Division name list
  const {
    data: examDivisionNameData,
    error: divisionNameError,
    isFetching: isFetchingDivisionNames,
  } = useGetExamDivisionNameQuery(
    { ExamType: examType?.examType ?? null },
    { skip: !ExamID || !examType?.examType }
  );

  // --- Mutations ---
  const [postSetting, { isLoading: isCreating }] = useCreateExamDivisionNameResultMutation();
  const [updateSetting, { isLoading: isUpdating }] = useUpdateExamDivisionNameResultMutation();
  const [deleteSetting, { isLoading: isDeleting }] = useDeleteExamDivisionNameResultMutation();

  const settings = divisionSettingData?.data ?? [];

  // Selected exam-er setting ache kina (edit mode)
  const editData = useMemo(() => {
    if (!ExamID) return null;
    return settings.find((item) => String(item.ExamID) === String(ExamID)) ?? null;
  }, [ExamID, settings]);

  // Exam change / setting load hole division selection sync
  useEffect(() => {
    setSelectedDivisions(editData ? getDivisionIds(editData) : []);
  }, [editData]);

  // --- Derived UI state (stale cache theke chips jeno na ashe) ---
  const hasExam = Boolean(ExamID);
  const examTypeErrorMessage = hasExam ? getErrorMessage(examTypeError) : '';
  const divisionNameErrorMessage = hasExam ? getErrorMessage(divisionNameError) : '';
  const hasError = hasExam && Boolean(examTypeError || divisionNameError);
  const isLoadingDivisions = hasExam && (isFetchingExamType || isFetchingDivisionNames);

  const divisionOptions =
    hasExam && !hasError && examType?.examType ? examDivisionNameData ?? [] : [];

  // --- Handlers ---
  const toggleDivision = (divisionID) => {
    setSelectedDivisions((prev) =>
      prev.includes(divisionID)
        ? prev.filter((id) => id !== divisionID)
        : [...prev, divisionID]
    );
  };

  const resetForm = () => {
    reset({ ExamID: '' });
    setSelectedDivisions([]);
  };

  const handleEdit = (item) => {
    setValue('ExamID', item.ExamID, { shouldDirty: true });
    // বাকিটা editData + useEffect নিজে থেকে করবে
  };

  const handleDelete = async (item) => {
    const confirm = await Swal.fire({
      title: translate('Are you sure?'),
      text: `"${item.Exam?.ExamName ?? ''}" ${translate('setting will be deleted!')}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: translate('Yes, delete it!'),
      cancelButtonText: translate('Cancel'),
      width: '400px',
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteSetting(item.ID).unwrap();
      toast.success(translate('Deleted successfully'));

      // যেটা এডিট করছিল সেটাই ডিলিট হলে ফর্ম রিসেট
      if (String(item.ExamID) === String(ExamID)) resetForm();
    } catch (err) {
      toast.error(err?.data?.error || err?.data?.message || translate('Failed to delete setting'));
    }
  };

  const onSubmit = async (formData) => {
    if (selectedDivisions.length === 0) {
      toast.warning(translate('Please select at least one division.'));
      return;
    }

    const payload = { ExamID: formData.ExamID };
    for (let i = 1; i <= MAX_DIVISIONS; i++) {
      payload[`DivisionID${i}`] = selectedDivisions[i - 1] ?? null;
    }

    try {
      if (editData) {
        const confirm = await Swal.fire({
          title: translate('Are you sure?'),
          text: translate('You want to update this setting?'),
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: translate('Yes, update it!'),
          cancelButtonText: translate('Cancel'),
          width: '400px',
        });
        if (!confirm.isConfirmed) return;

        await updateSetting({ id: editData.ID, ...payload }).unwrap();
        toast.success(translate('Update successfully'));
      } else {
        await postSetting(payload).unwrap();
        toast.success(translate('Setting created successfully'));
        resetForm(); // ExamID + selected divisions reset; chips ar dekhabe na
      }
      // Modal close hobe na — list auto refresh hobe (invalidatesTags)
    } catch (err) {
      toast.error(
        err?.data?.error || err?.data?.message || translate('Failed to save setting')
      );
    }
  };

  const isBusy = isCreating || isUpdating;

  return (
    <div className="w-full p-4 space-y-8">
      {/* ================= FORM ================= */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DefaultSelect
            label={translate('Exam')}
            nameField="ExamName"
            registerKey="ExamID"
            valueField="ExamID"
            options={examNameData ?? []}
            require="This Field is required"
            unicode={true}
          />

          {/* Mode badge */}
          <div className="flex items-end">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${editData
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
            >
              <span className={`h-2 w-2 rounded-full ${editData ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              {editData ? translate('Edit Mode') : translate('New Setting')}
            </span>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h3 className="text-base font-semibold mb-4 text-gray-700 border-b pb-2">
              {translate(
                'Please do not select Fail, Suspended, or Absent divisions. Only select divisions for passed students to calculate the percentage.'
              )}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({translate('Selected')}: {selectedDivisions.length})
              </span>
            </h3>

            {/* 1) Exam select kora hoy nai */}
            {!hasExam && (
              <p className="text-gray-500 text-sm">
                {translate('Please select Exam to load divisions')}
              </p>
            )}

            {/* 2) Loading */}
            {hasExam && !hasError && isLoadingDivisions && (
              <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
                ))}
              </div>
            )}

            {/* 3) Error */}
            {hasError && (
              <ErrorAlert
                title={
                  examTypeError?.status === 404
                    ? translate('Exam conditions have not been configured for this exam yet. Please configure the exam conditions first.')
                    : translate('Failed to load divisions')
                }
                message={examTypeErrorMessage || divisionNameErrorMessage}
              />
            )}

            {/* 4) Division chips */}
            {hasExam && !hasError && !isLoadingDivisions && examType?.examType && (
              divisionOptions.length > 0 ? (
                <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {divisionOptions.map((division) => {
                    const isSelected = selectedDivisions.includes(division.ID);
                    return (
                      <button
                        key={division.ID}
                        type="button"
                        onClick={() => toggleDivision(division.ID)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium ${isSelected
                          ? 'bg-green-500 text-white border-green-500 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                          }`}
                      >
                        {division.DivisionNames}
                        {isSelected && <CheckIcon />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  {translate('No division found')}
                </p>
              )
            )}
          </div>

          {/* Buttons */}
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="secondary" onClick={() => hideModal()}>
              {translate('Cancel')}
            </Button>
            {(ExamID || selectedDivisions.length > 0) && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                {translate('Reset')}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isBusy || hasError || selectedDivisions.length === 0}
              loading={isBusy}
            >
              {editData ? translate('Update') : translate('Save')}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* ================= SAVED SETTINGS LIST ================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800">
            {translate('Saved Division Settings')}
          </h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {settings.length}
          </span>
        </div>

        {isFetchingSettings ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : settings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            {translate('No division setting found')}
          </div>
        ) : (
          <div className="space-y-3">
            {settings.map((item) => {
              // Division-er nam shorashori route theke ashe (item.Divisions)
              const divisions = item.Divisions ?? [];
              const isActive = editData?.ID === item.ID;

              return (
                <div
                  key={item.ID}
                  className={`rounded-xl border bg-white p-4 shadow-sm transition ${isActive
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.Exam?.ExamName || `Exam #${item.ExamID}`}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {divisions.length} {translate('divisions selected')}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {divisions.map((division) => (
                          <span
                            key={division.ID}
                            className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                          >
                            {division.DivisionNames}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        title={translate('Edit')}
                        onClick={() => handleEdit(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 active:scale-95"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        title={translate('Delete')}
                        disabled={isDeleting}
                        onClick={() => handleDelete(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100 active:scale-95 disabled:opacity-50"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDivisionSettingModal;