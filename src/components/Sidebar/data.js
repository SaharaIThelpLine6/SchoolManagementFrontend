export const menuData = [
  {
    id: '1',
    name: 'General Information',
    route: '/general-info',
    icon: 'LuWarehouse',
    subMenu: [
      {
        id: '1',
        name: 'Dashboard',
        route: '/',
      },
      {
        id: '2',
        name: 'New User',
        route: '/general-info/users-info',
      },
      {
        id: '3',
        name: 'Month Name',
        route: '/general-info/month-name-list',
        subMenu: false,
      },
      {
        id: '4',
        name: 'All Madrasah',
        route: '/general-info/all-madrasah',
        subMenu: false,
      },
      {
        id: '5',
        name: 'Institution Information',
        route: '/general-info/institution-info',
        subMenu: false,
      },
      {
        id: '6',
        name: 'RFID Card',
        route: '/general-info/rfid-card',
        subMenu: false,
      },

      {
        id: '7',
        name: 'User Image',
        route: '/general-info/user-image',
        subMenu: false,
      },
      {
        id: '8',
        name: 'Bulk Image',
        route: '/general-info/bulk-image',
        subMenu: false,
      },
      {
        id: '9',
        name: 'SMS',
        route: '/general-info/sms',
      },
      {
        id: '10',
        name: 'User Reports',
        route: '/general-info/user-reports',
      },
    ],
  },
  {
    id: '2',
    name: 'Student',
    route: '/students',
    icon: 'PiStudentBold',
    subMenu: [
      {
        id: '1',
        name: 'Session',
        route: '/students/sessions',
      },
      {
        id: '2',
        name: 'Class',
        route: '/students/class',
      },
      {
        id: '3',
        name: 'Sub Class',
        route: '/students/section',
      },
      {
        id: '4',
        name: 'Students Admission',
        route: '/students',
      },
      {
        id: '5',
        name: 'English & Arobi Name',
        route: '/students/english-arobi-name',
      },
      {
        id: '6',
        name: 'Book',
        route: '/students/book-list',
      },
      {
        id: '7',
        name: 'Group Distribution',
        route: '/students/group-distribution',
      },
      {
        id: '8',
        name: 'Data Export',
        route: '/students/data-export',
      },
      {
        id: '9',
        name: 'Certificate of Attestation',
        route: '/students/certificate-of-attestation',
      },
      {
        id: '10',
        name: 'Students Report',
        route: '/students/report',
      },
      {
        id: '11',
        name: 'Online Admission',
        route: '/students/online-admission',
      },
      {
        id: '12',
        name: 'Student ID Card',
        route: '/students/student-id-card',
      },
    ],
  },
  {
    id: '3',
    name: 'Parent Panel',
    route: '/parent-panel',
    icon: 'FaUsers',
    subMenu: [
      {
        id: '1',
        name: 'Class Routine',
        route: '/parent-panel',
      },
      {
        id: '2',
        name: 'Class Video',
        route: '/parent-panel/class-video',
      },
      {
        id: '3',
        name: 'Home Work',
        route: '/parent-panel/home-work',
      },
      {
        id: '4',
        name: 'Student Complaints',
        route: '/parent-panel/student-complaint',
      },
      {
        id: '5',
        name: 'Complaint Box Terms and Conditions',
        route: '/parent-panel/complaint-box-terms-and-conditions',
      },
      // {
      //   id: '6',
      //   name: 'Online Admission',
      //   route: '/parent-panel/online-admission',
      // },
      {
        id: '7',
        name: 'User Notice',
        route: '/parent-panel/user-notice',
      }
    ],
  },
  // {
  //   id: "3",
  //   name: "Teacher Staff",
  //   route: "/teacherinfo",
  //   icon: "IoIosPeople",
  //   subMenu: [
  //     {
  //       id: "1",
  //       name: "Teacher Info",
  //       route: "/teacherinfo",
  //       subMenu: false,
  //     },
  //     {
  //       id: "2",
  //       name: "Pay-role Heading",
  //       route: "/teacherinfo/payRole",
  //       subMenu: false,
  //     },
  //     {
  //       id: "3",
  //       name: "Pay-role Name",
  //       route: "/teacherinfo/pRName",
  //       subMenu: false,
  //     },
  //     {
  //       id: "4",
  //       name: "Reports",
  //       route: "/teacherinfo/report",
  //       subMenu: false,
  //     },
  //     {
  //       id: "5",
  //       name: "Designation",
  //       route: "/teacherinfo/designation",
  //       subMenu: false,
  //     },
  //   ],
  // },
  {
    id: '4',
    name: 'Exam',
    route: '/exam',
    icon: 'PiExam',
    subMenu: [
      {
        id: '1',
        name: 'Exam Name',
        route: '/exam',
      },
      {
        id: '2',
        name: 'Exam Fee Determine',
        route: '/exam/fee-determine',
      },
      {
        id: '3',
        name: 'Exam Condition',
        route: '/exam/exam-condition',
      },
      // {
      //   id: '5',
      //   name: 'List of Candidates',
      //   route: '/exam/list-of-candidates',
      // },
      {
        id: '5',
        name: 'Exam Group Select',
        route: '/exam/exam-group-create',
      },
      {
        id: '6',
        name: 'Talent Condition',
        route: '/exam/talent-condition',
      },
      {
        id: '7',
        name: 'Admit Card',
        route: '/exam/admit-card',
      },
      {
        id: '8',
        name: 'Exam Routing Create',
        route: '/exam/routing',
      },
      {
        id: '9',
        name: 'Exam Rules',
        route: '/exam/rules',
      },
      {
        id: '10',
        name: 'Exam Report',
        route: '/exam/report',
      },
    ],
  },
  {
    id: '5',
    name: 'Result',
    route: '/result',
    icon: 'GiGraduateCap',
    subMenu: [
      {
        id: '1',
        name: 'Online F: Publish',
        route: '/result',
      },
      {
        id: '2',
        name: 'Result Report',
        route: '/result/report',
      },
    ],
  },
  // {
  //   id: '6',
  //   name: 'Board Exam',
  //   route: '/board-info',
  //   icon: 'UniversityIcon',
  //   // subMenu: [
  //   //   {
  //   //     id: '1',
  //   //     name: 'Madrasah Board Info',
  //   //     route: '/board-info',
  //   //   },
  //   //   {
  //   //     id: '2',
  //   //     name: 'Board Exam Name',
  //   //     route: '/board-info/exam-name',
  //   //   },
  //   //   {
  //   //     id: '3',
  //   //     name: 'Board Name',
  //   //     route: '/board-info/name',
  //   //   },
  //   //   {
  //   //     id: '4',
  //   //     name: 'Board Center Name',
  //   //     route: '/board-info/center-name',
  //   //   },
  //   //   {
  //   //     id: '5',
  //   //     name: 'Markas and Registration Fee Determine',
  //   //     route: '/board-info/maskas-registration-fee-determine',
  //   //   },
  //   // ],
  // },
  {
    id: '7',
    name: 'Darul Ikama',
    route: '/darul-ikama',
    icon: 'RiSchoolFill',
    subMenu: [
      {
        id: '1',
        name: 'Character Report',
        route: '/darul-ikama',
      },
      {
        id: '2',
        name: 'Gate pass and leave',
        route: '/darul-ikama/vacation',
      },
    ],
  },
  {
    id: '8',
    name: 'Accounting',
    route: '/accounting',
    icon: 'FaCalculator',
    subMenu: [
      {
        id: '1',
        name: 'Deposit Costs',
        route: '/accounting',
      },
      {
        id: '2',
        name: 'Deposit Costs Report',
        route: '/accounting/income-expense-report',
      },
      {
        id: '3',
        name: 'Fee Setting',
        route: '/accounting/fee-setting',
      },
      {
        id: '4',
        name: 'Student Fee Collection',
        route: '/accounting/student-fee-collection',
      },
      {
        id: '5',
        name: 'Dues List',
        route: '/accounting/dues-list',
      },
      {
        id: '6',
        name: 'Monthly Dues',
        route: '/accounting/monthly-dues',
      },
      {
        id: '7',
        name: 'Fee Collection Report',
        route: '/accounting/fee-collection-report',
      },
      {
        id: '8',
        name: 'Balance Transfer',
        route: '/accounting/balance-transfer',
      },
      {
        id: '9',
        name: 'Delete Edit Record',
        route: '/accounting/delete-edit-record',
      },
      // {
      //   id: '10',
      //   name: 'Student Admission',
      //   route: '/accounting/student-admission',
      // },
    ],
  },
  // {
  //   id: '18',
  //   name: 'Talimat',
  //   route: '/talimat',
  //   icon: 'IoMdSettings',
  //   subMenu: [
  //     {
  //       id: '1',
  //       name: 'Complaint Box Terms and Conditions',
  //       route: '/talimat',
  //     },
  //   ],
  // },
  {
    id: '9',
    name: 'Payment',
    route: '/payment',
    icon: 'MdOutlinePayment',
    subMenu: [
      {
        id: '1',
        name: 'Pay Now',
        route: '/checkout',
      },
      {
        id: '2',
        name: 'Payment History',
        route: '/payment-history',
      },
      {
        id: '3',
        name: 'Maddrasah Payment Info',
        route: '/payment-history/maddrasah-payment-info',
      },
      {
        id: '4',
        name: 'Online Payment Invoice',
        route: '/payment-history/online-payment-invoice',
      },
    ],
  },

  // {
  //   id: "10",
  //   name: "Donation",
  //   route: "/donation",
  //   icon: "FaDonate",
  //   subMenu: [
  //     {
  //       id: "1",
  //       name: "Donor Fee Determination",
  //       route: "/donation",
  //     },
  //     {
  //       id: "2",
  //       name: "Fee Collection",
  //       route: "/donation/fee-collection",
  //     },
  //     {
  //       id: "3",
  //       name: "Donor Report",
  //       route: "/donation/report",
  //     },
  //   ],
  // },
  // {
  //   id: "10",
  //   name: "Library",
  //   route: "/library",
  //   icon: "ImLibrary",
  //   subMenu: [],
  // },
  // {
  //   id: "11",
  //   name: "Others",
  //   route: "/others",
  //   icon: "HiDotsCircleHorizontal",
  //   subMenu: [],
  // },

  {
    id: '10',
    name: 'Settings',
    route: '/settings',
    icon: 'IoMdSettings',
    subMenu: [
      {
        id: '1',
        name: 'User Roles',
        route: '/settings/add-login-users',
      },
      {
        id: '2',
        name: 'Settings',
        route: '/settings',
      },
      {
        id: '3',
        name: 'Website Settings',
        route: '/settings/website-settings',
      },
    ],
  },
  {
    id: '11',
    name: 'Help',
    route: '/help',
    icon: 'IoMdHelp',
    subMenu: [
      {
        id: '1',
        name: 'Video Tutorial',
        route: '/help/videos',
      },

       {
        id: '2',
        name: 'Support Tickets',
        route: '/help/support-tickets',
      },
    ],
  },
];
