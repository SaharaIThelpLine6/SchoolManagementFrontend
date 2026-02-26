import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Loading from '../../components/Loading/Loading';
import SortableTable from '../../components/Tables/SortableTable';
import SvgIcon from '../../components/icons/SvgIcon';
import { fetchResultFieldData } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import {
  useGeAllReportsQuery,
  useGetUserDetailsQuery,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
import { showModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import bnBijoy2Unicode from '../../utils/conveter';
import { formatToDDMMYYYY } from '../../utils/dateFormat';
// import { useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";

const StudentReports = () => {
  const { schoolid } = useParams();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const {
    data: userDetails,
    isLoading: isuserDetailsLoading,
    isError: isuserDetailsError,
  } = useGetUserDetailsQuery({ refetchOnMountOrArgChange: true });
  const {
    data: userReports,
    isLoading: isuserReportsLoading,
    isError: isuserReportsError,
  } = useGeAllReportsQuery({ refetchOnMountOrArgChange: true });
  const { schoolData } = useSelector((state) => state.studentResultPublicView);
  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch]);
  useEffect(() => {
    console.log(schoolData);
  }, [schoolData]);

  const handleStudentReport = (id) => {
    showModal('', 'MOBILE_PANEL_STUDENT_REPORT', id);
  };
  const columns = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      filterable: false,
      type: 'text',
      render: (row) => (
        <Button onClick={() => handleStudentReport(row.SRID)}>
          <SvgIcon name={'FaEye'} />
        </Button>
      ),
    },
    {
      title: 'ক্র:নং',
      hozAlign: 'center',
      filterable: false,
      type: 'text',
      render: (row) => <p>{row.SRID}</p>,
    },
    // {
    //   title: 'রির্পোট ক্যাটাগরি',
    //   field: 'ReportTypeName',
    //   hozAlign: 'center',
    //   filterable: false,
    //   type: 'text',
    //   render: (row) => <p>{row?.ReportType?.ReportTypeName}</p>,
    // },
    // {
    //   title: 'রির্পোট টাইপ',
    //   field: 'ReportTypeName',
    //   hozAlign: 'center',
    //   filterable: false,
    //   type: 'text',
    //   render: (row) => <p>{row?.ReportType?.ReportTypeName}</p>,
    // },
    {
      title: 'মন্তব্য',
      field: 'Remark',
      hozAlign: 'center',
      filterable: false,
      type: 'text',
      render: (row) => {
        const text = row?.Remark ? bnBijoy2Unicode(row.Remark) : '';

        const shortText = text.length > 12 ? text.slice(0, 12) + '...' : text;

        return (
          <p
            className="whitespace-nowrap overflow-hidden text-ellipsis text-center"
            title={text} // hover করলে full text দেখাবে
          >
            {shortText || '—'}
          </p>
        );
      },
    },

    {
      title: 'তারিখ',
      field: 'CreateDate',
      hozAlign: 'center',
      filterable: false,
      type: 'text',
      render: (row) => (
        <p>{bnBijoy2Unicode(formatToDDMMYYYY(row.CreateDate))}</p>
      ),
    },
  ];

  return (
    <main className="mian_area pt-4 pb-[100px] min-h-screen">
      <div className="container mx-auto px-2">
        <div className="mt-5 overflow-x-auto">
          {isuserReportsLoading ? (
            <Loading />
          ) : isuserReportsError ? (
            <div className="text-red-500 text-center py-4">
              {translate('Failed to load exam fee settings. Please try again.')}
            </div>
          ) : (
            <SortableTable
              columns={columns}
              data={userReports}
              isFilterColumn={false}
              rowWrap={false}
              tdclass="w-[300px]"
            />
          )}
        </div>
      </div>
    </main>
  );
};
export default StudentReports;
