import Middleware from '../middleware/Middleware';
import firestore from './firestore';

Middleware.initAdminSDK();

class CollectionRef {
   static exampleCollection = firestore.collection('exampleCollection');
}

export default CollectionRef;
