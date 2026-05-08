// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBR9vDjNKRtSbmH9XWkN6mlQWijOJyckQk",
  authDomain: "internarea-4c34a.firebaseapp.com",
  projectId: "internarea-4c34a",
  storageBucket: "internarea-4c34a.firebasestorage.app",
  messagingSenderId: "1097080118799",
  appId: "1:1097080118799:web:f22b1267486ae2118c4d7a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});
export {auth, provider};
