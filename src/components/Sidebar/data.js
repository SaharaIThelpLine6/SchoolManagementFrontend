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
        name: "Class Group",
        route: "/students/class-group",
      },
      {
        id: "4",
        name: "English & Arobi Name",
        route: "/students/english-arobi-name",
      },
      {
        id: "5",
        name: "Book List",
        route: "/students/book-list",
      },
      {
        id: "6",
        name: "Student Group Setting",
        route: "/students/group-setting",
      },
      {
        id: "7",
        name: "Student ID card",
        route: "/students/id-card",
      },
      {
        id: "8",
        name: "ID Card Print",
        route: "/students/id-print",
      },
      {
        id: "9",
        name: "All Students",
        route: "/students",
      },
      {
        id: "10",
        name: "Group Distribution",
        route: "/students/group-distribution",
      },

      {
        id: "11",
        name: "Section",
        route: "/students/section",
      },
      {
        id: "12",
        name: "Students Report",
        route: "/students/report",
      },
      {
        id: "13",
        name: "Student Vacation",
        route: "/students/vacation",
      },
      {
        id: "14",
        name: "Type of vacation",
        route: "/students/vacation/type-of-vacation",
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

    ],
  },
  {
    id: "5",
    name: "Result",
    route: "/result",
    icon: "GiGraduateCap",
    subMenu: [
      
    ],
  },
  {
    id: "6",
    name: "Board Exam",
    route: "/board-exam",
    icon: "LiaSchoolSolid",
    subMenu: [
     
    ],
  },
  {
    id: "7",
    name: "Darul Ikama",
    route: "/darul-ikama",
    icon: "RiSchoolFill",
    subMenu: [
    
    ],
  },
  {
    id: "8",
    name: "Accounting",
    route: "/accounting",
    icon: "FaCalculator",
    subMenu: [
      
    ],
  },
  {
    id: "9",
    name: "Donation",
    route: "/donation",
    icon: "FaDonate",
    subMenu: [
     
    ],
  },
  {
    id: "10",
    name: "Library",
    route: "/library",
    icon: "ImLibrary",
    subMenu: [
     
    ],
  },
  {
    id: "11",
    name: "Others",
    route: "/others",
    icon: "HiDotsCircleHorizontal",
    subMenu: [
    
    ],
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
    subMenu: [
     
    ],
  },
];
