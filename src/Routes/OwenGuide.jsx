import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const OwenGuide = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const permissionType = user?.permissionType;

  if (!permissionType) {
    return <Navigate to="/login" replace />; // লগিন না থাকলে
  }

  // 1,2,3,4 হলে allow 5, 6, হলে not allow
 if (typeof permissionType === "number" && permissionType > 4) {
   return <Navigate to="/" replace />;
 }

  // allow
  return children;
};

export default OwenGuide;
