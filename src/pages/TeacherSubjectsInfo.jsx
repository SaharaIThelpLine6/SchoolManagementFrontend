import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageName } from '../features/auth/authSlice';
import Swal from 'sweetalert2';

import bnBijoy2Unicode from '../utils/conveter';
import useTranslate from '../utils/Translate';
import Button from '../components/Button/Button';

import Loading from '../components/Loading/Loading';
import SortableTable from '../components/Tables/SortableTable';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import {
  useDeleteTeacherSubjectMutation,
  useGetTeachersInfoQuery,
  useGetTeacherSubjectsQuery,
} from '../features/teachers/teachersSlice';
import { showModal } from '../utils/ModalControlar';
import { ViewPermission } from '../Routes/ViewPermission';
import { permissionsDataList } from '../Data/permissions';
import DeleteButton from '../components/Button/DeleteButton';
import { FormProvider, useForm } from 'react-hook-form';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/exam/examQuerySlice';
import DefaultSelect from '../components/Forms/DefaultSelect';

const PAGE_SIZE = 10;

const TeacherSubjectsInfo = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const methods = useForm({
    defaultValues: {
      SessionID: '',
      ExamID: '',
      SubClassID: '',
      TeacherID: '',
    },
  });
  const { watch, reset } = methods;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  // Watch filter values
  const filterSessionID = watch('SessionID');
  const filterExamID = watch('ExamID');
  const filterSubClassID = watch('SubClassID');
  const filterTeacherID = watch('TeacherID');

  // =========================
  // QUERIES
  // =========================
  const {
    data: teacherSubjects = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTeacherSubjectsQuery();

  const [deleteTeacherSubject, { isLoading: isDeleting }] =
    useDeleteTeacherSubjectMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: teachers = [] } = useGetTeachersInfoQuery();

  // =========================
  // NORMALIZE DATA
  // =========================
  const list = useMemo(() => {
    if (Array.isArray(teacherSubjects)) return teacherSubjects;
    if (Array.isArray(teacherSubjects?.data)) return teacherSubjects.data;
    return [];
  }, [teacherSubjects]);

  // =========================
  // FILTERED LIST
  // =========================
  const filteredList = useMemo(() => {
    return list.filter((row) => {
      if (filterSessionID && Number(row.SessionID) !== Number(filterSessionID))
        return false;
      if (filterExamID && Number(row.ExamID) !== Number(filterExamID))
        return false;
      if (filterSubClassID && Number(row.SubClassID) !== Number(filterSubClassID))
        return false;
      if (filterTeacherID && Number(row.TeacherID) !== Number(filterTeacherID))
        return false;
      return true;
    });
  }, [list, filterSessionID, filterExamID, filterSubClassID, filterTeacherID]);

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  // =========================
  // PAGE TITLE
  // =========================
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Reset page if list shrinks
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [filterSessionID, filterExamID, filterSubClassID, filterTeacherID]);

  // Clear selection if page changes
  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage]);

  // =========================
  // HANDLERS
  // =========================
  const handleTeacherAssign = () => {
    showModal('শিক্ষক বিষয় বরাদ্দ', 'HANDLE_RESULT_ENTRY_ASSIGN', {
      closeOnOutSide: false,
    });
  };

  const handleClearFilters = () => {
    reset({
      SessionID: '',
      ExamID: '',
      SubClassID: '',
      TeacherID: '',
    });
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // =========================
  // SINGLE DELETE
  // =========================
  const handleSingleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই রেকর্ডটি মুছে ফেলা হবে!',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#d33',
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await deleteTeacherSubject([id]).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: res?.message || 'সফলভাবে মুছে ফেলা হয়েছে।',
        timer: 1500,
        showConfirmButton: false,
      });

      setSelectedIds((prev) => prev.filter((x) => x !== id));
      await refetch();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text:
          err?.data?.error ||
          err?.data?.message ||
          'মুছে ফেলতে ব্যর্থ হয়েছে।',
      });
    }
  };

  // =========================
  // BULK DELETE
  // =========================
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirm = await Swal.fire({
      icon: 'warning',
      title: `আপনি কি ${selectedIds.length}টি রেকর্ড মুছতে চান?`,
      text: 'এই কাজটি undo করা যাবে না!',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, সব মুছুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#d33',
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await deleteTeacherSubject(selectedIds).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: res?.message || 'সফলভাবে মুছে ফেলা হয়েছে।',
        timer: 1500,
        showConfirmButton: false,
      });

      setSelectedIds([]);
      await refetch();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text:
          err?.data?.error ||
          err?.data?.message ||
          'মুছে ফেলতে ব্যর্থ হয়েছে।',
      });
    }
  };

  // =========================
  // CHECKBOX HANDLERS
  // =========================
  const isRowSelected = (id) => selectedIds.includes(id);

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllOnPage = () => {
    const pageIds = paginatedData.map((r) => r.ID);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const newSet = new Set([...prev, ...pageIds]);
        return Array.from(newSet);
      });
    }
  };

  const isAllOnPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((r) => selectedIds.includes(r.ID));

  const hasActiveFilter =
    filterSessionID || filterExamID || filterSubClassID || filterTeacherID;

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    {
      title: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isAllOnPageSelected}
            onChange={toggleAllOnPage}
            className="w-4 h-4 accent-green-600 cursor-pointer"
          />
        </div>
      ),
      field: 'checkbox',
      hozAlign: 'center',
      width: 50,
      render: (row) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isRowSelected(row.ID)}
            onChange={() => toggleRow(row.ID)}
            className="w-4 h-4 accent-green-600 cursor-pointer"
          />
        </div>
      ),
    },
    {
      title: translate('ID'),
      field: 'ID',
      hozAlign: 'center',
      width: 60,
    },
    {
      title: translate('Teacher'),
      field: 'TeacherName',
      hozAlign: 'left',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            {row.TeacherName?.charAt(0) || '?'}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-800 text-sm">
              {bnBijoy2Unicode(row.TeacherName)}
            </span>
            <span className="text-[11px] text-gray-500">
              {row.TeacherCode} • {row.TeacherMobile}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: translate('Class/Jamaat'),
      field: 'SubClass',
      hozAlign: 'center',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          {bnBijoy2Unicode(row.SubClass)}
        </span>
      ),
    },
    {
      title: translate('Subject'),
      field: 'SubjectName',
      hozAlign: 'center',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {bnBijoy2Unicode(row.SubjectName)}
        </span>
      ),
    },
    {
      title: translate('Session'),
      field: 'SessionName',
      hozAlign: 'center',
      render: (row) => (
        <span className="text-xs text-gray-600">
          {bnBijoy2Unicode(row.SessionName || '-')}
        </span>
      ),
    },
    {
      title: translate('Exam'),
      field: 'ExamName',
      hozAlign: 'center',
      render: (row) => (
        <span className="text-xs text-gray-600">
          {bnBijoy2Unicode(row.ExamName || '-')}
        </span>
      ),
    },
    {
      title: translate('Created At'),
      field: 'CreateAt',
      hozAlign: 'center',
      render: (row) => {
        if (!row.CreateAt) return '-';
        const d = new Date(row.CreateAt);
        return (
          <span className="text-xs text-gray-500">
            {d.toLocaleDateString('en-GB')}
          </span>
        );
      },
    },
    {
      title: translate('Action'),
      hozAlign: 'center',
      width: 80,
      render: (row) => (
        <div className="flex justify-center items-center">
          <ViewPermission
            permissionId={permissionsDataList.result_entry}
            permissionType="edit"
            empty={true}
          >
            <DeleteButton
              disabled={isDeleting}
              onClick={() => handleSingleDelete(row?.ID)}
            />
          </ViewPermission>
        </div>
      ),
    },
  ];

  // =========================
  // RENDER
  // =========================
  return (
    <div className="font-SolaimanLipi bg-white rounded-xl shadow-lg overflow-hidden">
      {/* ============================= */}
      {/* TOP HEADER: TITLE + DELETE + ADD */}
      {/* ============================= */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-green-100 px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-[20px] font-bold text-gray-800">
                শিক্ষক-বিষয় গ্রুপ
              </h3>
              <p className="text-xs text-gray-500">
                মোট {filteredList.length} টি রেকর্ড
                {hasActiveFilter && ` (${list.length} থেকে ফিল্টার করা)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleTeacherAssign}>
              <span className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                শিক্ষক বিষয় বরাদ্দ
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* FILTER SECTION */}
      {/* ============================= */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100">
        <FormProvider {...methods}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <DefaultSelect
              label={translate('Session') + ':'}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
            <DefaultSelect
              label={translate('Exam Name') + ':'}
              options={examNameData ?? []}
              valueField="ExamID"
              nameField="ExamName"
              registerKey="ExamID"
            />
            <DefaultSelect
              label={translate('Class/Jamaat') + ':'}
              options={subClassListData ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
            />
            <DefaultSelect
              label={translate('Teacher') + ':'}
              registerKey="TeacherID"
              options={teachers ?? []}
              valueField="UserID"
              nameField="UserName"
            />

            {/* CLEAR FILTER BUTTON */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!hasActiveFilter}
                className={`w-full h-[42px] inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium border transition-colors ${hasActiveFilter
                  ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
                ফিল্টার মুছুন
              </button>
            </div>
          </div>
        </FormProvider>
      </div>

      {/* ============================= */}
      {/* BULK ACTION BAR */}
      {/* ============================= */}
      {selectedIds.length > 0 && (
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-red-50 via-white to-red-50 border-b border-red-100">
          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* LEFT: Selected Info */}
            <div className="flex items-center gap-3">
              {/* Indicator */}
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={19}
                  height={19}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                  {selectedIds.length}টি আইটেম নির্বাচিত
                </span>

                <span className="text-xs text-gray-500">
                  নির্বাচিত আইটেমের উপর অ্যাকশন নিন
                </span>
              </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-2">

              {/* Cancel Selection */}
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="
            inline-flex items-center gap-1.5
            px-3 py-2
            rounded-lg
            border border-gray-200
            bg-white
            text-gray-600
            text-xs sm:text-sm
            font-medium
            hover:bg-gray-50
            hover:text-gray-800
            transition-all
          "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={15}
                  height={15}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>

                <span className="hidden sm:inline">
                  বাতিল
                </span>
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                title={`${selectedIds.length}টি মুছুন`}
                className="
            inline-flex items-center gap-2
            px-3 sm:px-4 py-2
            rounded-lg
            bg-red-500
            hover:bg-red-600
            active:bg-red-700
            text-white
            text-xs sm:text-sm
            font-semibold
            shadow-sm
            hover:shadow-md
            disabled:opacity-60
            disabled:cursor-not-allowed
            transition-all
          "
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        strokeOpacity="0.25"
                      />
                      <path d="M21 12a9 9 0 0 1-9 9" />
                    </svg>

                    মুছছে...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 7h16" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2L19 7" />
                      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                    </svg>

                    মুছে ফেলুন

                    {/* Count */}
                    <span className="flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-white/20 text-[10px]">
                      {selectedIds.length}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================= */}
      {/* TABLE */}
      {/* ============================= */}
      <div className="p-4 sm:p-6">
        {isLoading || isFetching ? (
          <Loading />
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            {translate('Failed to load teacher subjects. Please try again.')}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </div>
            <p className="font-medium">
              {hasActiveFilter
                ? 'ফিল্টার অনুযায়ী কোনো ডেটা পাওয়া যায়নি'
                : translate('No teacher subjects found.')}
            </p>
            {hasActiveFilter && (
              <button
                onClick={handleClearFilters}
                className="mt-2 text-sm text-green-600 hover:text-green-800 underline"
              >
                ফিল্টার মুছে আবার চেষ্টা করুন
              </button>
            )}
          </div>
        ) : (
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />
        )}
      </div>

      {/* ============================= */}
      {/* PAGINATION */}
      {/* ============================= */}
      {filteredList.length > 0 && (
        <div className="px-4 sm:px-6 pb-4">
          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default TeacherSubjectsInfo;