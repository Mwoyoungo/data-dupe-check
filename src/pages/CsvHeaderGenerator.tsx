
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import HeaderEditor from '@/components/HeaderEditor';
import { toast } from '@/components/ui/use-toast';
import { parseCSVWithoutHeaders, applyHeadersToCSV, hasHeaders } from '@/utils/csvUtils';
import { Link } from 'react-router-dom';

const CsvHeaderGenerator: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [hasDetectedHeaders, setHasDetectedHeaders] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      setOriginalFile(file);
      
      const data = await parseCSVWithoutHeaders(file);
      setCsvData(data);
      
      if (data.length === 0) {
        toast({
          title: "Empty CSV file",
          description: "The uploaded CSV file appears to be empty.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Check if the CSV appears to have headers
      const headerDetected = hasHeaders(data);
      setHasDetectedHeaders(headerDetected);
      
      if (headerDetected) {
        setHeaders(data[0]);
        toast({
          title: "Headers detected",
          description: "We've detected headers in your CSV. You can edit them below.",
        });
      } else {
        // Generate placeholder headers (Column1, Column2, etc.)
        const placeholderHeaders = data[0].map((_, index) => `Column${index + 1}`);
        setHeaders(placeholderHeaders);
        toast({
          title: "No headers detected",
          description: "We've generated placeholder headers for your CSV. Please review and edit them below.",
        });
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing CSV file:", error);
      toast({
        title: "Error processing file",
        description: "An error occurred while processing the CSV file.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const handleDownload = () => {
    if (!originalFile || headers.length === 0 || csvData.length === 0) {
      toast({
        title: "Cannot download",
        description: "Please upload a CSV file and configure headers first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use the data with or without the first row depending on if headers were detected
      const dataToUse = hasDetectedHeaders ? csvData.slice(1) : csvData;
      
      // Generate CSV with headers
      const csvWithHeaders = applyHeadersToCSV(dataToUse, headers);
      
      // Create download link
      const blob = new Blob([csvWithHeaders], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename
      const originalFileName = originalFile.name;
      const extension = originalFileName.includes('.') 
        ? originalFileName.substring(originalFileName.lastIndexOf('.'))
        : '.csv';
      const baseName = originalFileName.includes('.')
        ? originalFileName.substring(0, originalFileName.lastIndexOf('.'))
        : originalFileName;
      
      link.setAttribute('download', `${baseName}-with-headers${extension}`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your CSV file with headers has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download failed",
        description: "An error occurred while generating the download.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-yellow-400">CSV Header Generator</h1>
        <Link to="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
      
      <div className="bg-card rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload your CSV file</h2>
        <FileUpload 
          onFileUploaded={handleFileUpload} 
          isProcessing={isProcessing} 
        />
      </div>
      
      {headers.length > 0 && csvData.length > 0 && (
        <div className="bg-card rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {hasDetectedHeaders ? "Edit detected headers" : "Define headers"}
          </h2>
          
          <div className="mb-6">
            <HeaderEditor 
              headers={headers} 
              onHeaderChange={handleHeaderChange} 
              previewData={hasDetectedHeaders ? csvData.slice(1) : csvData} 
            />
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleDownload} className="bg-yellow-400 hover:bg-yellow-500 text-black">
              Download CSV with Headers
            </Button>
          </div>
        </div>
      )}
      
      {csvData.length > 0 && (
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Data Preview</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} className="border border-gray-300 px-4 py-2 bg-gray-100">
                      {header || `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(hasDetectedHeaders ? csvData.slice(1, 6) : csvData.slice(0, 5)).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {csvData.length > 5 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing first {hasDetectedHeaders ? 5 : 5} rows of {hasDetectedHeaders ? csvData.length - 1 : csvData.length} total rows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvHeaderGenerator;
