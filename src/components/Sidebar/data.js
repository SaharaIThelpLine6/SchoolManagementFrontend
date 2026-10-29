export const menuData = [
  {
    id: '1',
    name: 'General Information',
    route: 'general-info',
    icon: 'LuWarehouse',
    subMenu: [
      {
        id: '1',
        name: 'Dashboard',
        // route: '/',
        route: '/dashboard',
        icon: 'SubDashboard'
      },
      {
        id: '2',
        name: 'New User',
        route: 'general-info/users-info',
        icon: 'SubUser'
      },
      {
        id: '3',
        name: 'Month Name',
        route: 'general-info/month-name-list',
        subMenu: false,
        icon: 'SubCalendar'
      },
      // {
      //   id: '4',
      //   name: 'All Madrasah',
      //   route: 'general-info/all-madrasah',
      //   subMenu: false,
      // },
      {
        id: '5',
        name: 'Institution Information',
        route: 'general-info/institution-info',
        subMenu: false,
        icon: 'SubBuilding'
      },
      {
        id: '6',
        name: 'RFID Card',
        route: 'general-info/rfid-card',
        subMenu: false,
        icon: 'SubCard'
      },

      {
        id: '7',
        name: 'User Image',
        route: 'general-info/user-image',
        subMenu: false,
        icon: 'SubImage'
      },
      {
        id: '8',
        name: 'Bulk Image',
        route: 'general-info/bulk-image',
        subMenu: false,
        icon: 'SubImage'
      },
      {
        id: '9',
        name: 'SMS',
        route: 'general-info/sms',
        icon: 'SubMessage'
      },
      {
        id: '10',
        name: 'User Reports',
        route: 'general-info/user-reports',
        icon: 'SubReport'
      },
    ],
  },
  {
    id: '2',
    name: 'Student',
    route: 'students',
    icon: 'PiStudentBold',
    subMenu: [
      {
        id: '1',
        name: 'Session',
        route: 'students/sessions',
        icon: 'SubCalendar',
      },
      {
        id: '2',
        name: 'Class',
        route: 'students/class',
        icon: 'SubBook',
      },
      {
        id: '3',
        name: 'Sub Class',
        route: 'students/section',
        icon: 'SubGroup',
      },
      {
        id: '4',
        name: 'Students Admission',
        route: 'students',
        icon: 'SubUser',
      },
      {
        id: '5',
        name: 'English & Arobi Name',
        route: 'students/english-arobi-name',
        icon: 'SubForm',
      },
      {
        id: '6',
        name: 'Book',
        route: 'students/book-list',
        icon: 'SubBook',
      },
      {
        id: '7',
        name: 'Group Distribution',
        route: 'students/group-distribution',
        icon: 'SubGroup',
      },
      {
        id: '8',
        name: 'Data Export',
        route: 'students/data-export',
        icon: 'SubExport',
      },
      {
        id: '9',
        name: 'Certificate of Attestation',
        route: 'students/certificate-of-attestation',
        icon: 'SubCertificate',
      },
      {
        id: '10',
        name: 'Students Report (Demo)',
        route: 'students/report',
        icon: 'SubReport',
      },
      {
        id: '11',
        name: 'Online Admission',
        route: 'students/online-admission',
        icon: 'SubUser',
      },
      {
        id: '12',
        name: 'Student ID Card',
        route: 'students/student-id-card',
        icon: 'SubIdCard',
      },
      {
        id: '13',
        name: 'Students Report List',
        route: 'students/report_list',
        icon: 'SubReport',
      },
    ],
  },
  // {
  //   id: '3',
  //   name: 'User Attendance',
  //   route: '/user-attendence',
  //   icon: 'PiStudentBold',
  //   subMenu: [
  //     {
  //       id: '1',
  //       name: 'List Create',
  //       route: '/user-attendence',
  //     },
  //     {
  //       id: '2',
  //       name: 'Time Settings',
  //       route: '/user-attendence/time-settings',
  //     },
  //     {
  //       id: '3',
  //       name: 'Message Settings',
  //       route: '/user-attendence/message-settings',
  //     },
  //     {
  //       id: '4',
  //       name: 'Holiday And Leave',
  //       route: '/user-attendence/holiday-and-leave',
  //     },
  //     {
  //       id: '5',
  //       name: 'Reports',
  //       route: '/user-attendence/reports',
  //     },
  //     {
  //       id: '6',
  //       name: 'Absence List',
  //       route: '/user-attendence/absence-list',
  //     },
  //   ]
  // },
  {
    id: '4',
    name: 'Parent Panel',
    route: 'parent-panel',
    icon: 'FaUsers',
    subMenu: [
      {
        id: '1',
        name: 'Class Routine',
        route: 'parent-panel',
        icon: 'SubRoutine',
      },
      {
        id: '2',
        name: 'Class Video',
        route: 'parent-panel/class-video',
        icon: 'SubVideo',
      },
      {
        id: '3',
        name: 'Home Work',
        route: 'parent-panel/home-work',
        icon: 'SubTask',
      },
      {
        id: '4',
        name: 'Home Work Teacher Group',
        route: 'parent-panel/home-work-group',
        icon: 'SubGroup',
      },
      {
        id: '5',
        name: 'Student Complaints',
        route: 'parent-panel/student-complaint',
        icon: 'SubComplaint',
      },
      {
        id: '6',
        name: 'Complaint Box Terms and Conditions',
        route: 'parent-panel/complaint-box-terms-and-conditions',
        icon: 'SubRules',
      },
      // {
      //   id: '7',
      //   name: 'Online Admission',
      //   route: '/parent-panel/online-admission',
      // },
      {
        id: '8',
        name: 'User Notice',
        route: 'parent-panel/user-notice',
        icon: 'SubNotice',
      },
      {
        id: '9',
        name: 'User Attendance',
        route: 'parent-panel/user-attendance',
        icon: 'SubUser',
      }
    ],
  },
  {
    id: "3",
    name: "Teacher Staff",
    route: "teacherinfo",
    icon: "IoIosPeople",
    subMenu: [
      {
        id: "1",
        name: "Teacher Info",
        route: "teacherinfo",
        subMenu: false,
        icon: 'SubUser',
      },
      // {
      //   id: "2",
      //   name: "Pay-role Heading",
      //   route: "/teacherinfo/payRole",
      //   subMenu: false,
      // },
      // {
      //   id: "3",
      //   name: "Pay-role Name",
      //   route: "/teacherinfo/pRName",
      //   subMenu: false,
      // },
      // {
      //   id: "4",
      //   name: "Reports",
      //   route: "/teacherinfo/report",
      //   subMenu: false,
      // },
      // {
      //   id: "5",
      //   name: "Designation",
      //   route: "/teacherinfo/designation",
      //   subMenu: false,
      // },
    ],
  },
  {
    id: '5',
    name: 'Exam',
    route: '/exam',
    icon: 'PiExam',
    subMenu: [
      {
        id: '1',
        name: 'Exam Name',
        route: 'exam',
        icon: 'SubExam',
      },
      {
        id: '2',
        name: 'Exam Fee Determine',
        route: 'exam/fee-determine',
        icon: 'SubFee',
      },
      {
        id: '3',
        name: 'Exam Condition',
        route: 'exam/exam-condition',
        icon: 'SubRules',
      },
      // {
      //   id: '5',
      //   name: 'List of Candidates',
      //   route: '/exam/list-of-candidates',
      // },
      {
        id: '4',
        name: 'Exam Student List',
        route: 'exam/exam-student-list',
        icon: 'SubUser',
      },
      {
        id: '5',
        name: 'Exam Group Select',
        route: 'exam/exam-group-create',
        icon: 'SubGroup',
      },
      // {
      //   id: '6',
      //   name: 'Talent Condition',
      //   route: '/exam/talent-condition',
      // },
      {
        id: '6',
        name: 'Admit Card',
        route: 'exam/admit-card',
        icon: 'SubIdCard',
      },
      {
        id: '7',
        name: 'Exam Rules',
        route: 'exam/rules',
        icon: 'SubRules',
      },
      {
        id: '8',
        name: 'Set Exam Room',
        route: 'exam/exam-hallist',
        icon: 'SubBuilding',
      },
      {
        id: '9',
        name: 'Exam Seat plan',
        route: 'exam/exam-setplan',
        icon: 'SubGroup',
      },
      {
        id: '10',
        name: 'Exam Routing Create',
        route: 'exam/routing',
        icon: 'SubRoutine',
      },
      // {
      //   id: '11',
      //   name: 'Exam Report Demo',
      //   route: 'exam/report-demo',
      // },
      {
        id: '12',
        name: 'Exam Report',
        route: 'exam/report',
        icon: 'SubReport',
      },
    ],
  },
  {
    id: '6',
    name: 'Result',
    route: 'result',
    icon: 'GiGraduateCap',
    subMenu: [
      {
        id: '1',
        name: 'Teacher Subject Assign',
        route: 'result/teacher_asign_subject',
        icon: 'SubUser',
      },
      {
        id: '2',
        name: 'Result Entry',
        route: 'result',
        icon: 'SubResult',
      },
      {
        id: '7',
        name: 'Result Publish',
        route: 'result/result-publish',
      },
      {
        id: '3',
        name: 'Mark Sheet',
        route: 'result/mark-sheet',
        icon: 'SubForm',
      },
      {
        id: '4',
        name: 'SMS Results Public',
        route: 'result/publication-results-sms',
        icon: 'SubSms',
      },
      {
        id: '5',
        name: 'Admission Form',
        route: 'result/admission_form',
        icon: 'SubForm',
      },
      {
        id: '6',
        name: 'Result Report',
        route: 'result/report',
        icon: 'SubReport',
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
  //   
  {
    id: '7',
    name: 'Darul Ikama',
    route: '/darul-ikama',
    icon: 'RiSchoolFill',
    subMenu: [
      {
        id: '1',
        name: 'Character Report',
        route: 'darul-ikama',
        icon: 'SubCharacter',
      },
      {
        id: '2',
        name: 'List Of Expelled Students',
        route: 'darul-ikama/list-of-expelled',
        icon: 'SubDelete',
      },
      {
        id: '3',
        name: 'Gate pass and leave',
        route: 'darul-ikama/vacation',
        icon: 'SubGatePass',
      },
    ],
  },
  {
    id: '8',
    name: 'Accounting',
    route: 'accounting',
    icon: 'FaCalculator',
    subMenu: [
      {
        id: '1',
        name: 'Deposit Costs',
        route: 'accounting',
        icon: 'SubMoney',
      },
      {
        id: '2',
        name: 'Deposit Costs Report',
        route: 'accounting/income-expense-report',
        icon: 'SubReport',
      },
      {
        id: '3',
        name: 'Fee Setting',
        route: 'accounting/fee-setting',
        icon: 'SubSettings',
      },
      {
        id: '4',
        name: 'Student Fee Collection',
        route: 'accounting/student-fee-collection',
        icon: 'SubFee',
      },
      {
        id: '5',
        name: 'Dues List',
        route: 'accounting/dues-list',
        icon: 'SubDues',
      },
      {
        id: '6',
        name: 'Monthly Dues',
        route: 'accounting/monthly-dues',
        icon: 'SubDues',
      },
      {
        id: '7',
        name: 'Fee Collection Report',
        route: 'accounting/fee-collection-report',
        icon: 'SubReport',
      },
      {
        id: '8',
        name: 'Balance Transfer',
        route: 'accounting/balance-transfer',
        icon: 'SubTransfer',
      },
      {
        id: '9',
        name: 'Delete Edit Record',
        route: 'accounting/delete-edit-record',
        icon: 'SubDelete',
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
        route: 'checkout',
        icon: 'SubPayment',
      },
      {
        id: '2',
        name: 'Payment History',
        route: 'payment-history',
        icon: 'SubReport',
      },
      // {
      //   id: '3',
      //   name: 'Maddrasah Payment Info',
      //   route: '/payment-history/maddrasah-payment-info',
      // },
      {
        id: '4',
        name: 'Online Payment Invoice',
        route: 'payment-history/online-payment-invoice',
        icon: 'SubDocument',
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
        route: 'settings/add-login-users',
        icon: 'SubRole',
      },
      {
        id: '2',
        name: 'Settings',
        route: 'settings',
        icon: 'SubSettings',
      },
      {
        id: '3',
        name: 'Website Settings',
        route: 'settings/website-settings',
        icon: 'SubWebsite',
      },
      {
        id: '4',
        name: 'Document Settings',
        route: 'settings/document-settings',
        icon: 'SubDocument',
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
        route: 'help/videos',
        icon: 'SubTutorial',
      },
      {
        id: '2',
        name: 'Feedback & Suggestions',
        route: 'help/support-tickets',
        icon: 'SubFeedback',
      },
    ],
  },
];
