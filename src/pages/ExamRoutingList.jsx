import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { FaPlus, FaPrint } from 'react-icons/fa';
import Swal from 'sweetalert2';
import EditButton from '../components/Button/EditButton';
import DeleteButton from '../components/Button/DeleteButton';
import { setPageName } from '../features/auth/authSlice';
import {
  useDeleteExamRoutineMutation,
  useGetAllExamRoutineListQuery,
  useGetExamNamesQuery,
} from '../features/exam/examQuerySlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import useTranslate from '../utils/Translate';
import ExamRoutinePrint from './ExamRoutinePrint';
import { showModal } from '../utils/ModalControlar';

const getSubClassID = (routing) =>
  routing.SubClassID ?? routing.classGroup?.SubClassID;

const toPrintItem = (routing) => ({
  sessionID: routing.SessionID,
  examID: routing.ExamID,
  subClassID: getSubClassID(routing),
});

// Same Session + Exam + Class should be printed only once.
const toUniquePrintItems = (list) => {
  const seen = new Set();
  return list.reduce((items, routing) => {
    const item = toPrintItem(routing);
    const key = `${item.sessionID}-${item.examID}-${item.subClassID}`;
    if (!seen.has(key)) {
      seen.add(key);
      items.push(item);
    }
    return items;
  }, []);
};

const ExamRoutingList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [sessionFilter, setSessionFilter] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [subClassFilter, setSubClassFilter] = useState('');
  // Array of { sessionID, examID, subClassID } that will be printed
  const [printItems, setPrintItems] = useState(null);
  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: exams = [] } = useGetExamNamesQuery();
  const { data: subClasses = [] } = useGetSubClassListQuery();
  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useGetAllExamRoutineListQuery();
  const [deleteExamRoutine] = useDeleteExamRoutineMutation();
  const routingData = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  const filteredRoutingData = routingData.filter((routing) => {
    const routingSubClassID = getSubClassID(routing);
    return (
      (!sessionFilter || String(routing.SessionID) === sessionFilter) &&
      (!examFilter || String(routing.ExamID) === examFilter) &&
      (!subClassFilter || String(routingSubClassID) === subClassFilter)
    );
  });
  const printAllCount = toUniquePrintItems(filteredRoutingData).length;

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const handleEdit = (routing) => {
    showModal(
      'পরীক্ষার রুটিন আপডেট করুন',
      'EXAM_ROUTINE_UPDATE',
      null,
      {
        closeOnOutSide: false,
        meta: {
          sessionID: routing.SessionID,
          examID: routing.ExamID,
          subClassID: getSubClassID(routing),
        },
      }
    );
  };

  const handleExamRoutineCreate = () => {
    showModal('পরীক্ষার রুটিন তৈরি করুন', 'EXAM_ROUTINE_CREATE', {
      closeOnOutSide: false,
    });
  };

  // Top button: print every routine that matches the current filters
  const handlePrintAll = () => {
    const items = toUniquePrintItems(filteredRoutingData);
    if (items.length > 0) setPrintItems(items);
  };

  // Row button: print only this routine
  const handlePrintSingle = (routing) => {
    setPrintItems([toPrintItem(routing)]);
  };

  const handleDelete = async (routing) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'একবার মুছে ফেলা হলে পুনরুদ্ধার করা যাবে না!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await deleteExamRoutine({
        sessionID: routing.SessionID,
        examID: routing.ExamID,
        subClassID: getSubClassID(routing),
      }).unwrap();
      await Swal.fire({
        icon: 'success',
        title: 'সফলভাবে মুছে ফেলা হয়েছে',
        text: response?.message || 'রুটিন সফলভাবে মুছে ফেলা হয়েছে।',
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'ত্রুটি ঘটেছে!',
        text:
          error?.data?.message ||
          error?.data?.error ||
          'রুটিন মুছে ফেলতে ব্যর্থ হয়েছে।',
      });
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-lg md:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-[#e9edf4] pb-4">
        <h2 className="text-lg font-bold md:text-xl">
          {translate('Exam Routine List')}
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExamRoutineCreate}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <FaPlus aria-hidden="true" />
            নতুন রুটিন তৈরি
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <label className="text-sm font-medium text-gray-700">
          Session
          <select
            value={sessionFilter}
            onChange={(event) => setSessionFilter(event.target.value)}
            className="mt-1 block h-11 w-full rounded-md border border-gray-300 bg-white px-3"
          >
            <option value="">সব সেশন</option>
            {sessions.map((session) => (
              <option key={session.SessionID} value={session.SessionID}>
                {session.SessionName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Exam
          <select
            value={examFilter}
            onChange={(event) => setExamFilter(event.target.value)}
            className="mt-1 block h-11 w-full rounded-md border border-gray-300 bg-white px-3"
          >
            <option value="">সব পরীক্ষা</option>
            {exams.map((exam) => (
              <option key={exam.ExamID} value={exam.ExamID}>
                {exam.ExamName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Class/Jamaat
          <select
            value={subClassFilter}
            onChange={(event) => setSubClassFilter(event.target.value)}
            className="mt-1 block h-11 w-full rounded-md border border-gray-300 bg-white px-3"
          >
            <option value="">সব শ্রেণি</option>
            {subClasses.map((subClass) => (
              <option key={subClass.SubClassID} value={subClass.SubClassID}>
                {subClass.SubClass}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end justify-end">
          <button
            type="button"
            onClick={handlePrintAll}
            disabled={printAllCount === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            title={`Print all routines (${printAllCount})`}
            aria-label="Print all routines"
          >
            <FaPrint size={16} aria-hidden="true" />
            সব প্রিন্ট ({printAllCount})
          </button>
        </div>
      </div>

      {isError ? (
        <p className="py-8 text-center text-red-600">রুটিনের তালিকা লোড করা যায়নি।</p>
      ) : isLoading || isFetching ? (
        <p className="py-8 text-center text-gray-500">লোড হচ্ছে...</p>
      ) : filteredRoutingData.length === 0 ? (
        <p className="py-8 text-center text-gray-500">কোনো পরীক্ষার রুটিন পাওয়া যায়নি।</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-sm text-gray-700">
                <th className="px-4 py-3 font-semibold">ক্রম</th>
                <th className="px-4 py-3 font-semibold">Session</th>
                <th className="px-4 py-3 font-semibold">Exam</th>
                <th className="px-4 py-3 font-semibold">Class/Jamaat</th>
                <th className="px-4 py-3 text-center font-semibold">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutingData.map((routing, index) => (
                <tr
                  key={routing.ERIDL ?? `${routing.SessionID}-${routing.ExamID}-${getSubClassID(routing)}`}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {routing.session?.SessionName ?? routing.SessionName ?? routing.SessionID}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {routing.examName?.ExamName ?? routing.ExamName ?? routing.ExamID}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {routing.classGroup?.SubClass ?? routing.SubClass ?? routing.SubClassID}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <EditButton onClick={() => handleEdit(routing)} />
                      <DeleteButton onClick={() => handleDelete(routing)} />
                      <button
                        type="button"
                        onClick={() => handlePrintSingle(routing)}
                        className="flex items-center justify-center rounded-md bg-emerald-600 p-2 text-white hover:bg-emerald-700"
                        title="Print routine as PDF"
                        aria-label="Print routine as PDF"
                      >
                        <FaPrint size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {printItems && (
        <ExamRoutinePrint
          items={printItems}
          onClose={() => setPrintItems(null)}
        />
      )}
    </div>
  );
};

ExamRoutingList.propTypes = {
  pageTitle: PropTypes.string,
};

export default ExamRoutingList;
