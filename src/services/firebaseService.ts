import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';
import { SummaryItem } from '@/components/ProcessingSummary';

// Firebase configuration with your project details
const firebaseConfig = {
  apiKey: "AIzaSyAAmWIMqalNVqfkyS-lwoos6TcnZm9B3f4",
  authDomain: "shacmanadmin-r81fqi.firebaseapp.com",
  projectId: "shacmanadmin-r81fqi",
  storageBucket: "shacmanadmin-r81fqi.firebasestorage.app",
  messagingSenderId: "650817347403",
  appId: "1:650817347403:web:5956355f6a09d7dbe612ce"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Get all collections from Firestore
 */
export const getCollections = async (): Promise<string[]> => {
  try {
    // Unfortunately, Firebase web SDK doesn't support directly listing collections
    // We need to query for known collections or create a fallback list
    const collectionsToCheck = [
      'products', 
      'inventory', 
      'orders', 
      'customers', 
      'users', 
      'settings',
      'categories'
    ];
    
    const availableCollections: string[] = [];
    
    for (const colName of collectionsToCheck) {
      try {
        const colRef = collection(db, colName);
        const snapshot = await getDocs(colRef);
        
        // If we can successfully query the collection, it exists
        // We consider a collection exists even if it's empty
        availableCollections.push(colName);
        console.log(`Found collection: ${colName} with ${snapshot.size} documents`);
      } catch (err) {
        // Skip collections that don't exist or we can't access
        console.log(`Collection ${colName} doesn't exist or is not accessible`);
      }
    }
    
    if (availableCollections.length === 0) {
      console.log("No collections found. Creating a default collection.");
      // Create a default collection with a document if none exists
      const defaultCollection = 'products';
      const docRef = doc(collection(db, defaultCollection), 'sample');
      await setDoc(docRef, { 
        name: 'Sample Product', 
        description: 'This is a sample product',
        price: 19.99,
        createdAt: new Date().toISOString()
      });
      return [defaultCollection];
    }
    
    return availableCollections;
  } catch (error) {
    console.error('Error getting collections:', error);
    // Return default collections if there's an error
    return ['products', 'inventory'];
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
