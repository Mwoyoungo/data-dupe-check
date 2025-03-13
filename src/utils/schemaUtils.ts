
import { collection, getDocs, limit, getFirestore } from 'firebase/firestore';

/**
 * Extracts schema fields from a Firestore collection by examining documents
 */
export const getFirestoreSchema = async (collectionName: string): Promise<string[]> => {
  try {
    const db = getFirestore();
    const collectionRef = collection(db, collectionName);
    
    // Get a sample of documents to derive the schema
    const querySnapshot = await getDocs(collectionRef);
    
    if (querySnapshot.empty) {
      // If collection is empty, return empty schema
      console.log(`Collection ${collectionName} is empty, returning empty schema`);
      return [];
    }
    
    // Extract field names from all documents and combine them
    const allFields = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      Object.keys(data).forEach(field => allFields.add(field));
    });
    
    // Convert set to array and sort alphabetically
    return Array.from(allFields).sort();
  } catch (error) {
    console.error(`Error getting schema for collection ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Checks if a value can be converted to a given type
 */
export const canConvertToType = (value: any, type: string): boolean => {
  if (value === undefined || value === null || value === '') {
    // Undefined/null/empty values can be converted to any type
    return true;
  }
  
  switch (type) {
    case 'string':
      // All values can be converted to strings
      return true;
    case 'number':
      return !isNaN(Number(value));
    case 'boolean':
      const lowerValue = String(value).toLowerCase();
      return lowerValue === 'true' || lowerValue === 'false' || 
             lowerValue === '1' || lowerValue === '0' ||
             lowerValue === 'yes' || lowerValue === 'no';
    case 'array':
      try {
        // Check if it's a JSON array string
        if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
          JSON.parse(value);
          return true;
        }
        return Array.isArray(value);
      } catch (e) {
        return false;
      }
    case 'object':
      try {
        // Check if it's a JSON object string
        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
          JSON.parse(value);
          return true;
        }
        return typeof value === 'object' && !Array.isArray(value);
      } catch (e) {
        return false;
      }
    case 'date':
      if (value instanceof Date) return true;
      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
      return false;
    default:
      return false;
  }
};

/**
 * Converts a value to the specified type
 */
export const convertValueToType = (value: any, type: string): any => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  switch (type) {
    case 'string':
      return String(value);
    case 'number':
      return Number(value);
    case 'boolean':
      const lowerValue = String(value).toLowerCase();
      return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
    case 'array':
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return [value];
        }
      }
      return Array.isArray(value) ? value : [value];
    case 'object':
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return { value };
        }
      }
      return typeof value === 'object' && !Array.isArray(value) ? value : { value };
    case 'date':
      return new Date(value);
    default:
      return value;
  }
};
