// menuData.js
export const menuData = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "🏠",
    route: "/",
  },
  {
    id: "user",
    name: "Users",
    icon: "FaUsers",
    route: "/",
  },
  {
    id: "student",
    name: "Student",
    icon: "FaChalkboardTeacher",
    subMenu: [
      { id: "officiants", name: "Officiants", route: "/principal/officiants" },
      { id: "duty", name: "Duty", route: "/principal/duty" },
      {
        id: "leave",
        name: "Leave management",
        route: "/principal/leave-management",
      },
      {
        id: "report",
        name: "Officiants report",
        route: "/principal/officiants-report",
      },
      {
        id: "store",
        name: "Store management",
        route: "/principal/store-management",
      },
    ],
  },
  {
    id: "education",
    name: "Education department",
    icon: "FaGraduationCap",
    subMenu: [
      { id: "students", name: "Students", route: "/education/students" },
      { id: "teachers", name: "Teachers", route: "/education/teachers" },
    ],
  },
  {
    id: "hostel",
    name: "Hostel manager",
    icon: "FaHotel",
    subMenu: [
      { id: "rooms", name: "Rooms", route: "/hostel/rooms" },
      { id: "inventory", name: "Inventory", route: "/hostel/inventory" },
    ],
  },
  {
    id: "accounts",
    name: "Accounts department",
    icon: "FaFileInvoice",
    subMenu: [
      { id: "fees", name: "Fees", route: "/accounts/fees" },
      { id: "expenses", name: "Expenses", route: "/accounts/expenses" },
    ],
  },
];
