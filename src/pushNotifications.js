// export async function subscribeUser() {
//   if (!("serviceWorker" in navigator)) {
//     alert("Service workers are not supported by your browser.");
//     return;
//   }

//   const register = await navigator.serviceWorker.register("/sw.js");

//   const subscription = await register.pushManager.subscribe({
//     userVisibleOnly: true,
//     applicationServerKey: "BJZMT1l9F8RfpwtCwL_TieUNZgeNXxX0BYgUqyQxw6797ZPEaaG9iuTIRFPSTG_Y2McRixRKq5qDOKcrsK2wliU"
//   });

//   await fetch("http://10.11.13.250:3000/subscribe", {
//     method: "POST",
//     body: JSON.stringify(subscription),
//     headers: { "Content-Type": "application/json" }
//   });

//   // alert("You are subscribed for notifications!");
// }
const API_URL = import.meta.env.VITE_SERVER_URL;

export async function subscribeUser() {
  
  console.log("subscrbe user");
  
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
    return;
  }
  
  if (!("serviceWorker" in navigator)) {
    console.log("Service workers are not supported by your browser.");
    return;
  }
  const permission = Notification.permission;
  if (permission === "granted") {
    console.log("Notifications already enabled.");
    return;
  }
  
  if (permission === "denied") {
    console.log("Notifications were previously denied.");
    return;
  }
  try {
    const register = await navigator.serviceWorker.register("/sw.js");
    
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: "BM3sD-RZ1a2XI11xcfffRIffkwFo04KnAsgJFPFJepv0-it8BnFC89ksOqg_BIWyXgwHCx3UZXaCdwZtroO4PjQ"
    });

    await fetch(`${API_URL}/subscribe`, {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: { "Content-Type": "application/json" }
    });

    console.log("Successfully subscribed for notifications!");
  } catch (error) {
    console.error("Failed to subscribe:", error);
  }
}