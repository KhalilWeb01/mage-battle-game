import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAoTZjlvjqzxct57qHOHTR7u8QWtdrv4J4",
  authDomain: "magic-battle-76d64.firebaseapp.com",
  projectId: "magic-battle-76d64",
  storageBucket: "magic-battle-76d64.appspot.com",
  messagingSenderId: "366325237552",
  appId: "1:366325237552:web:222e63f7a502a5df16eaf5",
  measurementId: "G-HDK4PF4XYS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
