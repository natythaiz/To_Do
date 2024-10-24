// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9UQ6-4pQQVjlOhmsQWN86n3TUcmg8eAk",
  authDomain: "to-do-26b24.firebaseapp.com",
  databaseURL: "https://to-do-26b24-default-rtdb.firebaseio.com",
  projectId: "to-do-26b24",
  storageBucket: "to-do-26b24.appspot.com",
  messagingSenderId: "767144656111",
  appId: "1:767144656111:web:dc7d566149f67c176a6f1a",
  measurementId: "G-H2ZGN2GRSP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);