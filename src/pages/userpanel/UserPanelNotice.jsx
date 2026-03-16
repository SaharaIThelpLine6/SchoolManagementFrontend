import { useSelector } from "react-redux";
import Button from "../../components/Button/Button";
import SvgIcon from "../../components/icons/SvgIcon";
import Loading from "../../components/Loading/Loading";
import SortableTable from "../../components/Tables/SortableTable";
import { useGetNoticesForUserPanelQuery, useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";
import useTranslate from "../../utils/Translate";
import { useCallback } from "react";
import { showModal } from "../../utils/ModalControlar";

const UserPanelNotice = () => {
  const translate = useTranslate();
  const currentSession = useSelector(
    (state) => state.sessionChange.currentSession
  );

  const {
    data: userDetails,
    isError: isuserDetailsError,
  } = useGetUserDetailsQuery(currentSession);
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useGetNoticesForUserPanelQuery({
    UserCode: userDetails?.UserCode,
    // DateFrom: "2026-03-01",
    // DateTo: "2026-03-07",
  }, {
    refetchOnMountOrArgChange: true,
  });

  const reportsData = apiResponse?.data || [];


  const handleViewNotice = (id) => {
    if (!id) return;
    showModal("Notice View", "VIEW_NOTICE_USERPANEL", id);
  };

  const columns = [
    {
      title: translate('Action'),
      field: 'Action',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewNotice(row?.UNID)}
            className="text-blue-600 hover:text-blue-800"
            title="View"
          >
            <SvgIcon name={'FaEye'} size={20} />
          </button>
        </div>
      ),
    },
    {
      title: translate("ID"),
      field: "UNID",
      hozAlign: "center",
      sortable: true,
      render: (row, index) => <p>{index + 1}</p>,
    },
    {
      title: translate("Notice"),
      field: "NoticeMessage",
      hozAlign: "center",
      render: (row) => (
        <p className="max-w-[75px] truncate mx-auto">
          {row.NoticeMessage}
        </p>
      ),
    },
    {
      title: translate("Created At"),
      field: "CreatedAt",
      hozAlign: "center",
      sortable: true,
      render: (row) => (
        <p>{new Date(row.CreatedAt).toLocaleDateString("en-GB")}</p>
      ),
    },
  ];

  return (
    <main className="mian_area pt-4 pb-[100px] min-h-screen">
      <div className="container mx-auto px-2">

        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-4 border-gray-800 inline-block">
          {translate("নোটিশ লিস্ট")}
        </h2>

        <div className="overflow-x-auto">
          {isLoading ? (
            <Loading />
          ) : error ? (
            <div className="text-red-500 text-center py-4">
              {translate("Failed to load notice data. Please try again.")}
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

export default UserPanelNotice;

