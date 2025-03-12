
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  FirestoreError,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';
import { SummaryItem } from '@/components/ProcessingSummary';

// Your Firebase configuration
// NOTE: This should be moved to environment variables in a production app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Get all collections from Firestore
 */
export const getCollections = async (): Promise<string[]> => {
  try {
    // NOTE: Firestore doesn't provide a direct way to list all collections
    // This is a workaround that requires you to have a special document that lists all collections
    // In a real app, you might hardcode this or use a different approach
    const collectionsRef = doc(db, 'meta', 'collections');
    const collectionsSnap = await getDoc(collectionsRef);
    
    if (collectionsSnap.exists()) {
      return collectionsSnap.data().list || [];
    }
    
    // Fallback to some default collections if the meta document doesn't exist
    return ['products', 'customers', 'orders', 'inventory'];
  } catch (error) {
    console.error('Error getting collections:', error);
    throw error;
  }
};

/**
 * Process CSV data, check for duplicates, and update or add documents
 */
export const processCSVData = async (
  data: Record<string, any>[],
  collectionName: string,
  keyField: string
): Promise<SummaryItem[]> => {
  const summary: SummaryItem[] = [];
  const collectionRef = collection(db, collectionName);
  
  try {
    for (const item of data) {
      const keyValue = item[keyField];
      
      if (!keyValue) {
        console.warn(`Skipping item with no ${keyField} value:`, item);
        continue;
      }
      
      // We'll use the value of the key field as the document ID
      // This makes it easier to check for duplicates
      const docId = String(keyValue).replace(/[/\\#,+()$~%.'":*?<>{}]/g, '_');
      const docRef = doc(collectionRef, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Document exists, update it and track which fields were updated
        const existingData = docSnap.data();
        const updatedFields: string[] = [];
        
        for (const [field, value] of Object.entries(item)) {
          if (JSON.stringify(existingData[field]) !== JSON.stringify(value)) {
            updatedFields.push(field);
          }
        }
        
        // Only update if there are changes
        if (updatedFields.length > 0) {
          await setDoc(docRef, { ...existingData, ...item }, { merge: true });
          summary.push({
            id: docId,
            status: 'updated',
            keyField,
            keyValue,
            fields: updatedFields
          });
        }
      } else {
        // Document doesn't exist, add a new one
        await setDoc(docRef, item);
        summary.push({
          id: docId,
          status: 'added',
          keyField,
          keyValue,
          fields: Object.keys(item)
        });
      }
    }
    
    return summary;
  } catch (error) {
    console.error('Error processing CSV data:', error);
    throw error;
  }
};
