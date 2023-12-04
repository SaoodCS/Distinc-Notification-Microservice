export interface IDeleteNotifSettingsReqBody {}

export default class DeleteNotifSettingsReqBody {
   static isValid(body: unknown): body is IDeleteNotifSettingsReqBody {
      return true;
   }
}
