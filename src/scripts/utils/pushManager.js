const VAPID_PUBLIC_KEY =
  "BPLpYqU6vVRnGoE2YtKQZ8pgZ0c0QOyz6qL-2WQ9r2PqKZCfjxRct8e3hcz7L5eQh8qE5qzGplG8KcQ1hV-RzL8";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribeUser() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // Sementara: tampilkan di console
  console.log("🔔 Subscription berhasil:", subscription);

  return subscription;
}

export async function unsubscribeUser() {
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  if (sub) return sub.unsubscribe();
}

export async function checkSubscribed() {
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  return sub !== null;
}
