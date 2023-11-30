export type IRecurrenceOptions = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface ISetNotifScheduleReqBody {
   startDate: string;
   recurrence: IRecurrenceOptions;
}

export default class SetNotifScheduleReqBody {
   static isValid(body: unknown): body is ISetNotifScheduleReqBody {
      if (typeof body !== 'object' || body === null) return false;
      const { startDate, recurrence } = body as ISetNotifScheduleReqBody;
      if (typeof startDate !== 'string') return false;
      if (typeof recurrence !== 'string') return false;
      if (!['Daily', 'Weekly', 'Monthly', 'Yearly'].includes(recurrence)) return false;
      return true;
   }
}
