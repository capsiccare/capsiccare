import { initializeApp } from "firebase/app";
// @ts-ignore - Known Firebase v10 type definition gap for getReactNativePersistence
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Replace with your actual Firebase configuration keys
// You can find these in the Firebase Console (Project Settings > General > Web Apps)
const firebaseConfig = {
  apiKey: "AIzaSyApp67_n8jYECxyc_V8WOAFBecURP8w8pw",
  authDomain: "web-app-88ef2.firebaseapp.com",
  databaseURL: "https://web-app-88ef2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web-app-88ef2",
  storageBucket: "web-app-88ef2.firebasestorage.app",
  messagingSenderId: "942007761528",
  appId: "1:942007761528:web:a4f8154ad3702ede6e4b8d",
  measurementId: "G-8WXJ2BQDB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for data persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore
const db = getFirestore(app);

export { auth, db };
