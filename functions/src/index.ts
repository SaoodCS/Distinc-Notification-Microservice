import * as express from 'express';
import * as functions from 'firebase-functions';
import deleteNotifSettings from './deleteNotifSettings/endpoint/endpoint';
import getNotifSettings from './getNotifSettings/endpoint/endpoint';
import Middleware from './global/middleware/Middleware';
import sendNotif from './sendNotif/sendNotif';
import setNotifSettings from './setNotifSettings/endpoint/endpoint';

const app = express();
Middleware.initAdminSDK();
app.use(Middleware.corsSetup);
app.use(Middleware.verifyHeaders);
app.use(Middleware.verifyApiKey);

// API Endpoints:
app.get('/getNotifSettings', getNotifSettings);
app.post('/setNotifSettings', setNotifSettings);
app.post('/deleteNotifSettings', deleteNotifSettings);

// Export Microservice:
export const notification = functions.https.onRequest(app);
export const sendScheduledNotif = functions.pubsub.schedule('every 1 hours').onRun(sendNotif);
