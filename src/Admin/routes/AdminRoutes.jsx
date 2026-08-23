// src/Admin/routes/AdminRoutes.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../layout/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import AdminAllMadrasah from "../pages/AdminAllMadrasah";
import AdminAllMaddrasahPaymentInfo from "../pages/AdminAllMaddrasahPaymentInfo";
import AdminAllMaddrasahPaymentHistory from "../pages/AdminAllMaddrasahPaymentHistory";

const ProtectedRoute = () => {
  const { token, user } = useSelector((state) => state.auth);

  // টোকেন না থাকলে লগইন পেজে পাঠান
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // পারমিশন চেক: permissionType > 4 হলে অ্যাডমিনে access নেই
  if (typeof user?.permissionType === "number" && user.permissionType > 4) {
    return <Navigate to="/" replace />;
  }

  // সব ঠিক থাকলে children রেন্ডার করুন
  return <Outlet />;
};

const AdminRoutes = [
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin/dashboard", element: <AdminDashboard /> },
          { path: "/admin/all-madrasah", element: <AdminAllMadrasah /> },
          { path: "/admin/ssl-comerce", element: <AdminAllMaddrasahPaymentInfo /> },
          { path: "/admin/maddrasah-payment-history", element: <AdminAllMaddrasahPaymentHistory /> },
        ],
      },
    ],
  },
];

export default AdminRoutes;
