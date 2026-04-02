import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { verifyUser } from "../features/auth/authSlice";
// import { verifyUser } from "../redux/slices/authSlice"; // adjust path

const OwenGuide = ({ children }) => {
  const { user, token, status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // If we have a token but no user yet, verify the token
    if (token && !user && status === 'idle') {
      dispatch(verifyUser(token));
    }
  }, [token, user, status, dispatch]);

  // Still loading — don't redirect yet
  if (status === 'loading' || (token && !user && status === 'idle')) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!user?.permissionType) {
    return <Navigate to="/login" replace />;
  }

  if (typeof user.permissionType === "number" && user.permissionType > 4) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default OwenGuide;