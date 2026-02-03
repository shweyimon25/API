import admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require("../../yc-fitness-firebase.json")),
    });
}

export const messaging = admin.messaging();