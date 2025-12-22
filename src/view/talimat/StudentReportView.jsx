import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { closeModal } from '../../features/modal/modalSlice';
import { useDeleteStudentReportMutation, useGetSingleStudentReportQuery } from '../../features/talimat/talimatQuerySlice';


const StudentReportView = (id) => {
  const dispatch = useDispatch()
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // id undefined হলে query skip হবে
  const { data, isLoading, isError } = useGetSingleStudentReportQuery(id.id, {
    skip: !id.id, // id না থাকলে query চালাবে না
  });

  const [deleteStudentReport] = useDeleteStudentReportMutation();
  const handleDelete = async (id) => {
    try {
      const res = await deleteStudentReport(id).unwrap();
      toast.success(
        res?.message || translate('Student Report deleted successfully')
      );
      dispatch(closeModal())
    } catch (error) {
      toast.error(error?.data?.message || translate('Failed to delete report'));
    }
  };

  console.log(data, 'data');
  console.log(id, 'id');

  const getStatusBadge = (status) => {
    return status ? (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
        Viewed
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
        Unread
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (isError || !data?.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-red-700 mb-2">
          Error Loading Report
        </h3>
        <p className="text-red-600">
          {data?.message || 'Failed to load report data'}
        </p>
      </div>
    );
  }

  // No data state
  if (!data?.data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-yellow-700 mb-2">
          No Data Found
        </h3>
        <p className="text-yellow-600">Report data is not available</p>
      </div>
    );
  }

  const reportData = data.data;

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Student Complaint Report
          </h1>
          <p className="text-gray-600 mt-2">
            Detailed view of student complaint information
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Status Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Complaint ID: #{reportData.SCID}
                </h2>
                <p className="text-blue-100 mt-1">
                  Created by: {reportData.CreatedBy?.UserName || 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(reportData.SeeUnSee)}
                <span className="text-white bg-black/20 px-3 py-1 rounded-lg text-sm">
                  User ID: {reportData.CreateUserID}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Complaint Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Complaint Details
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {reportData.ComplaintDetails || 'No details provided'}
                    </p>
                  </div>
                </div>

                {/* Submission Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Submission Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-600">Created At:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(reportData.CreateAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(reportData.SeeUnSee)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Creator Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Creator Information
                </h3>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {reportData.CreatedBy?.UserName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">
                        {reportData.CreatedBy?.UserName || 'Unknown User'}
                      </h4>
                      <p className="text-gray-600">
                        User ID: {reportData.CreatedBy?.UserID || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center text-gray-500 mb-1">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm">Father's Name</span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {reportData.CreatedBy?.FatherName || 'Not provided'}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center text-gray-500 mb-1">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          <span className="text-sm">Email</span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {reportData.CreatedBy?.Email || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center text-gray-500 mb-2">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="text-sm">Contact Information</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">
                            Primary Mobile
                          </p>
                          <p className="font-medium text-gray-900">
                            {reportData.CreatedBy?.Mobile1 || 'Not provided'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">
                            Secondary Mobile
                          </p>
                          <p className="font-medium text-gray-900">
                            {reportData.CreatedBy?.Mobile2 || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDelete(reportData?.SCID)}
                    className="px-5 py-2.5 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center justify-center flex-1 min-w-[120px]"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReportView;
