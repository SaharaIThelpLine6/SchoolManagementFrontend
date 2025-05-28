export const menuData = [
  {
    id: "1",
    name: "Home",
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
    icon: "FaUsers",
    subMenu: [
      {
        id: "1",
        name: "All Students",
        route: "/students",
      },
      {
        id: "2",
        name: "Book List",
        route: "/students/booklist",
      },
      {
        id: "3",
        name: "Group Distribution",
        route: "/students/groupdistribution",
      },
      {
        id: "4",
        name: "Class",
        route: "/students/class",
      },
      {
        id: "5",
        name: "Section",
        route: "/students/section",
      },
      {
        id: "6",
        name: "Session",
        route: "/students/sessions",
      },
      {
        id: "7",
        name: "Students Report",
        route: "/students/report",
      },
      {
        id: "9",
        name: "Student Vacation",
        route: "/students/vacation",
      },
      {
        id: "10",
        name: "Type of vacation",
        route: "/students/vacation/type-of-vacation",
      },
    ],
  },
  {
    id: "4",
    name: "Employee",
    route: "/teacherinfo",
    icon: "FaUsers",
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
    name: "Month name",
    route: "/month-name-list",
    subMenu: false,
    icon: "MdCalendarMonth",
  },
  {
    id: "6",
    name: "Settings",
    route: "/settings",
    subMenu: false,
    icon: "TbIdBadge2",
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
