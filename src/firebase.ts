import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGd1jLtwa_maH8XvgALjZ9uxb8B8KCXCY",
  authDomain: "audio-cuttur.firebaseapp.com",
  projectId: "audio-cuttur",
  storageBucket: "audio-cuttur.firebasestorage.app",
  messagingSenderId: "5886710384",
  appId: "1:5886710384:web:a73cc68779e2c5990c5ab5",
  measurementId: "G-5B1NFY2YG3",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
