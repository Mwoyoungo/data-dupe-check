
import Papa from 'papaparse';

export const applyHeadersToCSV = (
  csvData: string[][],
  headers: string[]
): string => {
  // Create a new array with headers as the first row
  const dataWithHeaders = [headers, ...csvData];
  
  // Convert back to CSV string
  return Papa.unparse(dataWithHeaders);
};

export const parseCSVWithoutHeaders = (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as string[][]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const hasHeaders = (csvData: string[][]): boolean => {
  if (csvData.length < 2) return false;
  
  const firstRow = csvData[0];
  const secondRow = csvData[1];
  
  // Check if first row looks like headers (more text values than numbers)
  let textCount = 0;
  let numberCount = 0;
  
  for (const cell of firstRow) {
    if (!isNaN(Number(cell)) && cell.trim() !== '') {
      numberCount++;
    } else {
      textCount++;
    }
  }
  
  // If first row has more text values than numbers, it might be headers
  return textCount > numberCount;
};
