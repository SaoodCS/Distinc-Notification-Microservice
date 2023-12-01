import * as admin from 'firebase-admin';
import Middleware from '../middleware/Middleware';

Middleware.initAdminSDK();

const messaging = admin.messaging();

export default messaging;
