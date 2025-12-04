import { Navigate, Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useVerifyUserPanelTokenMutation } from "../features/userPanel/userLoginVerify/userloginVerifyQuerySlice";

export default function UserPanel({ children }) {
  const token = localStorage.getItem("user_panel_token");
  console.log(token);
  
  const [verifyToken] = useVerifyUserPanelTokenMutation();
 const { schoolid } = useParams();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    async function checkToken() {
      console.log("cjheck tokwen");
      
      if (!token) {
        setLoading(false);
        setIsValid(false);
        return;
      }
      console.log("cjheck tokwen false");


      try {
      console.log("cjheck tokwen false");

        const res = await verifyToken({ token }).unwrap();
        console.log(
          "ashfdashfashfas ashfdiash fawfhasuif asfasihfas fasfh asifh as"
        );
        // console.log(res.id);
        if (res.schoolId == schoolid && res.id) {
          setIsValid(true);
        } else {
          localStorage.removeItem("user_panel_token");
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem("user_panel_token");
        setIsValid(false);
      }

      setLoading(false);
    }

    checkToken();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isValid) return <Navigate to={`/${schoolid}/login`} replace />;

  return <Outlet/>;
}
