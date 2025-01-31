import * as admin from 'firebase-admin';

import * as serviceAccount from './sikkacleaners-eaef5-firebase-adminsdk-qr4co-68dbe81cf8.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
