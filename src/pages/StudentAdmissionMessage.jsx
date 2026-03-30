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
import Button from '../components/Button/Button';
import StudentAdmissionMessageCreate from './StudentAdmissionMessageCreate';
import RadioOption from '../components/Radio/RadioOption';
import { useForm } from 'react-hook-form';
import { useDeleteAdmissionTimeMessageMutation, useGetAdmissionTimeMessageQuery } from '../features/student/studentQuerySlice';
import DeleteButton from '../components/Button/DeleteButton';
import Swal from 'sweetalert2';

const StudentAdmissionMessage = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const location = useLocation();
  const methods = useForm();

  const ClassType = methods.watch("ClassType");

  const { data: messageData, isLoading } = useGetAdmissionTimeMessageQuery();
  const [deleteAdmissionTimeMessage] = useDeleteAdmissionTimeMessageMutation()


  // ✅ Convert single object to array for table
  const studentData = messageData?.data || [];

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

  const handleDeleteOpenModal = async (id) => {
    const result = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "এই ডাটা ডিলিট করলে আর ফিরে পাওয়া যাবে না!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "হ্যাঁ, ডিলিট করুন",
      cancelButtonText: "না, বাতিল"
    });

    if (!result.isConfirmed) return;

    try {
      await deleteAdmissionTimeMessage(id).unwrap();

      Swal.fire({
        icon: "success",
        title: "ডিলিট হয়েছে!",
        text: "ডাটা সফলভাবে মুছে ফেলা হয়েছে।",
        timer: 1500,
        showConfirmButton: false
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ত্রুটি",
        text: error?.data?.error || "কিছু ভুল হয়েছে!"
      });
    }
  };

  const columns = [
    {
      title: translate('Action'),
      field: 'action',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.ATID)} />
          <DeleteButton onClick={() => handleDeleteOpenModal(row.ATID)} />
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
          <Countdown targetDate={row?.CreatedAt} />
        </div>
      ),
    },
    {
      title: translate('Class'),
      field: 'Class',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p>{row?.Class?.ClassName || '-'}</p>
        </div>
      ),
    },
    {
      title: translate('Session'),
      field: 'Session',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p>{row?.Session?.SessionName || '-'}</p>
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
            {row.Message3rdPart}
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
  const colorOptions = [
    { id: "1", label: "একক ক্লাস" },
    { id: "2", label: "সব ক্লাস" },
  ];
  return (
    <div className="font-SolaimanLipi bg-white p-6 rounded-xl shadow-xl">
      <div className="w-full overflow-x-auto">
        {/* Header */}
        <div className="border-b border-[#e9edf4] flex items-center flex-col sm:flex-row justify-between gap-4 mb-6">
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
          <fieldset className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full sm:max-w-[400px] mb-2">
            <legend className="text-gray-700 font-medium px-2 text-sm sm:text-base">
              নির্বাচন করুন
            </legend>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-2">
              {colorOptions.map((option) => (
                <RadioOption
                  key={option.id}
                  option={option}
                  register={methods.register}
                  name="ClassType"
                />
              ))}
            </div>
          </fieldset>
        </div>
        <div className="">
          <StudentAdmissionMessageCreate ClassType={ClassType} />
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
