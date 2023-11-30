import type * as express from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import ErrorChecker from '../../global/helpers/errorCheckers/ErrorChecker';
import ErrorHandler from '../../global/helpers/errorHandlers/ErrorHandler';
import FirebaseHelper from '../../global/helpers/firebaseHelpers/FirebaseHelper';
import ErrorThrower from '../../global/interface/ErrorThrower';
import CollectionRef from '../../global/utils/CollectionRef';
import { resCodes } from '../../global/utils/resCode';

export default async function deleteNotifSchedule(
   req: express.Request,
   res: express.Response,
): Promise<express.Response> {
   const { uid, error } = await FirebaseHelper.getUidFromAuthToken(req.headers.authorization);
   if (!uid) {
      throw new ErrorThrower(error!, resCodes.UNAUTHORIZED.code);
   }
   const notif = (await CollectionRef.notification.doc(uid).get()).data();
   if (!notif) {
      throw new ErrorThrower('User not found', resCodes.NOT_FOUND.code);
   }
   if (!notif.notifSchedule) {
      throw new ErrorThrower('No schedule found', resCodes.NOT_FOUND.code);
   }
   await CollectionRef.notification.doc(uid).update({ notifSchedule: FieldValue.delete() });
   try {
      return res.status(200).send({ message: 'Successfully Deleted Schedule' });
   } catch (error: unknown) {
      // Error handling code for caught errors here

      if (ErrorChecker.isErrorThrower(error)) {
         return ErrorHandler.handleErrorThrower(error, res);
      }

      return res.status(resCodes.INTERNAL_SERVER.code).send({ error: error });
   }
}
