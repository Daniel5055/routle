import * as admin from 'firebase-admin';
import { applicationDefault, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = (() => {
  try {
    // If already exists then return app
    // Throws error if does not exist
    return admin.app();
  } catch {
    // Init and configure app
    return admin.initializeApp({
      credential: cert({
        type: 'service_account',
        project_id: 'routle-db',
        private_key_id: process.env.google_private_key_id,
        private_key: process.env.google_private_key,
        client_email: process.env.google_client_email,
        client_id: process.env.google_client_id,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url:
          'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ll0wy%40routle-db.iam.gserviceaccount.com',
      } as ServiceAccount),
      databaseURL: 'https://routle-db.firebaseio.com',
    });
  }
})();

export const db = getFirestore(app);
