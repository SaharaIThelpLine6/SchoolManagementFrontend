import { useEffect } from "react";
import { useGeAllReportsQuery, useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchResultFieldData } from "../../features/studentResultPublicView/studentResultPublicViewSlice";
import SortableTable from "../../components/Tables/SortableTable";
import Loading from "../../components/Loading/Loading";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";
// import { useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";

const StudentReports = () => {
  const { schoolid } = useParams()
  const dispatch = useDispatch()
  const translate = useTranslate()
  const {
    data: userDetails,
    isLoading: isuserDetailsLoading,
    isError: isuserDetailsError,
  } = useGetUserDetailsQuery();
  const {
    data: userReports,
    isLoading: isuserReportsLoading,
    isError: isuserReportsError,
  } = useGeAllReportsQuery();
  const { schoolData } = useSelector((state) => state.studentResultPublicView);
  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch]);
  useEffect(() => {
    console.log(schoolData);
  }, [schoolData])
  const columns = [
    {
      title: 'ক্র:নং',
      hozAlign: 'center',
      filterable: false,
      type: 'text',
      render: (_, index) => <p>{index + 1}</p>,
    },
    {
      title: 'রির্পোট ক্যাটাগরি',
      field: 'ReportTypeName',
      hozAlign: 'center',
      filterable: false,
      type: 'text',
      render: (row) => <p>{row?.ReportType?.ReportTypeName}</p>,
    },
    {
      title: 'রির্পোট টাইপ',
      field: 'ReportTypeName',
      hozAlign: 'center',
      filterable: false,
      type: 'text',
      render: (row) => <p>{row?.ReportType?.ReportTypeName}</p>,
    },
    {
      title: 'মন্তব্য',
      field: 'Remark',
      hozAlign: 'center',
      filterable: false,
      type: 'text',
      class: "w-[300px]"
    },
    {
      title: 'তারিখ',
      field: "CreateDate",
      hozAlign: 'center',
      filterable: false,
      type: 'text',
      render: (row) => <p>{bnBijoy2Unicode(row.CreateDate)}</p>,
    },
  ]


  return (

      <main className="mian_area pt-4 pb-[100px] min-h-screen">
        <div className="container mx-auto px-2">
          <div className="mt-5 overflow-x-auto">
            {isuserReportsLoading ? (
              <Loading />
            ) : isuserReportsError ? (
              <div className="text-red-500 text-center py-4">
                {translate("Failed to load exam fee settings. Please try again.")}
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
