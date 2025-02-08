import * as admin from 'firebase-admin';

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.PROJECT_ID,
  project_key_id: process.env.PROJECT_KEY_ID,
  private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

const order = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  },
  'orderApp',
);

const serviceAccount2 = {
  type: 'service_account',
  project_id: process.env.PROJECT_ID2,
  private_key_id: process.env.PROJECT_KEY_ID2,
  private_key: process.env.PRIVATE_KEY2?.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL2,
  client_id: process.env.CLIENT_ID2,
  auth_uri: process.env.AUTH_URI2,
  token_uri: process.env.TOKEN_URI2,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL2,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL2,
  universe_domain: process.env.UNIVERSE_DOMAIN2,
};

const driver = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount2 as admin.ServiceAccount),
  },
  'driverApp',
);

export { driver, order };
