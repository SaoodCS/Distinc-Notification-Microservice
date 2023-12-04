import * as express from 'express';
import * as functions from 'firebase-functions';
import deleteNotifSchedule from './deleteNotifSchedule/endpoint/endpoint';
import getNotifSchedule from './getNotifSchedule/endpoint/endpoint';
import Middleware from './global/middleware/Middleware';
import sendNotif from './sendNotif/sendNotif';
import setFcmToken from './setFcmToken/endpoint/endpoint';
import setNotifSchedule from './setNotifSchedule/endpoint/endpoint';

const app = express();
Middleware.initAdminSDK();
app.use(Middleware.corsSetup);
app.use(Middleware.verifyHeaders);
app.use(Middleware.verifyApiKey);

// API Endpoints:
app.post('/setFcmToken', setFcmToken);

app.get('/getNotifSchedule', getNotifSchedule);
app.post('/setNotifSchedule', setNotifSchedule);
app.post('/deleteNotifSchedule', deleteNotifSchedule);

// Export Microservice:
export const notification = functions.https.onRequest(app);
export const sendScheduledNotif = functions.pubsub.schedule('every 1 minutes').onRun(sendNotif);
