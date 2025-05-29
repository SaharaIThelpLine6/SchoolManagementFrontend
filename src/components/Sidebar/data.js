export const menuData = [
  {
    id: "1",
    name: "Dashboard",
    route: "/",
    subMenu: false,
    icon: "FaHome",
  },
  {
    id: "2",
    name: "User",
    route: "/usersinfo",
    subMenu: false,
    icon: "FaUsers",
  },
  {
    id: "3",
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
        name: "Student Admission",
        route: "/students/admission",
      },
      {
        id: "5",
        name: "English Name",
        route: "/students/english-name",
      },
      {
        id: "6",
        name: "Arobi Name",
        route: "/students/arobi-name",
      },
      {
        id: "7",
        name: "Book List",
        route: "/students/booklist",
      },
      {
        id: "8",
        name: "Student Group Setting",
        route: "/students/group-setting",
      },
      {
        id: "9",
        name: "Student ID card",
        route: "/students/id-card",
      },
      {
        id: "10",
        name: "ID Card Print",
        route: "/students/id-print",
      },
      {
        id: "11",
        name: "All Students",
        route: "/students",
      },
      {
        id: "13",
        name: "Group Distribution",
        route: "/students/groupdistribution",
      },

      {
        id: "14",
        name: "Section",
        route: "/students/section",
      },
      {
        id: "16",
        name: "Students Report",
        route: "/students/report",
      },
      {
        id: "17",
        name: "Student Vacation",
        route: "/students/vacation",
      },
      {
        id: "18",
        name: "Type of vacation",
        route: "/students/vacation/type-of-vacation",
      },
    ],
  },
  {
    id: "4",
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
    id: "5",
    name: "Exam",
    route: "/exam",
    icon: "PiExam",
    subMenu: [
      {
        id: "1",
        name: "Result 1",
        route: "/result-1",
        subMenu: false,
      },
    
    ],
  },
  {
    id: "6",
    name: "Result",
    route: "/result",
    icon: "GiGraduateCap",
    subMenu: [
      {
        id: "1",
        name: "Result 1",
        route: "/result-1",
        subMenu: false,
      },
     
    ],
  },
  {
    id: "7",
    name: "Board Exam",
    route: "/board-exam",
    icon: "LiaSchoolSolid",
    subMenu: [
      {
        id: "1",
        name: "Board Exam 1",
        route: "/board-exam-1",
        subMenu: false,
      },
      
    ],
  },
  {
    id: "8",
    name: "Darul Ikama",
    route: "/darul-ikama",
    icon: "RiSchoolFill",
    subMenu: [
      {
        id: "1",
        name: "Darul Ikama 1",
        route: "/darul-ikama",
        subMenu: false,
      },
     
    ],
  },
  {
    id: "9",
    name: "Accounting",
    route: "/accounting",
    icon: "FaCalculator",
    subMenu: [
      {
        id: "1",
        name: "Acccounting 1",
        route: "/accounting",
        subMenu: false,
      },
    ],
  },
  {
    id: "10",
    name: "Donation",
    route: "/donation",
    icon: "FaDonate",
    subMenu: [
      {
        id: "1",
        name: "Donation 1",
        route: "/donation",
        subMenu: false,
      },
    ],
  },
  {
    id: "11",
    name: "Library",
    route: "/library",
    icon: "ImLibrary",
    subMenu: [
      {
        id: "1",
        name: "Library 1",
        route: "/library",
        subMenu: false,
      },
     
    ],
  },
  {
    id: "12",
    name: "Others",
    route: "/others",
    icon: "HiDotsCircleHorizontal",
    subMenu: [
      {
        id: "1",
        name: "Others 1",
        route: "/others",
        subMenu: false,
      },
    ],
  },
  {
    id: "13",
    name: "Settings",
    route: "/settings",
    icon: "IoMdSettings",
    subMenu: [
      {
        id: "1",
        name: "Institution Information",
        route: "/settings",
        subMenu: false,
      },
      {
        id: "2",
        name: "Month Name",
        route: "/settings/month-name-list",
        subMenu: false,
      },
    ],
  },
  {
    id: "14",
    name: "Help",
    route: "/help",
    icon: "IoMdHelp",
    subMenu: [
      {
        id: "1",
        name: "Help 1",
        route: "/help-1",
        subMenu: false,
      },
    ],
  },
];

// {
//   label: "Staff",
//   icon: "TbIdBadge2",
//   path: "/staff",
//   subMenu: [
//     { label: "Teacher Info", path: "/staff/teacherinfo" },
//     { label: "Non Teaching Staff", path: "/staff/nonteaching" },
//     { label: "Staff Attendance", path: "/staff/attendance" },
//     { label: "Leave Request", path: "/staff/leave" },
//     { label: "Assign Role", path: "/staff/assign-role" },
//   ],
// },
// {
//   label: "Exam",
//   icon: "TbNotes",
//   path: "/exam",
//   subMenu: [
//     { label: "Exam List", path: "/exam/list" },
//     { label: "Admit Card", path: "/exam/list" },
//   ],
// },
// {
//   label: "Board",
//   icon: "TbBuilding",
//   path: "/board",
//   subMenu: [
//     { label: "Add Board", path: "/board/add" },
//     { label: "Board List", path: "/board/list" },
//   ],
// },
// {
//   label: "Result",
//   icon: "TbFileAnalytics",
//   path: "/result",
//   subMenu: [
//     { label: "Add Result", path: "/result/add" },
//     { label: "Result List", path: "/result/list" },
//   ],
// },
// {
//   label: "Library",
//   icon: "TbBooks",
//   path: "/library",
//   subMenu: [
//     { label: "Add Book", path: "/library/add" },
//     { label: "Book List", path: "/library/list" },
//   ],
// },
// {
//   label: "Others",
//   icon: "TbDotsCircleHorizontal",
//   path: "/others",
//   subMenu: [
//     { label: "Add Class", path: "/others/add-class" },
//     { label: "Add Section", path: "/others/add-section" },
//     { label: "Subject", path: "/others/subject" },
//   ],
// },
