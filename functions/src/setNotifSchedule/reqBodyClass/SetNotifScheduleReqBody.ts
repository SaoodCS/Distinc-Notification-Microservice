export type IRecurrenceOptions = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface INotifScheduleFormInputs {
   startDate: string;
   recurrence: IRecurrenceOptions;
}

export interface ISetNotifScheduleReqBody {
   notifSchedule?: INotifScheduleFormInputs;
   fcmToken: string;
}

export default class SetNotifScheduleReqBody {
   static isValid(body: unknown): body is ISetNotifScheduleReqBody {
      if (typeof body !== 'object' || body === null) {
         return false;
      }
      const { notifSchedule, fcmToken } = body as ISetNotifScheduleReqBody;
      if (typeof fcmToken !== 'string') {
         return false;
      }
      if (notifSchedule) {
         const { startDate, recurrence } = notifSchedule;
         if (typeof startDate !== 'string' || typeof recurrence !== 'string') {
            return false;
         }
      }
      return true;
   }
}
