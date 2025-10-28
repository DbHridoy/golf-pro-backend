// src/config/firebase.ts
import admin from "firebase-admin";
import path from "node:path";

const serviceAccountPath = path.join(__dirname, "../../firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export const fcm = admin.messaging();
