import * as admin from 'firebase-admin'
import { applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = (() => {
  try {
    // If already exists then return app
    // Throws error if does not exist
    return admin.app();
  } catch {
    // Init and configure app
    return admin.initializeApp({
        credential: applicationDefault(),
        databaseURL: 'https://routle-db.firebaseio.com'
      })
  }
})()

export const db = getFirestore(app);
