// import firebase from 'firebase'
import firebase from "firebase/compat/app";
import "firebase/compat/database"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyABrXbvSkA_LqT0zKSTJ3_JHqNcxgyuxsQ",
  authDomain: "music-matters-229420.firebaseapp.com",
  databaseURL: "https://music-matters-229420.firebaseio.com",
  projectId: "music-matters-229420",
  storageBucket: "music-matters-229420.appspot.com",
  messagingSenderId: "939526187420",
  appId: "1:939526187420:web:9bfd8eb38ec627a575c059",
  measurementId: "G-KPKNYF6XK7"
};

const db = firebase.initializeApp(firebaseConfig);
export default db.database().ref();