import { Service } from 'encore.dev/service';
import { initializeApp } from 'firebase-admin/app';

initializeApp({
  storageBucket: process.env.VITE_STORAGE_BUCKET,
});

export default new Service('video');
