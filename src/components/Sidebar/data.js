export const menuData = [
  {
    id: "dashboard",
    name: "ড্যাশবোর্ড",
    icon: "FaHome",
    route: "/",
  },
  {
    id: "userInfo",
    name: "সাধারণ তথ্য",
    icon: "FaUsers",
    subMenu: [
      {
        id: "students",
        name: "Students",
        route: "/new/students",
      },
      {
        id: "manageNameUser",
        name: "নতুন ব্যবহারকারী তথ্য",
        route: "/user/manage-name",
      },
      {
        id: "monthNameUser",
        name: "মাসের নাম",
        route: "/user/all-manager-info",
      },
      {
        id: "allMadrasaInfo",
        name: "সকল মাদ্রাসার তথ্য",
        route: "/user/all-madrasa-info",
      },
    ],
  },
  {
    id: "executiveInfo",
    name: "শিক্ষর্থী তথ্য",
    icon: "FaChalkboardTeacher",
    subMenu: [
      {
        id: "teachers",
        name: "Teachers",
        route: "/new/teachers",
      },
      {
        id: "classDuty",
        name: "জামাত/ক্লাস",
        route: "/executive/duty",
      },
      {
        id: "classGroupSession",
        name: "ক্লাস গ্রুপ/সেশন",
        route: "/executive/group-session",
      },
      {
        id: "studentAdmission",
        name: "শিক্ষর্থী ভর্তি",
        route: "/executive/student-admission",
      },
      {
        id: "executiveDashboard",
        name: "ড্যাশবোর্ড",
        route: "/executive/dashboard",
      },
      {
        id: "newUserInfoExec",
        name: "নতুন ব্যবহারকারী তথ্য",
        route: "/executive/new-user-info",
      },
      {
        id: "monthNameExec",
        name: "মাসের নাম",
        route: "/executive/month-name",
      },
    ],
  },
  {
    id: "financial",
    name: "আর্থিক তথ্য",
    icon: "FaMoneyCheckAlt",
    subMenu: [
      {
        id: "monthlyReports",
        name: "মাসিক রিপোর্ট",
        route: "/finance/monthly-reports",
      },
      {
        id: "studentFees",
        name: "শিক্ষার্থীর ফি",
        route: "/finance/student-fees",
      },
    ],
  },
  {
    id: "library",
    name: "লাইব্রেরি",
    icon: "FaBook",
    subMenu: [
      {
        id: "allBooks",
        name: "সকল বই",
        route: "/library/books",
      },
      {
        id: "issueBook",
        name: "বই ইস্যু",
        route: "/library/issue",
      },
    ],
  },
  {
    id: "attendance",
    name: "হাজিরা",
    icon: "FaCalendarCheck",
    subMenu: [
      {
        id: "studentAttendance",
        name: "শিক্ষার্থী হাজিরা",
        route: "/attendance/students",
      },
      {
        id: "teacherAttendance",
        name: "শিক্ষক হাজিরা",
        route: "/attendance/teachers",
      },
    ],
  },
  {
    id: "hostel",
    name: "হোস্টেল ব্যবস্থাপনা",
    icon: "FaBed",
    subMenu: [
      {
        id: "roomAllocation",
        name: "রুম বরাদ্দ",
        route: "/hostel/allocation",
      },
      {
        id: "hostelRules",
        name: "হোস্টেলের নিয়ম",
        route: "/hostel/rules",
      },
    ],
  },
  {
    id: "exam",
    name: "পরীক্ষা ব্যবস্থাপনা",
    icon: "FaClipboardList",
    subMenu: [
      {
        id: "examSchedule",
        name: "পরীক্ষার সময়সূচি",
        route: "/exam/schedule",
      },
      {
        id: "resultEntry",
        name: "ফলাফল এন্ট্রি",
        route: "/exam/result-entry",
      },
    ],
  },
  {
    id: "settings",
    name: "সেটিংস",
    icon: "FaCog",
    route: "/settings",
  },
  {
    id: "support",
    name: "সাপোর্ট / সহায়তা",
    icon: "FaQuestionCircle",
    route: "/support",
  },
];
