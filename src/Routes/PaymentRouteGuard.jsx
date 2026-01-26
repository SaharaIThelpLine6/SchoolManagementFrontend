import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PaymentRouteGuard = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const permissionType = user?.permissionType;

  if (!permissionType) {
    return <Navigate to="/login" replace />; // লগিন না থাকলে
  }

  // 1 হলে allow 5, 6, হলে not allow
 if (typeof permissionType === "number" && permissionType > 1) {
   return <Navigate to="/" replace />;
 }

  // allow
  return children;
};

export default PaymentRouteGuard;
