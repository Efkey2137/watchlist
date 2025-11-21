// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDAsIZN4BrwqJY9C8Y3daOavEHR0m1Jgzc",
  authDomain: "animetracker-1718e.firebaseapp.com",
  projectId: "animetracker-1718e",
  storageBucket: "animetracker-1718e.firebasestorage.app",
  messagingSenderId: "506587318984",
  appId: "1:506587318984:web:e9b578ce91b48853e3f3fd",
  measurementId: "G-EH00T5C80M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);