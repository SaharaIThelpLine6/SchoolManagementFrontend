export const menuData = [
  {
    id: "1",
    name: "General Information",
    route: "/general-info",
    icon: "LuWarehouse",
    subMenu: [
      {
        id: "1",
        name: "Dashboard",
        route: "/",
      },
      {
        id: "2",
        name: "User",
        route: "/general-info/users-info",
      },
      {
        id: "3",
        name: "User Reports",
        route: "/general-info/user-reports",
      },
      {
        id: "4",
        name: "SMS",
        route: "/general-info/sms",
      },
      {
        id: "5",
        name: "Institution Information",
        route: "/general-info/institution-info",
        subMenu: false,
      },
      {
        id: "6",
        name: "Month Name",
        route: "/general-info/month-name-list",
        subMenu: false,
      },
    ],
  },
  {
    id: "2",
    name: "Student",
    route: "/students",
    icon: "PiStudentBold",
    subMenu: [
      {
        id: "1",
        name: "Session",
        route: "/students/sessions",
      },
      {
        id: "2",
        name: "Class",
        route: "/students/class",
      },
      {
        id: "3",
        name: "English & Arobi Name",
        route: "/students/english-arobi-name",
      },
      {
        id: "4",
        name: "Book",
        route: "/students/book-list",
      },
      {
        id: "6",
        name: "Data Export",
        route: "/students/data-export",
      },
      {
        id: "7",
        name: "All Students",
        route: "/students",
      },
      {
        id: "8",
        name: "Group Distribution",
        route: "/students/group-distribution",
      },

      {
        id: "9",
        name: "Section",
        route: "/students/section",
      },
      {
        id: "10",
        name: "Certificate of Attestation",
        route: "/students/certificate-of-attestation",
      },
      {
        id: "11",
        name: "Students Report",
        route: "/students/report",
      },
      {
        id: "12",
        name: "Online Admission",
        route: "/students/online-admission",
      },
    ],
  },
  {
    id: "3",
    name: "Teacher Staff",
    route: "/teacherinfo",
    icon: "IoIosPeople",
    subMenu: [
      {
        id: "1",
        name: "Teacher Info",
        route: "/teacherinfo",
        subMenu: false,
      },
      {
        id: "2",
        name: "Pay-role Heading",
        route: "/teacherinfo/payRole",
        subMenu: false,
      },
      {
        id: "3",
        name: "Pay-role Name",
        route: "/teacherinfo/pRName",
        subMenu: false,
      },
      {
        id: "4",
        name: "Reports",
        route: "/teacherinfo/report",
        subMenu: false,
      },
      {
        id: "5",
        name: "Designation",
        route: "/teacherinfo/designation",
        subMenu: false,
      },
    ],
  },
  {
    id: "4",
    name: "Exam",
    route: "/exam",
    icon: "PiExam",
    subMenu: [
      {
        id: "1",
        name: "Exam",
        route: "/exam",
      },
      {
        id: "2",
        name: "Exam Fee Determine",
        route: "/exam/fee-determine",
      },
      {
        id: "3",
        name: "Point V: Condition",
        route: "/exam/point-v-condition",
      },
      {
        id: "4",
        name: "Average V: Condition",
        route: "/exam/average-v-condition",
      },
      {
        id: "5",
        name: "List of Candidates",
        route: "/exam/list-of-candidates",
      },
      {
        id: "6",
        name: "Talent Condition",
        route: "/exam/talent-condition",
      },
      {
        id: "7",
        name: "Exam Admit Card",
        route: "/exam/admit-card",
      },
      {
        id: "8",
        name: "Exam Routing",
        route: "/exam/routing",
      },
      {
        id: "9",
        name: "Exam Report",
        route: "/exam/report",
      },
    ],
  },
  {
    id: "5",
    name: "Result",
    route: "/result",
    icon: "GiGraduateCap",
    subMenu: [
      {
        id: "1",
        name: "Point Result Entry",
        route: "/result",
      },
      {
        id: "2",
        name: "Point V: Report",
        route: "/result/report",
      },
      {
        id: "3",
        name: "Point Based Mark Sheet",
        route: "/result/mark-sheet",
      },
      {
        id: "4",
        name: "Double Student D:",
        route: "/result/double-student-delete",
      },
      {
        id: "5",
        name: "Online Result Public",
        route: "/result/online-result-public",
      },
    ],
  },
  {
    id: "6",
    name: "Board Exam",
    route: "/board-exam",
    icon: "LiaSchoolSolid",
    subMenu: [],
  },
  {
    id: "7",
    name: "Darul Ikama",
    route: "/darul-ikama",
    icon: "RiSchoolFill",
    subMenu: [
      {
        id: "1",
        name: "Character Report",
        route: "/darul-ikama",
      },
      {
        id: "2",
        name: "Gate pass and leave",
        route: "/darul-ikama/vacation",
      },
    ],
  },
  {
    id: "8",
    name: "Accounting",
    route: "/accounting",
    icon: "FaCalculator",
    subMenu: [
      {
        id: "1",
        name: "Fee Setting",
        route: "/accounting",
      },
      {
        id: "2",
        name: "Student Fee Collection",
        route: "/accounting/student-fee-collection",
      },
      {
        id: "3",
        name: "Monthly Dues",
        route: "/accounting/monthly-dues",
      },
      {
        id: "4",
        name: "Fee Collection Report",
        route: "/accounting/fee-collection-report",
      },
    ],
  },
  {
    id: "9",
    name: "Payment",
    route: "/payment",
    icon: "MdOutlinePayment",
    subMenu: [
      {
        id: "1",
        name: "Payment History",
        route: "/payment-history",
      },
    ],
  },

  {
    id: "10",
    name: "Donation",
    route: "/donation",
    icon: "FaDonate",
    subMenu: [],
  },
  {
    id: "10",
    name: "Library",
    route: "/library",
    icon: "ImLibrary",
    subMenu: [],
  },
  {
    id: "11",
    name: "Others",
    route: "/others",
    icon: "HiDotsCircleHorizontal",
    subMenu: [],
  },
  {
    id: "12",
    name: "Settings",
    route: "/settings",
    icon: "IoMdSettings",
    subMenu: [],
  },
  {
    id: "13",
    name: "Help",
    route: "/help",
    icon: "IoMdHelp",
    subMenu: [],
  },

];
