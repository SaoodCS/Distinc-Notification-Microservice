import type * as express from 'express';
import * as admin from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
import * as functions from 'firebase-functions';
import ErrorChecker from '../../global/helpers/errorCheckers/ErrorChecker';
import ErrorHandler from '../../global/helpers/errorHandlers/ErrorHandler';
import FirebaseHelper from '../../global/helpers/firebaseHelpers/FirebaseHelper';
import ErrorThrower from '../../global/interface/ErrorThrower';
import CollectionRef from '../../global/utils/CollectionRef';
import { resCodes } from '../../global/utils/resCode';
import SetNotifScheduleReqBody, {
   type ISetNotifScheduleReqBody,
} from '../reqBodyClass/SetNotifScheduleReqBody';

export default async function setNotifSchedule(
   req: express.Request,
   res: express.Response,
): Promise<express.Response> {
   const reqBody = req.body;
   try {
      if (!SetNotifScheduleReqBody.isValid(reqBody)) {
         throw new ErrorThrower('Invalid Body Request', resCodes.BAD_REQUEST.code);
      }
      const { uid, error } = await FirebaseHelper.getUidFromAuthToken(req.headers.authorization);
      if (!uid) {
         throw new ErrorThrower(error!, resCodes.UNAUTHORIZED.code);
      }

      // Update notification document
      await CollectionRef.notification.doc(uid).set(
         {
            ...reqBody,
         },
         { merge: true },
      );

      // Check if user has a notif schedule
      const notifDoc = (
         await CollectionRef.notification.doc(uid).get()
      ).data() as ISetNotifScheduleReqBody;
      if (!notifDoc) {
         throw new ErrorThrower('Notification document not found', resCodes.NOT_FOUND.code);
      }

      // If user has no notif schedule, return successfully updated fcm token msg
      const notifSchedule = notifDoc.notifSchedule;
      if (!notifSchedule) {
         return res.status(200).send({ message: 'Successfully updated fcm token' });
      }

      // If user does have notif schedule, create a scheduler which sends a push notif to the user at the specified time and recurrence
      const userFcmToken = notifDoc.fcmToken;
      const startDateAndTime = new Date(notifSchedule.startDate);
      const recurrence = notifSchedule.recurrence;
      const scheduleRepeat =
         recurrence === 'Daily'
            ? 'every 24 hours'
            : recurrence === 'Weekly'
            ? 'every 7 days'
            : recurrence === 'Monthly'
            ? 'every 30 days'
            : recurrence === 'Yearly'
            ? 'every 365 days'
            : 'every 24 hours';

      // test sending a push notif:
      const message: Message = {
         data: {
            title: 'Test Title',
            body: 'Test Body',
         },
         token: userFcmToken,
      };
      await admin.messaging().send(message);

      return res.status(200).send({ message: 'Successfully set and created notif scheduler' });

      // Error Handling:
   } catch (error: unknown) {
      if (ErrorChecker.isErrorThrower(error)) {
         return ErrorHandler.handleErrorThrower(error, res);
      }
      return res.status(resCodes.INTERNAL_SERVER.code).send({ error: error });
   }
}
