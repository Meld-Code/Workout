// firebase-config.js
// Load Firebase compat SDK scripts in index.html before this file:
// firebase-app-compat.js
// firebase-auth-compat.js
// firebase-database-compat.js
const firebaseConfig = {
apiKey: "AIzaSyCH9XoClstAAaQPcXNIzwRepnJX7UeT39A",
authDomain: "arcstatus-22bdf.firebaseapp.com",
databaseURL: "PASTE_YOUR_REALTIME_DATABASE_URL_HERE",
projectId: "arcstatus-22bdf",
storageBucket: "arcstatus-22bdf.firebasestorage.app",
messagingSenderId: "209040839266",
appId: "1:209040839266:web:8394be44117d28be15373b",
measurementId: "G-WQCGSZY35Z"
};
if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
}
