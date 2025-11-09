self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Cerita Baru!",
      body: "Klik untuk lihat cerita terbaru.",
      url: "/#/detail/123",
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/images/icon-192.png",
      badge: "/images/icon-192.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client)
          return client.focus();
      }
      return clients.openWindow(targetUrl);
    })
  );
});
