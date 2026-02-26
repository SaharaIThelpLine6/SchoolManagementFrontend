import { useParams } from 'react-router-dom';
import {
  useGetLabelNamesQuery,
  useGetSingleExamDataQuery,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';

const StudentResults = () => {
  const { examId, subClassId, sessionId } = useParams();

  const { data, isLoading, error } = useGetSingleExamDataQuery(
    { examId, subClassId, sessionId },
    { skip: !examId || !subClassId || !sessionId }
  );
  const { data: labelNameData } = useGetLabelNamesQuery();

  const labelData = labelNameData?.[0]?.AdmissionIDLabel || '';
  console.log(data, 'data');
  const getSubjects = (student) => {
    const arr = [];
    for (let i = 1; i <= 14; i++) {
      if (student[`Subject${i}`]) {
        arr.push({
          name: student[`Subject${i}`],
          mark: student[`SubVal${i}`] || 0,
        });
      }
    }
    return arr;
  };

  if (isLoading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600">Error</div>;
  if (!data?.data?.length) return <div className="text-center">No Data</div>;

  return (
    <div className="p-4 font-SolaimanLipi">
      {data.data.map((student) => (
        <ResultImage
          key={student.ID}
          student={student}
          labelData={labelData}
          getSubjects={getSubjects}
        />
      ))}
    </div>
  );
};

export default StudentResults;

/* ===============================
   IMAGE STYLE RESULT
================================ */
const ResultImage = ({ student, getSubjects, labelData }) => {
  const subjects = getSubjects(student);
  const calculateAverage = (student) => {
    let total = 0;
    let count = 0;

    for (let i = 1; i <= 14; i++) {
      const mark = Number(student[`SubVal${i}`]);

      if (!isNaN(mark) && mark > 0) {
        total += mark;
        count++;
      }
    }

    return count > 0 ? (total / count).toFixed(1) : 0;
  };


  return (
    <div className="max-w-md mx-auto border-2 border-[#4099f9] rounded-lg bg-blue-50 overflow-hidden mb-20">
      {/* HEADER */}
      <div className="bg-[#4099f9] text-white text-center py-2 font-bold">
        {student.ExamName}
      </div>

      {/* INFO */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-300">
        <Info label="শিক্ষাবর্ষ" value={student.SessionName} />
        <Info label="শ্রেণী" value={student.SubClass} />
        <Info label={labelData} value={student?.AdmissionSerial || ''} />
        <Info label="গড়" value={calculateAverage(student)} />
        <Info label="বিভাগ" value={student.Division} />
        <Info label="মোট" value={student.Total} />
      </div>

      {/* TABLE HEADER */}
      <div className="flex bg-blue-500 text-white px-3 py-1 font-bold">
        <div className="w-2/3">বিষয়</div>
        <div className="w-1/3 text-right">প্রাপ্ত নম্বর</div>
      </div>

      {/* SUBJECT LIST */}
      <div className="bg-blue-100">
        {subjects.map((s, i) => (
          <div
            key={i}
            className="flex items-center px-3 py-1 border-b border-blue-300 text-sm"
          >
            <div className="w-2/3">{s.name}</div>
            <div className="w-1/6 text-center">:</div>
            <div className="w-1/6 text-right font-bold">{s.mark}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ===============================
   SMALL
================================ */
const Info = ({ label, value }) => (
  <div className="flex items-center justify-between gap-2 bg-[#4099f9] text-white px-3 py-2 rounded-md shadow-sm">
    {/* Label */}
    <span className="text-sm font-semibold whitespace-nowrap">{label}</span>

    {/* Value */}
    <span
      className="
        bg-white text-gray-400 px-2 py-1 rounded font-bold
        text-xs sm:text-sm
        max-w-[75%]
        truncate
        text-center
      "
      title={value}
    >
      {value || '—'}
    </span>
  </div>
);
