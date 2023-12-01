import type * as express from 'express';
import ErrorChecker from '../../global/helpers/errorCheckers/ErrorChecker';
import ErrorHandler from '../../global/helpers/errorHandlers/ErrorHandler';
import FirebaseHelper from '../../global/helpers/firebaseHelpers/FirebaseHelper';
import ErrorThrower from '../../global/interface/ErrorThrower';
import CollectionRef from '../../global/utils/CollectionRef';
import messaging from '../../global/utils/messaging';
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

      try {
         const message = {
            notification: {
               title: 'Test Title',
               body: 'Test Body',
            },
            token: userFcmToken,
         };
         await messaging.send(message);
         console.log('Successfully sent message');
      } catch (error) {
         console.log('ERROR: ', error);
      }
      return res.status(200).send({ message: 'Successfully set and created notif scheduler' });

      // Error Handling:
   } catch (error: unknown) {
      if (ErrorChecker.isErrorThrower(error)) {
         console.log('ERRRRORR: ', error);
         return ErrorHandler.handleErrorThrower(error, res);
      }
      return res.status(resCodes.INTERNAL_SERVER.code).send({ error: error });
   }
}
