import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import EditButton from '../components/Button/EditButton';
import Loading from '../components/Loading/Loading';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { useGetStudentAdmissionMessageQuery } from '../features/settings/settingsQuerySlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';
import Countdown from './userpanel/Countdown';

const StudentAdmissionMessage = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const location = useLocation();

  const { data: messageData, isLoading } = useGetStudentAdmissionMessageQuery();

  console.log(messageData, 'messageData');

  // ✅ Convert single object to array for table
  const studentData = messageData?.data ? [messageData.data] : [];

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(
        translate('Online Admission Message Update'),
        'ONLINE_ADMISSION_MESSAGE_UPDATE',
        id
      );
    },
    [translate]
  );

  const columns = [
    {
      title: translate('Action'),
      field: 'action',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.ID)} />
        </div>
      ),
    },
    // {
    //   title: translate('ID'),
    //   field: 'ID',
    //   hozAlign: 'center',
    //   render: (row) => <p>{row.ID}</p>,
    // },
    {
      title: translate('Admission Deadline Date'),
      field: 'Message3rdPart',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p>
            <Countdown targetDate={row?.Message3rdPart} />
          </p>
        </div>
      ),
    },
    {
      title: translate('Message 1st Part'),
      field: 'Message1stPart',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="max-w-[250px] truncate overflow-hidden whitespace-nowrap">
            {row.Message1stPart}
          </p>
        </div>
      ),
    },
    {
      title: translate('Message 2nd Part'),
      field: 'Message2ndPart',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="max-w-[250px] truncate overflow-hidden whitespace-nowrap">
            {row.Message2ndPart}
          </p>
        </div>
      ),
    },
    {
      title: translate('Message 3rd Part'),
      field: 'Message2ndPart',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="max-w-[250px] truncate overflow-hidden whitespace-nowrap">
            {row.Message4thPart}
          </p>
        </div>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  const tabs = [
    {
      name: translate('Online Admission'),
      path: '/parent-panel/online-admission',
    },
    {
      name: translate('Online Admission Message'),
      path: '/parent-panel/online-admission-message',
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-white p-6 rounded-xl shadow-xl">
      <div className="w-full overflow-x-auto">
        {/* Header */}
        <div className="border-b border-[#e9edf4] flex items-center justify-between px-5 py-5 mb-6">
          <div className="flex items-center gap-6">
            {tabs.map((tab, index) => {
              const isActive = location.pathname === tab.path;

              return (
                <Link
                  key={index}
                  to={tab.path}
                  className={`relative pb-2 text-[18px] font-bold transition-all duration-300 ${isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-blue-500'
                    }`}
                >
                  {tab.name}
                  {isActive && (
                    <span className="absolute left-0 -bottom-[6px] w-full h-[3px] bg-blue-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {studentData.length > 0 ? (
          <SortableTable
            columns={columns}
            data={studentData}
            isFilterColumn={false}
          />
        ) : (
          <p className="text-gray-500 text-center">
            {translate('No data found')}
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentAdmissionMessage;
