// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCH9XoClstAAaQPcXNIzwRepnJX7UeT39A",
  authDomain: "arcstatus-22bdf.firebaseapp.com",
  projectId: "arcstatus-22bdf",
  storageBucket: "arcstatus-22bdf.firebasestorage.app",
  messagingSenderId: "209040839266",
  appId: "1:209040839266:web:8394be44117d28be15373b",
  measurementId: "G-WQCGSZY35Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
