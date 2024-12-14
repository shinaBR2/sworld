import { initializeApp } from "firebase-admin/app";

initializeApp({
  storageBucket: process.env.VITE_STORAGE_BUCKET,
});
