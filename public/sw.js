// Service Worker for PWA functionality
const CACHE_NAME = "habit-tracker-v1";
const urlsToCache = [
  "/",
  "/habits",
  "/analytics",
  "/profile",
  "/sign-in",
  "/sign-up",
  "/manifest.json",
  // Add other static assets
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline habit tracking
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync offline habit data when connection is restored
  try {
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
      await clearOfflineData();
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

async function getOfflineData() {
  // Get offline habit entries from IndexedDB
  return new Promise((resolve) => {
    const request = indexedDB.open("HabitTrackerDB", 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["habitEntries"], "readonly");
      const store = transaction.objectStore("habitEntries");
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };
    request.onerror = () => resolve([]);
  });
}

async function syncOfflineData(data) {
  // Sync data with server
  for (const entry of data) {
    try {
      await fetch("/api/habits/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error("Failed to sync entry:", error);
    }
  }
}

async function clearOfflineData() {
  // Clear synced offline data
  return new Promise((resolve) => {
    const request = indexedDB.open("HabitTrackerDB", 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["habitEntries"], "readwrite");
      const store = transaction.objectStore("habitEntries");
      store.clear();
      resolve();
    };
  });
}



