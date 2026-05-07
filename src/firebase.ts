import { initializeApp } from "firebase/app";

import {
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    "AIzaSyBqpaV04Dqu-jlTwaj5XhkaL-GvFWx-c7U",

  authDomain:
    "cat-health-app-5550f.firebaseapp.com",

  projectId:
    "cat-health-app-5550f",

  storageBucket:
    "cat-health-app-5550f.firebasestorage.app",

  messagingSenderId:
    "917973112721",

  appId:
    "1:917973112721:web:8ebcfd948ab44d42936c30",
};

const app =
  initializeApp(firebaseConfig);

export const db =
  getFirestore(app);