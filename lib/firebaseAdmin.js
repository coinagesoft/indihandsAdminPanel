import admin from "firebase-admin";
import path from "path";
import fs from "fs";

// Load service account key
const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "lib/firebase-service-key.json"),
    "utf8"
  )
);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "my-app-71f5d.appspot.com", // ✅ correct
  });
}

const bucket = admin.storage().bucket();

export { admin, bucket };
