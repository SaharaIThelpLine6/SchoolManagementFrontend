// src/components/SocketManager.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { disconnectSocket, initSocket } from "../../helper/socket";


export default function SocketManager() {
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      console.log("Initializing socket...");
      initSocket(token);
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [token]);

  return null; // কোন UI না দেখাবে
}
