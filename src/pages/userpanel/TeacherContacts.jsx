import { useState } from 'react';
import { useGetTeachersInfoQuery } from '../../features/userPanel/userInfo/userInfoQuerySlice';

const TeacherContacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const { data = {}, isLoading } = useGetTeachersInfoQuery();
  console.log(data, 'data');

  // Example teacher data
  const teachers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      department: 'Mathematics',
      designation: 'Head of Department',
      email: 'sarah.johnson@school.edu',
      phone: '+1 (555) 123-4567',
      office: 'Room 101, Main Building',
      availability: 'Mon-Wed 10AM-3PM',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
      experience: '15 years',
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      department: 'Computer Science',
      designation: 'Senior Lecturer',
      email: 'michael.chen@school.edu',
      phone: '+1 (555) 987-6543',
      office: 'Room 205, Tech Building',
      availability: 'Tue-Thu 9AM-4PM',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      subjects: ['Data Structures', 'Algorithms', 'Machine Learning'],
      experience: '12 years',
    },
    {
      id: 3,
      name: 'Ms. Emily Davis',
      department: 'English',
      designation: 'Assistant Professor',
      email: 'emily.davis@school.edu',
      phone: '+1 (555) 456-7890',
      office: 'Room 150, Arts Building',
      availability: 'Mon-Fri 11AM-2PM',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      subjects: ['Literature', 'Creative Writing', 'Grammar'],
      experience: '8 years',
    },
    {
      id: 4,
      name: 'Dr. Robert Wilson',
      department: 'Physics',
      designation: 'Professor',
      email: 'robert.wilson@school.edu',
      phone: '+1 (555) 234-5678',
      office: 'Room 301, Science Building',
      availability: 'Wed-Fri 1PM-5PM',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      subjects: ['Quantum Mechanics', 'Thermodynamics', 'Electromagnetism'],
      experience: '20 years',
    },
    {
      id: 5,
      name: 'Ms. Jennifer Lee',
      department: 'Biology',
      designation: 'Lecturer',
      email: 'jennifer.lee@school.edu',
      phone: '+1 (555) 345-6789',
      office: 'Room 250, Science Building',
      availability: 'Mon-Thu 10AM-3PM',
      image:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      subjects: ['Genetics', 'Microbiology', 'Ecology'],
      experience: '6 years',
    },
    {
      id: 6,
      name: 'Dr. David Brown',
      department: 'Chemistry',
      designation: 'Associate Professor',
      email: 'david.brown@school.edu',
      phone: '+1 (555) 567-8901',
      office: 'Room 310, Science Building',
      availability: 'Tue-Fri 9AM-12PM',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      subjects: ['Organic Chemistry', 'Biochemistry', 'Analytical Chemistry'],
      experience: '14 years',
    },
    {
      id: 7,
      name: 'Mrs. Lisa Taylor',
      department: 'History',
      designation: 'Senior Lecturer',
      email: 'lisa.taylor@school.edu',
      phone: '+1 (555) 678-9012',
      office: 'Room 120, Arts Building',
      availability: 'Mon-Wed 1PM-4PM',
      image:
        'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
      subjects: ['World History', 'Ancient Civilizations', 'Political History'],
      experience: '11 years',
    },
    {
      id: 8,
      name: 'Mr. James Miller',
      department: 'Physical Education',
      designation: 'Coach',
      email: 'james.miller@school.edu',
      phone: '+1 (555) 789-0123',
      office: 'Gym Office, Sports Complex',
      availability: 'Daily 8AM-5PM',
      image:
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
      subjects: ['Basketball', 'Athletics', 'Health Education'],
      experience: '9 years',
    },
  ];

  // Departments for filtering
  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'computer', name: 'Computer Science' },
    { id: 'english', name: 'English' },
    { id: 'physics', name: 'Physics' },
    { id: 'biology', name: 'Biology' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'history', name: 'History' },
    { id: 'pe', name: 'Physical Education' },
  ];

  // Filter teachers based on search and department
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      Mathematics: 'bg-blue-100 text-blue-800',
      'Computer Science': 'bg-purple-100 text-purple-800',
      English: 'bg-green-100 text-green-800',
      Physics: 'bg-red-100 text-red-800',
      Biology: 'bg-emerald-100 text-emerald-800',
      Chemistry: 'bg-orange-100 text-orange-800',
      History: 'bg-amber-100 text-amber-800',
      'Physical Education': 'bg-cyan-100 text-cyan-800',
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 mb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Contacts</h1>
        <p className="text-gray-600 mt-1">Connect with faculty members</p>
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
            placeholder="Search by name, department, or subject..."
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
            Filters
            {showFilters ? (
              <ChevronUpIcon className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            )}
          </button>
          <span className="text-sm text-gray-500">
            {filteredTeachers.length} teachers found
          </span>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-medium text-gray-700 mb-3">
              Filter by Department
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
                    <a
                      href={`tel:${teacher.phone}`}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      Call
                    </a>
                    <a
                      href={`mailto:${teacher.email}`}
                      className="flex items-center text-sm text-green-600 hover:text-green-800"
                    >
                      <MailIcon className="h-4 w-4 mr-1" />
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedTeacher === teacher.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4 animate-slideDown">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                      Contact Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{teacher.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MailIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{teacher.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{teacher.office}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {teacher.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Teaching Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                      Teaching Details
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Subjects:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {teacher.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-600">Experience:</p>
                        <p className="text-gray-700">{teacher.experience}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                  <a
                    href={`tel:${teacher.phone}`}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Call Now
                  </a>
                  <a
                    href={`mailto:${teacher.email}`}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-center hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <MailIcon className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No teachers found
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}

    </div>
  );
};

export default TeacherContacts;
