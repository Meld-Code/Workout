/*
  1. Firebase Console -> Project settings -> General -> Your apps -> Web app.
  2. Copy the firebaseConfig values into this object.
  3. Never put service-account private keys or Admin SDK credentials in this file.
*/
(function () {
  const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "PASTE_YOUR_APP_ID_HERE"
  };

  const configured = firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID" && firebaseConfig.appId !== "PASTE_YOUR_APP_ID_HERE";

  if (typeof firebase !== "undefined" && configured && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else if (!configured) {
    console.warn("Ember Arc: Firebase is not configured. Edit firebase-config.js.");
  }
})();
