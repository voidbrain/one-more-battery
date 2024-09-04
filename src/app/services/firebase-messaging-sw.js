importScripts("/firebase/firebase-app-compat.js");
importScripts("/firebase/firebase-messaging-compat.js");

// Now Firebase libraries are available, so you can use firebase.initializeApp().

self.addEventListener("install", function (event) {
  event.waitUntil(
    fetch("./../../assets/data/firebase-config.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (config) {
        firebase.initializeApp(config); // Initialize Firebase with config from JSON
      })
      .catch(function (error) {
        console.error("Failed to fetch Firebase config", error);
      }),
  );
});

// Set up background messaging after Firebase is initialized
self.addEventListener("activate", function (event) {
  messaging = firebase.messaging();

  messaging.onBackgroundMessage(function (payload) {
    notificationTitle = payload.notification.title;
    notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon,
    };

    // Show notification when a background message is received
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
});
