
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import FileUpload from '@/components/FileUpload';
import CollectionSelector from '@/components/CollectionSelector';
import KeyFieldSelector from '@/components/KeyFieldSelector';
import ProcessingSummary, { SummaryItem } from '@/components/ProcessingSummary';
import VehicleSchemaInfo, { DEFAULT_VEHICLE_SCHEMA } from '@/components/VehicleSchemaInfo';
import useCSVParser from '@/hooks/useCSVParser';
import { getCollections, processCSVData } from '@/services/firebaseService';

const Index = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [csvFields, setCsvFields] = useState<string[]>([]);
  const [keyField, setKeyField] = useState<string>('');
  const [schemaKeyField, setSchemaKeyField] = useState<string>('StockCode');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [useCustomSchema, setUseCustomSchema] = useState<boolean>(false);
  const { parseCSV, parsedData, headers } = useCSVParser();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching Firestore collections...");
        const collectionsList = await getCollections();
        console.log("Received collections:", collectionsList);
        
        const filteredCollections = collectionsList.filter(col => 
          col.length > 1 || ["a", "b", "c"].includes(col)
        );
        
        console.log("Filtered collections for display:", filteredCollections);
        setCollections(filteredCollections);
        
        if (filteredCollections.length > 0) {
          const priorityCollections = ["vehichles", "vehicles", "products", "inventory", "orders"];
          const defaultCollection = priorityCollections.find(c => filteredCollections.includes(c)) || filteredCollections[0];
          setSelectedCollection(defaultCollection);
          console.log("Selected default collection:", defaultCollection);
        } else {
          console.warn("No collections received from Firestore");
          toast({
            title: "No collections found",
            description: "Make sure you have proper permissions to access Firestore collections. Check your Firebase console and security rules.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast({
          title: "Error",
          description: "Failed to fetch Firestore collections. Check console for details.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    if (headers.length > 0) {
      setCsvFields(headers);
      if (headers.length > 0 && !useCustomSchema) {
        setKeyField(headers[0]);
      }
    }
  }, [headers, useCustomSchema]);

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    try {
      await parseCSV(uploadedFile, useCustomSchema ? DEFAULT_VEHICLE_SCHEMA : undefined);
      setSummary([]);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast({
        title: "Error parsing CSV",
        description: "Failed to parse the CSV file. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  const handleProcessData = async () => {
    if (!file || !selectedCollection || !parsedData.length) {
      toast({
        title: "Missing information",
        description: "Please ensure all fields are filled and a CSV file is uploaded",
        variant: "destructive"
      });
      return;
    }

    // Use the appropriate key field based on whether we're using the schema or not
    const activeKeyField = useCustomSchema ? schemaKeyField : keyField;
    
    if (!activeKeyField) {
      toast({
        title: "Missing key field",
        description: "Please select a key field for duplicate checking",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processCSVData(parsedData, selectedCollection, activeKeyField);
      setSummary(result);
      toast({
        title: "Success",
        description: `Processed ${result.length} documents: ${result.filter(i => i.status === 'added').length} added, ${result.filter(i => i.status === 'updated').length} updated`,
      });
    } catch (error) {
      console.error("Error processing data:", error);
      toast({
        title: "Error",
        description: "Failed to process the CSV data",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseSchema = (schema: string[]) => {
    setUseCustomSchema(true);
    if (file) {
      parseCSV(file, schema);
    }
    setSchemaKeyField('StockCode'); // Default to first field when schema is applied
    toast({
      title: "Vehicle schema applied",
      description: "The vehicle schema will be used for CSV files without headers",
    });
  };

  const reset = () => {
    setFile(null);
    setSummary([]);
    setUseCustomSchema(false);
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 min-h-screen yellow-gradient">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 glow-text flex items-center justify-center gap-4">
          <span className="text-5xl float emoji-shadow">🔥</span> 
          Beny's CSV to Firebase Uploader 
          <span className="text-5xl float-delayed emoji-shadow">⚡</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          <span className="text-2xl float-delayed-more mr-2 emoji-shadow">📊</span>
          Upload CSV data to Firestore with duplicate checking
          <span className="text-2xl float ml-2 emoji-shadow">🚀</span>
        </p>
      </div>

      <Card className="transition-all duration-300 ease-in-out glow-card accent-gradient backdrop-blur-sm bg-black/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl emoji-shadow">📁</span> Upload & Process Data
          </CardTitle>
          <CardDescription>Select a collection, upload a CSV file, and choose a key field for duplicate checking</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mr-2"></div>
              <p>Loading collections...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="bg-black/60 p-6 rounded-md border border-yellow-500/30 mb-6">
              <h3 className="font-medium text-yellow-500 flex items-center gap-2">
                <span className="text-xl emoji-shadow">⚠️</span> No Collections Found
              </h3>
              <p className="text-sm text-yellow-300/80 mt-1">
                No Firestore collections were found. This may be due to permissions issues. 
                Please check your Firestore security rules to ensure read access is granted.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10" 
                onClick={() => window.location.reload()}
              >
                <span className="mr-1">🔄</span> Retry
              </Button>
            </div>
          ) : (
            <>
              <CollectionSelector
                collections={collections}
                selectedCollection={selectedCollection}
                onCollectionChange={setSelectedCollection}
                disabled={isProcessing}
              />

              <VehicleSchemaInfo 
                onUseSchema={handleUseSchema} 
                schemaKeyField={schemaKeyField} 
                onSchemaKeyFieldChange={setSchemaKeyField} 
                isSchemaActive={useCustomSchema}
              />

              {!file ? (
                <FileUpload
                  onFileUploaded={handleFileUpload}
                  isProcessing={isProcessing}
                />
              ) : (
                <div className="w-full mb-8 animate-in fade-in">
                  <div className="flex items-center justify-between mb-4 bg-black/40 p-4 rounded-lg border border-primary/20">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <span className="emoji-shadow">📄</span> File uploaded:
                      </p>
                      <p className="text-sm text-muted-foreground">{file.name}</p>
                    </div>
                    <Button variant="outline" onClick={reset} disabled={isProcessing} className="border-primary/30 hover:bg-primary/10">
                      <span className="mr-1">🔄</span> Change file
                    </Button>
                  </div>

                  {csvFields.length > 0 && !useCustomSchema && (
                    <KeyFieldSelector
                      fields={csvFields}
                      selectedField={keyField}
                      onFieldChange={setKeyField}
                      disabled={isProcessing}
                    />
                  )}

                  <Button
                    onClick={handleProcessData}
                    disabled={isProcessing || (!keyField && !useCustomSchema) || (useCustomSchema && !schemaKeyField)}
                    className="w-full transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 glow-border"
                  >
                    {isProcessing ? (
                      <><span className="animate-spin mr-2">⚙️</span> Processing...</>
                    ) : (
                      <><span className="mr-2">🚀</span> Process Data</>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {summary.length > 0 && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
          <ProcessingSummary summary={summary} keyField={useCustomSchema ? schemaKeyField : keyField} />
        </div>
      )}
    </div>
  );
};

export default Index;
