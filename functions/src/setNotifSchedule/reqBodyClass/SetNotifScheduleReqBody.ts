export type IRecurrenceOptions = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface INotifScheduleFormInputs {
   nextDate: string;
   recurrence: IRecurrenceOptions;
}

export interface ISetNotifScheduleReqBody {
   notifSchedule?: INotifScheduleFormInputs;
   fcmToken: string;
   badgeCount: number;
}

export default class SetNotifScheduleReqBody {
   static isValid(body: unknown): body is ISetNotifScheduleReqBody {
      if (typeof body !== 'object' || body === null) {
         return false;
      }
      const { notifSchedule, fcmToken, badgeCount } = body as ISetNotifScheduleReqBody;
      if (typeof fcmToken !== 'string') {
         return false;
      }
      if (notifSchedule) {
         const { nextDate, recurrence } = notifSchedule;
         if (typeof nextDate !== 'string' || typeof recurrence !== 'string') {
            return false;
         }
      }
      if (typeof badgeCount !== 'number') {
         return false;
      }
      return true;
   }
}
