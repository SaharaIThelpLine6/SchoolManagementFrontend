self.addEventListener("push", event => {
  const data = event.data.json();
  console.log("=====================================");
  
  console.log(data);
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || "/saharait.png" // or your own icon
  });
});
