import { Buffer } from "buffer";
import { useState } from 'react';
import { useGetTeachersInfoQuery } from '../../features/userPanel/userInfo/userInfoQuerySlice';
import LogoAvater from "/saharait-preview.png";

const TeacherContacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const { data = {}, isLoading } = useGetTeachersInfoQuery();

  console.log(data.data, 'API Data');

  // API থেকে আসা শিক্ষকদের ডেটা
  const apiTeachers = data.data || [];

  // API ডেটাকে প্রয়োজনীয় ফরম্যাটে রূপান্তর করুন
  const formattedTeachers = apiTeachers.map((teacher) => {
    // Image প্রসেসিং
    let imageSrc = LogoAvater; // ডিফল্ট ইমেজ

    if (teacher.Image && teacher.Image.data && teacher.Image.data.length > 0) {
      try {
        const buffer = Buffer.from(teacher.Image.data);
        const base64String = buffer.toString('base64');
        imageSrc = `data:image/png;base64,${base64String}`;
        console.log(imageSrc, 'imageSrc');
      } catch (error) {
        console.error('Image processing error:', error);
      }
    }

    // Designation থেকে ডিপার্টমেন্ট ডিটেক্ট করুন
    const getDepartmentFromDesignation = (designation) => {
      const designationLower = (designation || '').toLowerCase();
      if (designationLower.includes('মুহতামিম')) return 'প্রশাসন';
      if (designationLower.includes('নাযেম')) return 'প্রশাসন';
      if (designationLower.includes('শিক্ষক')) return 'শিক্ষকতা';
      return 'সাধারণ';
    };

    return {
      id: teacher.TIID || teacher.UserID,
      name: teacher.UserName || 'নাম নেই',
      department: getDepartmentFromDesignation(teacher.Designation),
      designation: teacher.Designation || 'পদবি নেই',
      email: teacher.Email || 'ইমেইল নেই',
      phone: teacher.Mobile1 || 'ফোন নম্বর নেই',
      office: teacher.PermanentVill
        ? `${teacher.PermanentVill}, ${teacher.DistrictName || ''}`
        : 'অফিস তথ্য নেই',
      availability: 'সোম-শুক্র সকাল ৯টা-বিকাল ৫টা', // ডিফল্ট ভ্যালু
      image: imageSrc,
      subjects: ['বিষয় তথ্য নেই'], // ডিফল্ট ভ্যালু
      experience: teacher.Experience || 'অভিজ্ঞতার তথ্য নেই',
      // অতিরিক্ত তথ্য
      fatherName: teacher.FatherName || '',
      motherName: teacher.MotherName || '',
      bloodGroup: teacher.BloodGroup || '',
      dateOfBirth: teacher.DateOfBirth || '',
      address: teacher.PermanentVill
        ? `${teacher.PermanentVill}, ${teacher.PoliceStationName}, ${teacher.DistrictName}`
        : 'ঠিকানা নেই',
      nidNo: teacher.NIDNO || '',
      joiningDate: teacher.JoiningDate || '',
    };
  });

  // Departments for filtering (API ডেটার উপর ভিত্তি করে)
  const departments = [
    { id: 'all', name: 'সব বিভাগ' },
    { id: 'প্রশাসন', name: 'প্রশাসন' },
    { id: 'শিক্ষকতা', name: 'শিক্ষকতা' },
    { id: 'সাধারণ', name: 'সাধারণ' },
  ];

  // Filter teachers based on search and department
  const filteredTeachers = formattedTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some((subject) =>
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesDepartment =
      selectedDepartment === 'all' ||
      teacher.department.toLowerCase().includes(selectedDepartment);

    return matchesSearch && matchesDepartment;
  });

  // Get department badge color
  const getDepartmentColor = (department) => {
    const colors = {
      প্রশাসন: 'bg-blue-100 text-blue-800 border border-blue-200',
      শিক্ষকতা: 'bg-green-100 text-green-800 border border-green-200',
      সাধারণ: 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    return colors[department] || 'bg-gray-100 text-gray-800';
  };

  // Toggle teacher details
  const toggleTeacherDetails = (teacherId) => {
    setExpandedTeacher(expandedTeacher === teacherId ? null : teacherId);
  };

  // SVG Icons
  const SearchIcon = ({ className = 'h-5 w-5' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  const FilterIcon = ({ className = 'h-4 w-4' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );

  const ChevronUpIcon = ({ className = 'h-4 w-4' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 15l7-7 7 7"
      />
    </svg>
  );

  const ChevronDownIcon = ({ className = 'h-4 w-4' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  const PhoneIcon = ({ className = 'h-4 w-4' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );

  const MailIcon = ({ className = 'h-4 w-4' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  const MapPinIcon = ({ className = 'h-4 w-4' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  const UserIcon = ({ className = 'h-4 w-4' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  const CalendarIcon = ({ className = 'h-4 w-4' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const HomeIcon = ({ className = 'h-4 w-4' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );

  const IDCardIcon = ({ className = 'h-4 w-4' }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
      />
    </svg>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">শিক্ষকদের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 mb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">শিক্ষক পরিচিতি</h1>
        <p className="text-gray-600 mt-1">শিক্ষকদের সাথে যোগাযোগ করুন</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, বিভাগ বা পদবি অনুসারে খুঁজুন..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            ফিল্টার
            {showFilters ? (
              <ChevronUpIcon className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            )}
          </button>
          <span className="text-sm text-gray-500">
            {filteredTeachers.length} জন শিক্ষক পাওয়া গেছে
          </span>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-medium text-gray-700 mb-3">
              বিভাগ অনুসারে ফিল্টার করুন
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDepartment === dept.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Teachers List */}
      <div className="space-y-4">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            {/* Teacher Card Header */}
            <div className="p-4">
              <div className="flex items-start space-x-4">
                {/* Teacher Image */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img
                      src={teacher.image}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face';
                      }}
                    />
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {teacher.designation}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleTeacherDetails(teacher.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      {expandedTeacher === teacher.id ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Department Badge */}
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(
                        teacher.department
                      )}`}
                    >
                      {teacher.department}
                    </span>
                  </div>

                  {/* Quick Contact Info */}
                  <div className="mt-3 flex items-center space-x-4">
                    {teacher.phone && teacher.phone !== 'ফোন নম্বর নেই' && (
                      <a
                        href={`tel:${teacher.phone}`}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        কল করুন
                      </a>
                    )}
                    {teacher.email && teacher.email !== 'ইমেইল নেই' && (
                      <a
                        href={`mailto:${teacher.email}`}
                        className="flex items-center text-sm text-green-600 hover:text-green-800"
                      >
                        <MailIcon className="h-4 w-4 mr-1" />
                        ইমেইল করুন
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedTeacher === teacher.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4 animate-slideDown">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                      ব্যক্তিগত তথ্য
                    </h4>
                    <div className="space-y-2">
                      {teacher.fatherName && (
                        <div className="flex items-center text-sm">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium text-gray-600">
                              পিতার নাম:{' '}
                            </span>
                            <span className="text-gray-700">
                              {teacher.fatherName}
                            </span>
                          </div>
                        </div>
                      )}
                      {teacher.motherName && (
                        <div className="flex items-center text-sm">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium text-gray-600">
                              মাতার নাম:{' '}
                            </span>
                            <span className="text-gray-700">
                              {teacher.motherName}
                            </span>
                          </div>
                        </div>
                      )}
                      {teacher.dateOfBirth && (
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium text-gray-600">
                              জন্ম তারিখ:{' '}
                            </span>
                            <span className="text-gray-700">
                              {new Date(teacher.dateOfBirth).toLocaleDateString(
                                'bn-BD'
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                      {teacher.bloodGroup && (
                        <div className="flex items-center text-sm">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium text-gray-600">
                              রক্তের গ্রুপ:{' '}
                            </span>
                            <span className="text-gray-700">
                              {teacher.bloodGroup}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">যোগাযোগ তথ্য</h4>
                    <div className="space-y-2">
                      {teacher.phone && teacher.phone !== 'ফোন নম্বর নেই' && (
                        <div className="flex items-center text-sm">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium text-gray-600">
                              মোবাইল:{' '}
                            </span>
                            <span className="text-gray-700">
                              {teacher.phone}
                            </span>
                          </div>
                        </div>
                      )}
                      {teacher.email && teacher.email !== 'ইমেইল নেই' && (
                        <div className="flex items-center text-sm">
                          <MailIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium text-gray-600">
                              ইমেইল:{' '}
                            </span>
                            <span className="text-gray-700">
                              {teacher.email}
                            </span>
                          </div>
                        </div>
                      )}
                      {teacher.address && teacher.address !== 'ঠিকানা নেই' && (
                        <div className="flex items-center text-sm">
                          <HomeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium text-gray-600">
                              ঠিকানা:{' '}
                            </span>
                            <span className="text-gray-700">
                              {teacher.address}
                            </span>
                          </div>
                        </div>
                      )}
                      {teacher.office && teacher.office !== 'অফিস তথ্য নেই' && (
                        <div className="flex items-center text-sm">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <span className="font-medium text-gray-600">
                              স্থায়ী ঠিকানা:{' '}
                            </span>
                            <span className="text-gray-700">
                              {teacher.office}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-3 md:col-span-2">
                    <h4 className="font-medium text-gray-700">পেশাগত তথ্য</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          অভিজ্ঞতা:
                        </p>
                        <p className="text-gray-700">{teacher.experience}</p>
                      </div>
                      {teacher.joiningDate && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            যোগদানের তারিখ:
                          </p>
                          <p className="text-gray-700">
                            {new Date(teacher.joiningDate).toLocaleDateString(
                              'bn-BD'
                            )}
                          </p>
                        </div>
                      )}
                      {teacher.nidNo && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            জাতীয় পরিচয়পত্র নম্বর:
                          </p>
                          <div className="flex items-center">
                            <IDCardIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">
                              {teacher.nidNo}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                  {teacher.phone && teacher.phone !== 'ফোন নম্বর নেই' && (
                    <a
                      href={`https://wa.me/88${teacher.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-center hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  )}

                  {/* {teacher.phone && teacher.phone !== 'ফোন নম্বর নেই' && (
                    <a
                      href={`tel:${teacher.phone}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      কল করুন
                    </a>
                  )} */}
                  {teacher.email && teacher.email !== 'ইমেইল নেই' && (
                    <a
                      href={`mailto:${teacher.email}`}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-center hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <MailIcon className="h-4 w-4 mr-2" />
                      ইমেইল করুন
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredTeachers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            কোনো শিক্ষক পাওয়া যায়নি
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">শিক্ষকদের তথ্য লোড হচ্ছে...</p>
        </div>
      )}
    </div>
  );
};

export default TeacherContacts;
