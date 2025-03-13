
import { useState } from 'react';
import Papa from 'papaparse';
import { toast } from '@/components/ui/use-toast';
import { getFirestoreSchema } from '@/utils/schemaUtils';

interface FieldMapping {
  csvField: string;
  schemaField: string;
}

export const useCSVSchemaAlignment = () => {
  const [csvData, setCsvData] = useState<Record<string, any>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [schemaFields, setSchemaFields] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [alignedData, setAlignedData] = useState<Record<string, any>[]>([]);

  const fetchSchemaFields = async (file: File, collectionName: string) => {
    try {
      // First parse the CSV to get its headers
      const parsedCsv = await parseCSV(file);
      setCsvData(parsedCsv.data);
      setCsvHeaders(parsedCsv.headers);
      
      // Then fetch the schema for the selected collection
      const schema = await getFirestoreSchema(collectionName);
      setSchemaFields(schema);
      
      // Create initial field mappings (auto-match same field names)
      const initialMappings: FieldMapping[] = [];
      
      parsedCsv.headers.forEach(csvField => {
        // Try to find a matching schema field (exact match or case-insensitive)
        const matchingField = schema.find(
          schemaField => schemaField === csvField || 
                       schemaField.toLowerCase() === csvField.toLowerCase()
        );
        
        initialMappings.push({
          csvField,
          schemaField: matchingField || ''
        });
      });
      
      setFieldMappings(initialMappings);
    } catch (error) {
      console.error('Error fetching schema fields:', error);
      throw error;
    }
  };

  const parseCSV = (file: File): Promise<{data: Record<string, any>[], headers: string[]}> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, any>[];
          const headers = results.meta.fields || [];
          
          if (data.length === 0) {
            reject(new Error('CSV file is empty or has no valid data'));
            return;
          }
          
          resolve({ data, headers });
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const processAlignment = async () => {
    try {
      // Create a new array with the aligned data
      const aligned = csvData.map(row => {
        const alignedRow: Record<string, any> = {};
        
        // Process each mapping to create the aligned row
        fieldMappings.forEach(mapping => {
          if (mapping.csvField && mapping.schemaField) {
            alignedRow[mapping.schemaField] = row[mapping.csvField];
          }
        });
        
        return alignedRow;
      });
      
      setAlignedData(aligned);
      return aligned;
    } catch (error) {
      console.error('Error processing alignment:', error);
      throw error;
    }
  };

  const downloadAlignedCSV = () => {
    try {
      if (alignedData.length === 0) {
        toast({
          title: 'No Data',
          description: 'There is no aligned data to download',
          variant: 'destructive',
        });
        return;
      }
      
      const csv = Papa.unparse(alignedData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'aligned-data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download the aligned CSV',
        variant: 'destructive',
      });
    }
  };

  return {
    csvData,
    csvHeaders,
    schemaFields,
    fieldMappings,
    setFieldMappings,
    alignedData,
    fetchSchemaFields,
    processAlignment,
    downloadAlignedCSV
  };
};
