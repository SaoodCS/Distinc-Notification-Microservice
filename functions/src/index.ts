import * as express from 'express';
import * as functions from 'firebase-functions';
import Middleware from './global/middleware/Middleware';
import setFcmToken from './setFcmToken/endpoint/endpoint';

const app = express();
Middleware.initAdminSDK();
app.use(Middleware.corsSetup);
app.use(Middleware.verifyHeaders);
app.use(Middleware.verifyApiKey);

// API Endpoints:
app.post('/setFcmToken', setFcmToken);

// Export to Firebase Cloud Functions:
const notification = functions.https.onRequest(app);
export { notification };
