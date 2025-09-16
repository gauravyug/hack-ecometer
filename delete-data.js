// delete-data.js

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-key.json'); // Path to your downloaded key

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const deleteCollection = async () => {
  const collectionRef = db.collection('activities');
  const batch = db.batch();
  const querySnapshot = await collectionRef.get();

  if (querySnapshot.size === 0) {
    console.log("No documents to delete.");
    return;
  }

  querySnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Successfully deleted ${querySnapshot.size} documents from the 'activities' collection.`);
};

deleteCollection();