
import { useState } from 'react';
import Papa from 'papaparse';

interface UseCSVParserResult {
  parseCSV: (file: File) => Promise<void>;
  parsedData: Record<string, any>[];
  headers: string[];
  error: Error | null;
}

const useCSVParser = (): UseCSVParserResult => {
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const parseCSV = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, any>[];
          
          if (data.length === 0) {
            const err = new Error('CSV file is empty or has no valid data');
            setError(err);
            reject(err);
            return;
          }

          // Extract headers from the first row
          const extractedHeaders = Object.keys(data[0]);
          
          setParsedData(data);
          setHeaders(extractedHeaders);
          setError(null);
          resolve();
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
