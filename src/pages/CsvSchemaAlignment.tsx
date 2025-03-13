
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { getCollections } from '@/services/firebaseService';
import FileUpload from '@/components/FileUpload';
import { convertXLSXtoCSV, isXLSXFile } from '@/utils/csvUtils';
import { SchemaAlignmentTable } from '@/components/SchemaAlignmentTable';
import { useCSVSchemaAlignment } from '@/hooks/useCSVSchemaAlignment';

const CsvSchemaAlignment: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    csvData, 
    csvHeaders, 
    schemaFields, 
    fieldMappings, 
    setFieldMappings,
    alignedData,
    fetchSchemaFields,
    processAlignment,
    downloadAlignedCSV
  } = useCSVSchemaAlignment();

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const cols = await getCollections();
        setCollections(cols);
      } catch (error) {
        console.error('Error loading collections:', error);
        toast({
          title: 'Error',
          description: 'Failed to load Firestore collections',
          variant: 'destructive',
        });
      }
    };
    
    loadCollections();
  }, []);

  const handleFileUpload = async (uploadedFile: File) => {
    setIsProcessing(true);
    setFile(uploadedFile);
    
    try {
      // Handle XLSX conversion if needed
      if (isXLSXFile(uploadedFile)) {
        setIsLoading(true);
        toast({
          title: 'Converting XLSX',
          description: 'Converting XLSX file to CSV format...',
        });
        
        const { csvFile, headers } = await convertXLSXtoCSV(uploadedFile);
        uploadedFile = csvFile;
        
        toast({
          title: 'Conversion Complete',
          description: 'XLSX file has been converted to CSV format',
        });
        setIsLoading(false);
      }
      
      // Process the CSV file
      if (selectedCollection) {
        await fetchSchemaFields(uploadedFile, selectedCollection);
      } else {
        toast({
          title: 'Select Collection',
          description: 'Please select a Firestore collection first',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Error',
        description: 'Failed to process the file',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCollectionChange = async (collection: string) => {
    setSelectedCollection(collection);
    
    if (file && collection) {
      setIsProcessing(true);
      try {
        await fetchSchemaFields(file, collection);
      } catch (error) {
        console.error('Error fetching schema:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch collection schema',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleAlignment = async () => {
    if (!file || !selectedCollection) return;
    
    setIsProcessing(true);
    try {
      await processAlignment();
      toast({
        title: 'Alignment Complete',
        description: 'CSV data has been aligned with the Firestore schema',
      });
    } catch (error) {
      console.error('Error aligning data:', error);
      toast({
        title: 'Error',
        description: 'Failed to align CSV data with schema',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-yellow-400">CSV Schema Alignment</h1>
            <p className="text-gray-400 mt-2">
              Align your CSV data with Firestore collection schema
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            onClick={() => window.history.back()}
          >
            ← Back
          </Button>
        </div>
        
        <Separator className="my-6 bg-yellow-500/20" />
        
        <Card className="glow-card accent-gradient backdrop-blur-sm bg-black/50 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl emoji-shadow">📊</span> Step 1: Select Collection
            </CardTitle>
            <CardDescription>Choose a Firestore collection to align with your CSV data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="collection" className="text-yellow-400">Collection</Label>
                <select
                  id="collection"
                  value={selectedCollection}
                  onChange={(e) => handleCollectionChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-yellow-500/30 bg-black/60 px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  disabled={isProcessing}
                >
                  <option value="">Select a collection</option>
                  {collections.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glow-card accent-gradient backdrop-blur-sm bg-black/50 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl emoji-shadow">📄</span> Step 2: Upload CSV/XLSX
            </CardTitle>
            <CardDescription>Upload your CSV or XLSX file to align with Firestore schema</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileUploaded={handleFileUpload}
              isProcessing={isProcessing || isLoading}
              acceptXLSX={true}
            />
          </CardContent>
        </Card>
        
        {csvHeaders.length > 0 && schemaFields.length > 0 && (
          <Card className="glow-card accent-gradient backdrop-blur-sm bg-black/50 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl emoji-shadow">🔄</span> Step 3: Map Fields
              </CardTitle>
              <CardDescription>Map CSV columns to Firestore schema fields</CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaAlignmentTable
                csvHeaders={csvHeaders}
                schemaFields={schemaFields}
                fieldMappings={fieldMappings}
                setFieldMappings={setFieldMappings}
                disabled={isProcessing}
              />
              
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  onClick={handleAlignment}
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                  disabled={isProcessing}
                >
                  Align Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {alignedData.length > 0 && (
          <Card className="glow-card accent-gradient backdrop-blur-sm bg-black/50 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl emoji-shadow">✅</span> Step 4: Aligned Data
              </CardTitle>
              <CardDescription>Your data has been aligned with the Firestore schema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-yellow-500/30">
                      {Object.keys(alignedData[0]).map((header) => (
                        <th key={header} className="px-4 py-2 text-left text-yellow-400">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alignedData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-yellow-500/10">
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="px-4 py-2 text-gray-300">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {alignedData.length > 5 && (
                  <p className="text-gray-400 text-sm mt-2">
                    Showing 5 of {alignedData.length} rows
                  </p>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  onClick={downloadAlignedCSV}
                  className="gap-2 bg-green-700 hover:bg-green-600"
                >
                  <span>📥</span> Download Aligned CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CsvSchemaAlignment;
