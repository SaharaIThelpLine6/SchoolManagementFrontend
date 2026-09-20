import { io } from "socket.io-client";

let socket = null;
let pingInterval = null;

// Browser-safe environment variable (Vite example)
const BackendUrl = import.meta.env.VITE_SERVER_URL;

export const initSocket = (token) => {
  if (!socket) {
    if (!token) {
      console.error("⚠️ Token missing");
      return null;
    }

    console.log("🔄 Connecting socket to", BackendUrl);

    socket = io(BackendUrl, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    // On connect
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);

      // Send initial ping
      socket.emit("ping");

      // Auto ping every 30 seconds
      if (!pingInterval) {
        pingInterval = setInterval(() => {
          if (socket.connected) {
            socket.emit("ping");
            console.log("🔁 Ping sent");
          }
        }, 30000);
      }
    });

    // Pong received from server
    socket.on("pong", () => {
      console.log("🔁 Pong received from server");
    });

    // User status updates from server
    socket.on("userStatusUpdate", ({ userId, status }) => {
      console.log(`👤 User ${userId} is now ${status ? "Online" : "Offline"}`);
    });

    // Connection errors
    socket.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
    });

    // Disconnect handling
    socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected:", reason);
      // Stop ping interval on disconnect
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
    });
  }

  return socket;
};

export const updateResultCell = (payload) => {
  if (!socket?.connected) {
    return Promise.reject(new Error("Result socket is not connected"));
  }
  return new Promise((resolve, reject) => {
    console.log(payload);
    socket.emit("update_result_cell", payload, (response) => {
      if (response?.success) resolve(response);
      else reject(new Error(response?.message || "Could not save result cell"));
    });
  });
};

// Optional: manually disconnect
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    console.log("🛑 Socket disconnected manually");
  }
};
