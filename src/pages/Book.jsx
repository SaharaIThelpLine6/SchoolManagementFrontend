import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { renderToStaticMarkup } from 'react-dom/server';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DefaultSelect from '../components/Forms/DefaultSelect';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import BookListPDF from '../view/students/book/BookListPDF';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import {
  useDeleteAcademicSubjectMutation,
  useGetAcademicSubjectsQuery,
  useGetSubClassListQuery,
} from '../features/class/classQuerySlice';
import { useGetInstitutionInfoQuery } from '../features/settings/settingsQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

// ============================================================
// 🔹 Print window: A4 Portrait / Landscape
// ============================================================
const openPrintWindow = (innerHTML, orientation = 'portrait') => {
  const win = window.open('', '_blank', 'width=1200,height=900');
  if (!win) {
    Swal.fire({
      icon: 'warning',
      title: 'Popup blocked',
      text: 'Please allow popups for this site and try again.',
    });
    return;
  }

  win.document.open();
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Print</title>
        <style>
          @page {
            size: A4 ${orientation};
            margin: 10mm;
          }
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color: #000;
            background: #fff;
          }
          table { border-collapse: collapse; }
          thead { display: table-header-group; }
          tr, img { page-break-inside: avoid; break-inside: avoid; }
        </style>
      </head>
      <body>${innerHTML}</body>
    </html>
  `);
  win.document.close();

  // সব image load হওয়ার পর print
  const trigger = () => {
    try {
      win.focus();
      win.print();
      setTimeout(() => win.close(), 500);
    } catch (e) {
      // ignore
    }
  };

  const waitForImages = () => {
    const imgs = Array.from(win.document.images || []);
    if (imgs.length === 0) return setTimeout(trigger, 300);

    Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            img.onload = resolve;
            img.onerror = resolve;
          })
      )
    ).then(() => setTimeout(trigger, 300));
  };

  if (win.document.readyState === 'complete') {
    waitForImages();
  } else {
    win.onload = waitForImages;
  }
};

// ============================================================
// 🔹 Book Component
// ============================================================
const Book = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const method = useForm();
  const { watch } = method;
  const translate = useTranslate();
  const selectedSubClassID = watch('SubClassID');

  const {
    data: academicSubjectData = [],
    isError,
    isLoading,
  } = useGetAcademicSubjectsQuery(selectedSubClassID);

  const { data: subClassData = [] } = useGetSubClassListQuery();

  // 🔹 Institution info (print header/footer এর জন্য)
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const [deleteSubject] = useDeleteAcademicSubjectMutation();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // ফিল্টার বদলালে প্রথম পেজে ফিরে যাও
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubClassID]);

  const currentData = academicSubjectData || [];
  const totalPages = Math.ceil(currentData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return currentData.slice(start, start + PAGE_SIZE);
  }, [currentData, currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal(translate('Add Book'), 'ADD_BOOK');
  }, [translate]);

  const handleEditSubject = useCallback(
    (id) => {
      showModal(translate('Update Book'), 'UPDATE_BOOK', id);
    },
    [translate]
  );

  const handleDeleteSubject = useCallback(
    (id) => {
      Swal.fire({
        title: translate('Are you sure?'),
        text: translate("You won't be able to revert this!"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: translate('Yes, delete it!'),
        cancelButtonText: translate('Cancel'),
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteSubject(id).unwrap();

            Swal.fire({
              title: translate('Deleted!'),
              text: translate('The subject has been deleted.'),
              icon: 'success',
            });
          } catch (error) {
            console.error('Delete failed:', error);
            Swal.fire({
              title: translate('Error'),
              text:
                error.data?.message || translate('Failed to delete subject'),
              icon: 'error',
            });
          }
        }
      });
    },
    [translate, deleteSubject]
  );

  // ============================================================
  // 🔹 PRINT: orientation select → render → print
  // ============================================================
  const handlePrint = async () => {
    if (!currentData.length) {
      Swal.fire({
        icon: 'info',
        title: translate('No data'),
        text: translate('There is no book to print.'),
      });
      return;
    }

    // 1) Orientation select
    const { value: orientation } = await Swal.fire({
      title: translate('Select Print Orientation'),
      input: 'radio',
      inputOptions: {
        portrait: translate('Portrait (উল্লম্ব)'),
        landscape: translate('Landscape (আড়াআড়ি)'),
      },
      inputValue: 'portrait',
      showCancelButton: true,
      confirmButtonText: translate('Print'),
      cancelButtonText: translate('Cancel'),
      inputValidator: (v) =>
        !v ? translate('Please select an orientation') : null,
    });
    if (!orientation) return;

    // ফিল্টার করা ক্লাসের নাম (শিরোনামে দেখানোর জন্য)
    const selectedSubClass = (subClassData || []).find(
      (s) => String(s.SubClassID) === String(selectedSubClassID)
    );
    const classTitle = selectedSubClass?.SubClass
      ? String(selectedSubClass.SubClass).trim()
      : '';

    // 2) Render → static HTML
    const html = renderToStaticMarkup(
      <BookListPDF
        data={currentData}
        orientation={orientation}
        institution={institutionInfo}
        classTitle={classTitle}
      />
    );

    // 3) Print
    openPrintWindow(html, orientation);
  };

  const columnsDistribution = [
    {
      title: translate('Subject ID'),
      field: 'SubjectID',
      hozAlign: 'center',
      width: 120,
      sorter: 'number',
    },
    {
      title: translate('Subject Name'),
      field: 'SubjectName',
      hozAlign: 'center',
      width: 200,
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{data.SubjectName}</p>
        </div>
      ),
      sorter: 'string',
    },
    {
      title: translate('Marhala/Class'),
      field: 'SubClass',
      hozAlign: 'center',
      width: 200,
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{data?.ClassGroup?.SubClass}</p>
        </div>
      ),
    },
    {
      title: translate('English Name'),
      field: 'EngSubjectName',
      hozAlign: 'center',
      width: 200,
      sorter: 'string',
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{data.EngSubjectName || '-'}</p>
        </div>
      ),
    },
    {
      title: translate('Arabic Name'),
      field: 'ArabicSubject',
      hozAlign: 'right',
      width: 200,
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{data.ArabicSubject || '-'}</p>
        </div>
      ),
    },
    {
      title: translate('Class Group'),
      field: 'SubClassID',
      hozAlign: 'center',
      width: 150,
      sorter: 'number',
      formatter: (cell) => {
        return `Group ${cell.getValue()}`;
      },
    },
    {
      title: translate('Serial'),
      field: 'SubSerial',
      hozAlign: 'center',
      width: 100,
      sorter: 'number',
    },
    {
      title: translate('Created At'),
      field: 'CreateAt',
      hozAlign: 'center',
      width: 180,
      sorter: 'date',
      render: (row) => {
        return new Date(row.CreateAt).toLocaleDateString('en-GB');
      },
    },
    {
      title: translate('Updated At'),
      field: 'UpdateAt',
      hozAlign: 'center',
      width: 180,
      sorter: 'date',
      render: (row) => {
        const date = row.UpdateAt ? new Date(row.UpdateAt) : null;
        return date && !isNaN(date) ? date.toLocaleDateString('en-GB') : '-';
      },
    },
    {
      title: translate('Action'),
      hozAlign: 'center',
      width: 120,
      headerSort: false,
      render: (data) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.kitab_entry}
            permissionType="edit"
            empty={true}
          >
            <button
              className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              title="Edit"
              onClick={() => handleEditSubject(data.SubjectID)}
            >
              <SvgIcon name={'FiEdit'} size={20} />
            </button>
          </ViewPermission>
          <ViewPermission
            permissionId={permissionsDataList.kitab_entry}
            permissionType="delete"
            empty={true}
          >
            <button
              className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
              title="Delete"
              onClick={() => handleDeleteSubject(data.SubjectID)}
            >
              <SvgIcon name={'FaTrash'} size={20} />
            </button>
          </ViewPermission>
        </div>
      ),
    },
  ];

  if (isLoading) return <Loading />;
  if (isError) return <div>{translate('Error loading data')}</div>;

  return (
    <FormProvider {...method}>
      <div className="font-default bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="block w-full overflow-x-auto">
          <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
            <h3 className="font-default text-base sm:text-[20px] font-bold">
              {translate('Book List')}
            </h3>

            <div className="flex items-center gap-3">
              {/* 🔹 Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
              >
                <SvgIcon name="TbPrinter" size={16} />
              </button>

              {/* Create new */}
              <ViewPermission
                permissionId={permissionsDataList.kitab_entry}
                permissionType="insert"
              >
                <Button
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2"
                >
                  <SvgIcon name="FaPlus" size={16} />
                  {translate('Create new')}
                </Button>
              </ViewPermission>
            </div>
          </div>

          {/* Filter Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center w-full">
              <DefaultSelect
                options={subClassData || []}
                require={'Sub Class is required'}
                nameField={'SubClass'}
                valueField={'SubClassID'}
                registerKey={'SubClassID'}
                type={'number'}
                label={translate('Sub Class')}
                unicode={true}
              />
            </div>
          </div>

          {currentData.length > 0 ? (
            <>
              <SortableTable
                columns={columnsDistribution}
                data={paginatedData}
                isFilterColumn={false}
              />

              <DefaultPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-8">
              {translate('No data available')}
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default Book;