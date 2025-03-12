
import { useState } from 'react';
import Papa from 'papaparse';

interface UseCSVParserResult {
  parseCSV: (file: File, fallbackSchema?: string[]) => Promise<void>;
  parsedData: Record<string, any>[];
  headers: string[];
  error: Error | null;
}

const useCSVParser = (): UseCSVParserResult => {
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const parseCSV = (file: File, fallbackSchema?: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          let data = results.data as Record<string, any>[];
          let extractedHeaders: string[] = [];
          
          if (data.length === 0) {
            const err = new Error('CSV file is empty or has no valid data');
            setError(err);
            reject(err);
            return;
          }

          // Check if the data has headers (keys in the first object)
          const firstRow = data[0];
          const hasHeaders = Object.keys(firstRow).length > 0 && 
                           !Object.keys(firstRow).every(key => key === '' || key.startsWith('field'));
          
          console.log("Headers detected:", hasHeaders, "First row keys:", Object.keys(firstRow));
          
          if (!hasHeaders && fallbackSchema && fallbackSchema.length > 0) {
            console.log("Using fallback schema:", fallbackSchema);
            
            // If no headers detected, re-parse the CSV without header option
            Papa.parse(file, {
              header: false,
              skipEmptyLines: true,
              complete: (rawResults) => {
                const rawData = rawResults.data as any[][];
                
                // Map each row to an object using the fallback schema
                data = rawData.map(row => {
                  const obj: Record<string, any> = {};
                  fallbackSchema.forEach((field, index) => {
                    if (index < row.length) {
                      obj[field] = row[index];
                    }
                  });
                  return obj;
                });
                
                extractedHeaders = fallbackSchema;
                setParsedData(data);
                setHeaders(extractedHeaders);
                setError(null);
                console.log("Parsed with schema:", data.slice(0, 2));
                resolve();
              },
              error: (error) => {
                setError(error);
                reject(error);
              }
            });
          } else {
            // Extract headers from the first row if they exist
            extractedHeaders = Object.keys(firstRow);
            setParsedData(data);
            setHeaders(extractedHeaders);
            setError(null);
            resolve();
          }
        },
        error: (error) => {
          setError(error);
          reject(error);
        }
      });
    });
  };

  return {
    parseCSV,
    parsedData,
    headers,
    error
  };
};

export default useCSVParser;
