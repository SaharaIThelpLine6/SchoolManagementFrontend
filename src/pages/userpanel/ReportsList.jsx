import Button from '../../components/Button/Button';
import SvgIcon from '../../components/icons/SvgIcon';
import Loading from '../../components/Loading/Loading';
import SortableTable from '../../components/Tables/SortableTable';
import { useGetStudentReportListQuery } from '../../features/userPanel/userInfo/userInfoQuerySlice';
import { showModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
// import { useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";

const ReportsList = () => {
  const translate = useTranslate();
  const queryParams = {};
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useGetStudentReportListQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });
  const reportsData = apiResponse?.data || [];
  // console.log(apiResponse, 'apiResponse');

  const handleStudentReport = (id) => {
    showModal('', 'STUDENT_COMPLAINT_REPORT', id);
  };
  const columns = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      filterable: false,
      type: 'text',
      render: (row) => (
        <Button onClick={() => handleStudentReport(row.SCID)}>
          <SvgIcon name={'FaEye'} />
        </Button>
      ),
    },
    {
      title: translate('ID'),
      field: 'SCID',
      hozAlign: 'center',
      sortable: true,
      onClick: () => handleSort('SCID'),
      render: (row, index) => <p key={index}>{`${row.SCID}`}</p>,
    },

    // {
    //   title: translate('Details'),
    //   field: 'ComplaintDetails',
    //   hozAlign: 'center',
    //   render: (row) => (
    //     <p className={` max-w-[250px] truncate mx-auto`}>
    //       {row.ComplaintDetails}
    //     </p>
    //   ),
    // },
    {
      title: translate('Status'),
      field: 'SeeUnSee',
      hozAlign: 'center',
      sortable: true,
      onClick: () => handleSort('SeeUnSee'),
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            Number(row.SeeUnSee) === 1
              ? 'bg-green-100 text-green-600'
              : Number(row.SeeUnSee) === 3
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-red-100 text-red-600'
          }`}
        >
          {Number(row.SeeUnSee) === 1
            ? translate('সমাধান')
            : Number(row.SeeUnSee) === 3
              ? translate('প্রক্রিয়াধীন')
              : translate('অপেক্ষমান')}
        </span>
      ),
    },
    {
      title: translate('Created At'),
      field: 'CreateAt',
      hozAlign: 'center',
      sortable: true,
      onClick: () => handleSort('CreateAt'),
      render: (row) => (
        <p>{new Date(row.CreateAt).toLocaleDateString('en-GB')}</p>
      ),
    },
  ];

  return (
    <main className="mian_area pt-4 pb-[100px] min-h-screen">
      <div className="container mx-auto px-2">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-4 border-gray-800 inline-block">
          অভিযোগ লিষ্ট
        </h2>
        <div className="overflow-x-auto">
          {isLoading ? (
            <Loading />
          ) : error ? (
            <div className="text-red-500 text-center py-4">
              {translate('Failed to load exam fee settings. Please try again.')}
            </div>
          ) : (
            <SortableTable
              columns={columns}
              data={reportsData}
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

export default ReportsList;
