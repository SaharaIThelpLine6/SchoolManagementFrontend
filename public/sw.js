self.addEventListener("push", event => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/saharait.png" // or your own icon
  });
});
