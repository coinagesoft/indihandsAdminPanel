// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAQ-dYr68Cd4MMcMky4DZeC47PobKy1HFI",
  authDomain: "my-app-71f5d.firebaseapp.com",
  projectId: "my-app-71f5d",
  storageBucket: "my-app-71f5d.firebasestorage.app",
    messagingSenderId: "226422870692",
  appId: "1:226422870692:web:994b81e77689c2e4908c31"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
