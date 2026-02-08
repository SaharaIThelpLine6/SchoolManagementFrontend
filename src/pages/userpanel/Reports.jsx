import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../../components/Button/Button';
import {
  useGetMaddasahReportListQuery,
  usePostStudentParentsReportsMutation,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
import useTranslate from '../../utils/Translate';

const Reports = () => {
  const [report, setReport] = useState('');
  const translate = useTranslate();
  const { schoolid } = useParams();

  const { data, refetch, isLoading } = useGetMaddasahReportListQuery();

  const [postStudentParentsReports] = usePostStudentParentsReportsMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!report?.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'সতর্কতা',
        text: 'অনুগ্রহ করে কিছু লিখুন',
        confirmButtonColor: '#49afe0',
      });
      return;
    }

    try {
      const res = await postStudentParentsReports({
        ComplaintDetails: report,
      }).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'সফল হয়েছে',
        text: 'আপনার অভিযোগ / পরামর্শ সফলভাবে জমা হয়েছে',
        confirmButtonColor: '#49afe0',
      });

      setReport('');
      refetch(); // 🔥 list আবার load হবে
    } catch (error) {
      console.error('Submit failed:', error);

      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ হয়েছে',
        text:
          error?.data?.message || 'কিছু সমস্যা হয়েছে, পরে আবার চেষ্টা করুন',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 pt-2 rounded-xl shadow-lg relative mb-20">
      {/* হেডার বক্স*/}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-4 border-gray-800 inline-block">
          অভিযোগ বক্স
        </h2>
        <Button>
          <Link to={`/${schoolid}/dashboard/reports-list`}>অভিযোগ লিষ্ট</Link>
        </Button>
      </div>

      {/* নির্দেশাবলী */}
      <ul className="text-gray-700 font-semibold mb-4 space-y-2">
        {data?.data?.map((item) => (
          <li key={item.SCNID} className="flex items-start">
            <span className="w-2 h-2 mt-2 mr-2 rounded-full bg-[#49afe0] flex-shrink-0"></span>
            <span className="leading-relaxed">{item.Details || ''}</span>
          </li>
        ))}
      </ul>

      {/* টেক্সট এরিয়া */}
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          placeholder="এখানে আপনার মতামত লিখুন..."
          value={report}
          onChange={(e) => setReport(e.target.value)}
        />
        <button
          type="submit"
          className="mt-4 w-[80px] bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Reports;
