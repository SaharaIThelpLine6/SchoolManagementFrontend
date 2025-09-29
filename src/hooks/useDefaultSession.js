import { useEffect, useState } from "react";
import { useGetSessionsQuery } from "../features/session/sessionSlice";

export const useDefaultSession = () => {
  const { data: sessionData } = useGetSessionsQuery();
  const [defaultSessionId, setDefaultSessionId] = useState(null);

  useEffect(() => {
    if (sessionData && sessionData.length > 0) {
      const defaultSession = sessionData.find((s) => s.SessionAction === 1);
      if (defaultSession) {
        setDefaultSessionId(defaultSession.SessionID);
      }
    }
  }, [sessionData]);

  return defaultSessionId;
};
