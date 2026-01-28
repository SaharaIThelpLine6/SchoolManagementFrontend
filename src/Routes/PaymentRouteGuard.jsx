import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const PaymentRouteGuard = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Short delay to ensure Redux state is loaded
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking
  if (isChecking || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user || !user.permissionType) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const permissionType = user.permissionType;
  const isMadrasahPaymentInfoPath = location.pathname === "/payment-history/maddrasah-payment-info";

  // User with permissionType 1 has access to everything
  if (permissionType === 1) {
    return children;
  }

  // Madrasah payment info is only for permissionType 1
  if (isMadrasahPaymentInfoPath) {
    return <Navigate to="/" replace />;
  }

  // For other routes, check if permissionType > 1
  if (typeof permissionType === "number" && permissionType > 1) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PaymentRouteGuard;
