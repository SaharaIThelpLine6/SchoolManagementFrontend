import { useEffect, useState } from "react";
import { useGetSessionUserPanelQuery } from "../features/userPanel/userInfo/userInfoQuerySlice";

export const useDefaultSessionForUserPanel = () => {
  const { data: sessionData } = useGetSessionUserPanelQuery();
  const [defaultSession, setDefaultSession] = useState(null);

  useEffect(() => {
    if (sessionData && sessionData.length > 0) {
      const defaultSession = sessionData.find((s) => s.SessionStatus === 1);
      if (defaultSession) {
        setDefaultSession(defaultSession);
      }
    }
  }, [sessionData]);

  return defaultSession;
};
