import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { renderToStaticMarkup } from 'react-dom/server';

import Button from '../components/Button/Button';
import EditButton from '../components/Button/EditButton';
import DeleteButton from '../components/Button/DeleteButton';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import ClassListPDF from '../view/class/ClassListPDF';

import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import {
  useGetClassListQuery,
  useDeleteClassMutation,
} from '../features/class/classQuerySlice';
import { useGetInstitutionInfoQuery } from '../features/settings/settingsQuerySlice';

import { ViewPermission } from '../Routes/ViewPermission';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';
import SvgIcon from '../components/icons/SvgIcon';

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
// 🔹 Class Component
// ============================================================
const Class = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  // 🔹 Fetch Classes
  const {
    data: classes = [],
    isLoading,
    isError,
    refetch,
  } = useGetClassListQuery();

  // 🔹 Institution info (print header/footer এর জন্য)
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  // 🔹 Delete Mutation
  const [deleteClass] = useDeleteClassMutation();

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(classes.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return classes.slice(start, start + PAGE_SIZE);
  }, [classes, currentPage]);

  // 🔹 Set Page Name
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // 🔹 Create Modal
  const handleCreateOpenForm = useCallback(() => {
    showModal(translate('Class Create'), 'CLASS_CREATE_FORM');
  }, [translate]);

  // 🔹 Edit Modal
  const handleEditOpenForm = useCallback(
    (id) => {
      showModal(translate('Class Update'), 'CLASS_EDIT_FORM', id);
    },
    [translate]
  );

  // 🔹 Delete Class
  const handleDeleteOpenForm = async (id) => {
    const result = await Swal.fire({
      title: translate('Are you sure?'),
      text: translate('You want to delete this class?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: translate('Yes, delete it!'),
      cancelButtonText: translate('Cancel'),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteClass(id).unwrap();
      await Swal.fire({
        icon: 'success',
        title: translate('Deleted successfully'),
        timer: 1500,
        showConfirmButton: false,
      });
      refetch();
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: translate('Error'),
        text:
          err?.data?.message ||
          err?.error ||
          translate('Failed to delete class'),
      });
    }
  };

  // ============================================================
  // 🔹 PRINT: orientation select → render → print
  // ============================================================
  const handlePrint = async () => {
    if (!classes.length) {
      Swal.fire({
        icon: 'info',
        title: translate('No data'),
        text: translate('There is no class to print.'),
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

    // 2) Render → static HTML
    const html = renderToStaticMarkup(
      <ClassListPDF
        data={classes}
        orientation={orientation}
        institution={institutionInfo}
      />
    );

    // 3) Print
    openPrintWindow(html, orientation);
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <p className="text-red-500">{translate('Failed to load classes')}</p>
    );

  const columns = [
    {
      title: translate('Serial'),
      field: 'Serial',
      hozAlign: 'center',
      render: (row) => <p>{row.Serial}</p>,
    },
    {
      title: translate('Class'),
      field: 'ClassName',
      hozAlign: 'center',
      render: (row) => <p>{row.ClassName}</p>,
    },
    {
      title: translate('English'),
      field: 'EnglishClass',
      hozAlign: 'center',
      render: (row) => <p>{row.EnglishClass || row.EnglishName || ''}</p>,
    },
    {
      title: translate('Arabic'),
      field: 'ArabicClass',
      hozAlign: 'center',
      render: (row) => <p>{row.ArabicClass}</p>,
    },
    {
      title: translate('Action'),
      field: 'ClassID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center gap-3 items-center">
          <ViewPermission
            permissionId={permissionsDataList.class}
            permissionType="edit"
            empty={true}
          >
            <EditButton onClick={() => handleEditOpenForm(row.ClassID)} />
          </ViewPermission>

          <ViewPermission
            permissionId={permissionsDataList.class}
            permissionType="delete"
            empty={true}
          >
            <DeleteButton onClick={() => handleDeleteOpenForm(row.ClassID)} />
          </ViewPermission>
        </div>
      ),
    },
  ];

  return (
    <div className="font-default bg-white p-6 md:p-4 rounded-xl shadow-lg">
      {/* Header */}
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
        <h3 className="font-default text-[20px] font-bold">
          {translate('Class Lists')}
        </h3>

        <div className="flex items-center gap-3">
          {/* 🔹 Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
          >
            <SvgIcon name="TbPrinter" size={16} />
            {/* {translate('Print')} */}
          </button>

          {/* Create new */}
          <ViewPermission
            permissionId={permissionsDataList.class}
            permissionType="insert"
          >
            <Button
              onClick={handleCreateOpenForm}
              className="flex items-center gap-2"
            >
              <SvgIcon name="FaPlus" size={16} />
              {translate('Create new')}
            </Button>
          </ViewPermission>
        </div>
      </div>

      {/* Table */}
      <SortableTable
        columns={columns}
        data={paginatedData}
        isFilterColumn={false}
      />

      {/* Pagination */}
      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Class;