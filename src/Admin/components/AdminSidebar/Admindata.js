export const AdminmenuData = [
  {
    id: '1',
    name: 'Admin Dashboard',
    route: '/admin/dashboard',
    icon: 'LuWarehouse',
  },
  {
    id: '2',
    name: 'All Madrasah',
    route: '/admin/all-madrasah',
    icon: 'LuWarehouse',
  },
  {
    id: '3',
    name: 'Payment Info',
    route: '/Payment-info',
    icon: 'LuWarehouse',
    subMenu: [
      {
        id: '1',
        name: 'ssl comerce',
        route: '/admin/ssl-comerce',
        icon: 'LuWarehouse',
        subMenu: false,
      },
      {
        id: '2',
        name: 'All Maddrasah Payment History',
        route: '/admin/maddrasah-payment-history',
        icon: 'LuWarehouse',
        subMenu: false,
      },
    ],
  },
  {
    id: '4',
    name: 'Exam',
    route: '/Exam',
    icon: 'LuWarehouse',
    subMenu: [
      {
        id: '1',
        name: 'Query Manage',
        route: '/admin/query-manage',
        icon: 'LuWarehouse',
        subMenu: false,
      },
    ],
  },

];
