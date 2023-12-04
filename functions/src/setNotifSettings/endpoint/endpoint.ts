import type * as express from 'express';
import ErrorChecker from '../../global/helpers/errorCheckers/ErrorChecker';
import ErrorHandler from '../../global/helpers/errorHandlers/ErrorHandler';
import FirebaseHelper from '../../global/helpers/firebaseHelpers/FirebaseHelper';
import ErrorThrower from '../../global/interface/ErrorThrower';
import CollectionRef from '../../global/utils/CollectionRef';
import { resCodes } from '../../global/utils/resCode';
import SetNotifSettingsReqBody from '../reqBodyClass/SetNotifSettingsReqBody';

export default async function setNotifSettings(
   req: express.Request,
   res: express.Response,
): Promise<express.Response> {
   const reqBody = req.body;
   try {
      if (!SetNotifSettingsReqBody.isValid(reqBody)) {
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
      return res.status(200).send({ message: 'Successfully set and created notif scheduler' });

      // Error Handling:
   } catch (error: unknown) {
      if (ErrorChecker.isErrorThrower(error)) {
         return ErrorHandler.handleErrorThrower(error, res);
      }
      return res.status(resCodes.INTERNAL_SERVER.code).send({ error: error });
   }
}
