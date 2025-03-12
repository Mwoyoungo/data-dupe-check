
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import FileUpload from '@/components/FileUpload';
import CollectionSelector from '@/components/CollectionSelector';
import KeyFieldSelector from '@/components/KeyFieldSelector';
import ProcessingSummary, { SummaryItem } from '@/components/ProcessingSummary';
import useCSVParser from '@/hooks/useCSVParser';
import { getCollections, processCSVData } from '@/services/firebaseService';

const Index = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [csvFields, setCsvFields] = useState<string[]>([]);
  const [keyField, setKeyField] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const { parseCSV, parsedData, headers } = useCSVParser();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching Firestore collections...");
        const collectionsList = await getCollections();
        console.log("Received collections:", collectionsList);
        
        // Filter out single letter test collections
        const filteredCollections = collectionsList.filter(col => 
          col.length > 1 || ["a", "b", "c"].includes(col)
        );
        
        console.log("Filtered collections for display:", filteredCollections);
        setCollections(filteredCollections);
        
        if (filteredCollections.length > 0) {
          // Prioritize real collections over test ones
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
      if (headers.length > 0) {
        setKeyField(headers[0]);
      }
    }
  }, [headers]);

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    await parseCSV(uploadedFile);
    setSummary([]);
  };

  const handleProcessData = async () => {
    if (!file || !selectedCollection || !keyField || !parsedData.length) {
      toast({
        title: "Missing information",
        description: "Please ensure all fields are filled and a CSV file is uploaded",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processCSVData(parsedData, selectedCollection, keyField);
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

  const reset = () => {
    setFile(null);
    setSummary([]);
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Firestore CSV Uploader</h1>
        <p className="text-muted-foreground">Upload CSV data to Firestore with duplicate checking</p>
      </div>

      <Card className="transition-all duration-300 ease-in-out">
        <CardHeader>
          <CardTitle>Upload & Process Data</CardTitle>
          <CardDescription>Select a collection, upload a CSV file, and choose a key field for duplicate checking</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mr-2"></div>
              <p>Loading collections...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
              <h3 className="font-medium text-yellow-800">No Collections Found</h3>
              <p className="text-sm text-yellow-700 mt-1">
                No Firestore collections were found. This may be due to permissions issues. 
                Please check your Firestore security rules to ensure read access is granted.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3" 
                onClick={() => window.location.reload()}
              >
                Retry
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

              {!file ? (
                <FileUpload
                  onFileUploaded={handleFileUpload}
                  isProcessing={isProcessing}
                />
              ) : (
                <div className="w-full mb-8 animate-in fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">File uploaded:</p>
                      <p className="text-sm text-muted-foreground">{file.name}</p>
                    </div>
                    <Button variant="outline" onClick={reset} disabled={isProcessing}>
                      Change file
                    </Button>
                  </div>

                  {csvFields.length > 0 && (
                    <KeyFieldSelector
                      fields={csvFields}
                      selectedField={keyField}
                      onFieldChange={setKeyField}
                      disabled={isProcessing}
                    />
                  )}

                  <Button
                    onClick={handleProcessData}
                    disabled={isProcessing || !keyField}
                    className="w-full transition-all duration-200"
                  >
                    {isProcessing ? "Processing..." : "Process Data"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {summary.length > 0 && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
          <ProcessingSummary summary={summary} keyField={keyField} />
        </div>
      )}
    </div>
  );
};

export default Index;

