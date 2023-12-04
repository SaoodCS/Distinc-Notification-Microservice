import type { IRecurrenceOptions } from '../../../../setNotifSettings/reqBodyClass/SetNotifSettingsReqBody';

export default class DateHelper {
   static updateDate(date: Date, recurrence: IRecurrenceOptions): Date {
      if (recurrence === 'Daily') {
         return new Date(date.setDate(date.getDate() + 1));
      }
      if (recurrence === 'Weekly') {
         return new Date(date.setDate(date.getDate() + 7));
      }
      if (recurrence === 'Monthly') {
         return new Date(date.setMonth(date.getMonth() + 1));
      }
      if (recurrence === 'Yearly') {
         return new Date(date.setFullYear(date.getFullYear() + 1));
      }
      return date;
   }
}
