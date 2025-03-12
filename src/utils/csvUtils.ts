
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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

export const convertXLSXtoCSV = async (file: File): Promise<{ 
  csvFile: File,
  headers: string[] 
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to CSV with headers
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        
        // Parse the CSV to get headers
        const parsedData = Papa.parse(csvData, { header: true });
        const headers = parsedData.meta.fields || [];
        
        // Create a new File object with the CSV data
        const csvFile = new File(
          [csvData], 
          file.name.replace(/\.xlsx?$/, '.csv'), 
          { type: 'text/csv' }
        );
        
        resolve({ csvFile, headers });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const isXLSXFile = (file: File): boolean => {
  return file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
};
