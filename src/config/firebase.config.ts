// src/config/firebase.ts
import admin from "firebase-admin";
import path from "node:path";

import { env } from "@/env";

const serviceAccountPath = path.join(__dirname, "../../firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export const fcm = admin.messaging();

// added by rakib
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.FIREBASE_PROJECT_ID,
    privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, "\n"),
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
  }),
});

export const messaging = admin.messaging();
