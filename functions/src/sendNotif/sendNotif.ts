// TODO: make this more performative by using a batch write instead of updating each doc one by one / by taking the await out of the for loop and using Promise.all() instead + and refactor this func to make it more readable
// TODO: sort out the github ci/cd pipeline so it works with deploying the firebase functions pub/sub scheduler
/* eslint-disable no-await-in-loop */
import type { Message } from 'firebase-admin/lib/messaging/messaging-api';
import * as functions from 'firebase-functions';
import DateHelper from '../global/helpers/dataTypes/dateHelper/DateHelper';
import CollectionRef from '../global/utils/CollectionRef';
import messaging from '../global/utils/messaging';
import type { ISetNotifScheduleReqBody } from '../setNotifSchedule/reqBodyClass/SetNotifScheduleReqBody';

export default async function sendNotif(): Promise<void> {
   const notifDocs = await CollectionRef.notification.get();
   const notifDocsData = notifDocs.docs.map((doc) => doc.data()) as ISetNotifScheduleReqBody[];

   // only keep the docs data that have a notifSchedule property:
   const scheduledNotifDocsData = notifDocsData.filter((doc) => doc.notifSchedule);

   // only keep the scheduled notif docs data that's notifSchedule.startDate property is before or equal to the current date:
   const dueScheduledNotifs = scheduledNotifDocsData.filter(
      (doc) => new Date(doc.notifSchedule!.startDate) <= new Date(),
   );

   // For each of the due scheduled notifs, send a notification:
   for (let i = 0; i < dueScheduledNotifs.length; i++) {
      const item = dueScheduledNotifs[i];
      const payload: Message = {
         notification: {
            title: 'Distribute Your Income!',
            body: "It's time to distribute your income!",
         },
         data: {
            title: 'Distribute Your Income!',
            body: "It's time to distribute your income!",
         },
         token: item.fcmToken,
      };

      try {
         const response = await messaging.send(payload);
         functions.logger.log('Successfully sent message:', response);
      } catch (error) {
         functions.logger.error('Error sending message:', error);
         functions.logger.log(
            `Deleting the firestore doc that has the invalid fcmToken: ${item.fcmToken}`,
         );
         const doc = notifDocs.docs.find((doc) => doc.data().fcmToken === item.fcmToken);
         if (!doc) {
            functions.logger.error('Error finding firestore doc that has the invalid fcmToken');
            return;
         }
         await doc.ref.delete();
         functions.logger.log('Successfully deleted firestore doc that has the invalid fcmToken');
         continue;
      }

      const recurrence = item.notifSchedule!.recurrence;
      const nextDate = DateHelper.updateDate(new Date(item.notifSchedule!.startDate), recurrence);

      // find the doc in the collection that has the same fcmToken as the current item, and update the notifSchedule.startDate property:
      const doc = notifDocs.docs.find((doc) => doc.data().fcmToken === item.fcmToken);
      if (!doc) {
         functions.logger.error('Error finding doc in the collection');
         return;
      }
      await doc.ref.set(
         {
            notifSchedule: {
               ...item.notifSchedule,
               startDate: nextDate.toISOString(),
            },
         },
         { merge: true },
      );
      functions.logger.log('Successfully sent notification to user');
   }
}
