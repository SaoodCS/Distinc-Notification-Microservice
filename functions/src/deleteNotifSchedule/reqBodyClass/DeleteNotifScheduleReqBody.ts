export interface IDeleteNotifScheduleReqBody {
   
}

export default class DeleteNotifScheduleReqBody {
   static isValid(body: unknown): body is IDeleteNotifScheduleReqBody {
      return true;
   }
}
