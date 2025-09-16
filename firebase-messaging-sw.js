// In your firebase-messaging-sw.js or similar file
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  "apiKey": "AIzaSyBmy0V78f60G3llqJBoRwWUzkOVi_RU3A4",
  "authDomain": "more-aa0d7.firebaseapp.com",
  "projectId": "more-aa0d7",
  "storageBucket": "more-aa0d7.appspot.com",
  "messagingSenderId": "215300078730",
  "appId": "1:215300078730:web:bad667c140aa57c2dc8173",
  "vapidKey": "eX1DRaEu3-7N5SWs38cXBnlJQ-94UDXuwn9ByA2E0r4"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
// messaging.onBackgroundMessage((payload) => {
//   console.log('Received background message ', payload);

//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: payload.notification.icon,
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

self.addEventListener('activate', function (event) {
  event.waitUntil(
    fetch('./../../assets/data/firebase-config.json')
      .then((response) => response.json())
      .then((config) => {
        firebase.initializeApp(config); // Initialize Firebase with config from JSON
        const messaging = firebase.messaging();

        // Set up background message handler
        messaging.onBackgroundMessage(function (payload) {
          const notificationTitle = payload.notification.title;
          const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.icon,
          };

          // Show the notification
          self.registration.showNotification(notificationTitle, notificationOptions);
        });
      })
      .catch((error) => {
        console.error('Failed to fetch Firebase config', error);
      })
  );
});
