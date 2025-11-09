import "../styles/styles.css";
import App from "./pages/app";
import {
  subscribeUser,
  unsubscribeUser,
  checkSubscribed,
} from "./utils/pushManager";
import { IdbStories } from "./data/idb";

function getUser() {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({ content: document.querySelector("#main-content") });

  // 🔹 Elemen DOM
  const loginBtn = document.querySelector("#loginBtn");
  const logoutBtn = document.querySelector("#logoutBtn");
  const subscribeBtn = document.getElementById("subscribeBtn");
  const unsubscribeBtn = document.getElementById("unsubscribeBtn");

  // 🔹 Update tampilan tombol login/logout
  function updateAuthButtons() {
    const user = getUser();
    if (loginBtn) loginBtn.style.display = user ? "none" : "inline-block";
    if (logoutBtn) logoutBtn.style.display = user ? "inline-block" : "none";
  }

  if (loginBtn)
    loginBtn.addEventListener("click", () => (window.location.hash = "/login"));
  if (logoutBtn)
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      alert("Berhasil logout!");
      updateAuthButtons();
      window.location.hash = "/";
    });

  // 🔹 Service Worker + Push Notifications
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("/service-worker.js");
    const subscribed = await checkSubscribed();

    if (subscribeBtn)
      subscribeBtn.style.display = subscribed ? "none" : "inline-block";
    if (unsubscribeBtn)
      unsubscribeBtn.style.display = subscribed ? "inline-block" : "none";

    if (subscribeBtn) {
      subscribeBtn.addEventListener("click", async () => {
        if ((await Notification.requestPermission()) !== "granted") {
          return alert("Izinkan notifikasi terlebih dahulu di browser!");
        }
        await subscribeUser();
        subscribeBtn.style.display = "none";
        if (unsubscribeBtn) unsubscribeBtn.style.display = "inline-block";
      });
    }

    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener("click", async () => {
        await unsubscribeUser();
        unsubscribeBtn.style.display = "none";
        if (subscribeBtn) subscribeBtn.style.display = "inline-block";
      });
    }
  }

  // 🔹 Offline Sync
  window.addEventListener("online", async () => {
    const pending = await IdbStories.getPending();
    const user = getUser();

    if (pending.length > 0 && user?.token) {
      for (const item of pending) {
        await fetch("https://story-api.dicoding.dev/v1/stories", {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
          body: JSON.stringify(item),
        });
      }
      await IdbStories.clearPending();
      await app.renderPage();
    }
  });

  // 🔹 Render halaman awal & update tombol
  updateAuthButtons();
  await app.renderPage();
  window.addEventListener("hashchange", async () => {
    await app.renderPage();
    updateAuthButtons();
  });

  // 🔹 PWA Install Prompt (opsional)
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installBtn = document.getElementById("installBtn");
    if (installBtn) {
      installBtn.style.display = "inline-block";
      installBtn.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log("User response:", outcome);
        deferredPrompt = null;
        installBtn.style.display = "none";
      });
    }
  });
});
