import Middleware from '../middleware/Middleware';
import firestore from './firestore';

Middleware.initAdminSDK();

class CollectionRef {
   static notification = firestore.collection('notification');
}

export default CollectionRef;
