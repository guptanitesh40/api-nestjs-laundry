import * as admin from 'firebase-admin';

import serviceAccount from '../src/firebase/sikkacleaners-customer-app.json';

const customerApp = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  },
  'orderApp',
);

import serviceAccount2 from '../src/firebase/sikkacleaners-driver-app.json';

const driverApp = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount2 as admin.ServiceAccount),
  },
  'driverApp',
);

export { customerApp, driverApp };
