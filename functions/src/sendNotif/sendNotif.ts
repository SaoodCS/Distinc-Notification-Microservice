/* eslint-disable no-await-in-loop */
import * as functions from 'firebase-functions';
import DateHelper from '../global/helpers/dataTypes/dateHelper/DateHelper';
import GenericHelper from '../global/helpers/dataTypes/genericHelper/GenericHelper';
import CollectionRef from '../global/utils/CollectionRef';
import messaging from '../global/utils/messaging';
import type {
   INotifScheduleFormInputs,
   ISetNotifScheduleReqBody,
} from '../setNotifSchedule/reqBodyClass/SetNotifScheduleReqBody';

export default async function sendNotif(): Promise<void> {
   try {
      const notifDocs = await CollectionRef.notification
         .where('notifSchedule.nextDate', '<=', new Date().toISOString())
         .get();
      type IDueNotification = Omit<ISetNotifScheduleReqBody, 'notifSchedule'> & {
         notifSchedule: INotifScheduleFormInputs;
      };
      const dueScheduledNotifs = notifDocs.docs.map((doc) => doc.data()) as IDueNotification[];
      if (!GenericHelper.isNotFalsyOrEmpty(dueScheduledNotifs)) {
         functions.logger.log('No scheduled notifications to send');
         return;
      }

      for (let i = 0; i < dueScheduledNotifs.length; i++) {
         const item = dueScheduledNotifs[i];
         const updatedBadgeCount = item.badgeCount + 1;
         try {
            const response = await messaging.send({
               notification: {
                  title: `Distribute Your Income! badgeCount:${updatedBadgeCount}`,
                  body: "It's time to distribute your income!",
               },
               data: {
                  title: `Distribute Your Income! badgeCount:${updatedBadgeCount}`,
                  body: "It's time to distribute your income!",
               },
               token: item.fcmToken,
            });
            functions.logger.log('Successfully sent message:', response);
         } catch (error) {
            functions.logger.error(`Error - Token Invalid:`, error);
            functions.logger.log(`Deleting Doc With Invalid Token...`);
            const doc = notifDocs.docs.find((doc) => doc.data().fcmToken === item.fcmToken);
            if (doc) {
               await doc.ref.delete();
               continue;
            }
         }
         const recurrence = item.notifSchedule.recurrence;
         const nextDate = DateHelper.updateDate(new Date(item.notifSchedule!.nextDate), recurrence);

         // find the doc in the collection that has the same fcmToken as the current item, and update the notifSchedule.nextDate property:
         const doc = notifDocs.docs.find((doc) => doc.data().fcmToken === item.fcmToken);
         if (!doc) {
            functions.logger.error('Error finding doc in the collection');
            return;
         }
         await doc.ref.set(
            {
               notifSchedule: {
                  ...item.notifSchedule,
                  nextDate: nextDate.toISOString(),
               },
               badgeCount: updatedBadgeCount,
            },
            { merge: true },
         );
         functions.logger.log('Successfully sent notification to user');
      }
   } catch (error) {
      functions.logger.error('Error sending notifications:', error);
   }
}
