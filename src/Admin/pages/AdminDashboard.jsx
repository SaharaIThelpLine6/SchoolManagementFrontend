// src/Admin/pages/AdminDashboard.jsx
import { useSelector } from "react-redux";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      {/* ওয়েলকাম হেডার */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          স্বাগতম, {user?.name || "অ্যাডমিন"}! 👋
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          আপনার অ্যাডমিন ড্যাশবোর্ডে আপনাকে স্বাগতম। এখান থেকে আপনি সবকিছু নিয়ন্ত্রণ করতে পারবেন।
        </p>
      </div>

      {/* দ্রুত তথ্য কার্ড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-blue-800">মোট মাদ্রাসা</h2>
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-sm text-blue-500 mt-1">আপডেট শীঘ্রই</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-green-800">সক্রিয় ইউজার</h2>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-sm text-green-500 mt-1">আপডেট শীঘ্রই</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-purple-800">রিপোর্ট</h2>
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-sm text-purple-500 mt-1">আপডেট শীঘ্রই</p>
        </div>
      </div>

      {/* সাম্প্রতিক কার্যকলাপ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">সাম্প্রতিক কার্যকলাপ</h2>
        <p className="text-gray-500 text-sm">এখনো কোনো কার্যকলাপ নেই।</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
