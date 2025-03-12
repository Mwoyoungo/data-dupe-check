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
    // Add your collection name explicitly to the check list
    const collectionsToCheck = [
      'vehichles', // Note the spelling matches what you mentioned
      'vehicles', // Alternative spelling in case of typo
      'products', 
      'inventory', 
      'orders', 
      'customers', 
      'users', 
      'settings',
      'categories',
      // Add other potential collections
      ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))
    ];
    
    const availableCollections: string[] = [];
    
    console.log("Attempting to fetch Firestore collections...");
    
    // Process each collection sequentially to ensure we don't hit rate limits
    for (const colName of collectionsToCheck) {
      try {
        console.log(`Checking collection: ${colName}`);
        const colRef = collection(db, colName);
        const snapshot = await getDocs(colRef);
        
        // Add to available collections even if empty
        if (snapshot.docs.length >= 0) {
          availableCollections.push(colName);
          console.log(`Found collection: ${colName} with ${snapshot.docs.length} documents`);
        }
      } catch (err) {
        // If we get a permission error, log it clearly
        if (err instanceof Error) {
          if (err.message.includes('permission-denied')) {
            console.error(`Permission denied for collection ${colName}. Check your Firestore rules.`, err);
          } else {
            console.log(`Collection ${colName} doesn't exist or error:`, err.message);
          }
        }
      }
    }
    
    console.log("Available collections found:", availableCollections);
    
    // Return whatever collections we found without creating sample data
    return availableCollections;
  } catch (error) {
    console.error('Error getting collections:', error);
    // Return empty array instead of defaults
    return [];
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
