export interface ISetFcmTokenReqBody {
   fcmToken: string;
}

export default class SetFcmTokenReqBody {
   static isValid(body: unknown): body is ISetFcmTokenReqBody {
      if (typeof body !== 'object' || body === null) {
         return false;
      }

      if (typeof (body as ISetFcmTokenReqBody).fcmToken !== 'string') {
         return false;
      }

      return true;
   }
}
