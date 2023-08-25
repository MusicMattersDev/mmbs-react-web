import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyABrXbvSkA_LqT0zKSTJ3_JHqNcxgyuxsQ",
    authDomain: "music-matters-229420.firebaseapp.com",
    databaseURL: "https://music-matters-229420.firebaseio.com",
    projectId: "music-matters-229420",
    storageBucket: "music-matters-229420.appspot.com",
    messagingSenderId: "939526187420",
    appId: "1:939526187420:web:9bfd8eb38ec627a575c059",
    measurementId: "G-KPKNYF6XK7"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;