
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
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const { parseCSV, parsedData, headers } = useCSVParser();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        console.log("Fetching Firestore collections...");
        const collectionsList = await getCollections();
        console.log("Received collections:", collectionsList);
        
        setCollections(collectionsList);
        if (collectionsList.length > 0) {
          setSelectedCollection(collectionsList[0]);
        } else {
          console.warn("No collections received from Firestore");
          toast({
            title: "Warning",
            description: "No collections found in Firestore",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast({
          title: "Error",
          description: "Failed to fetch Firestore collections",
          variant: "destructive"
        });
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

