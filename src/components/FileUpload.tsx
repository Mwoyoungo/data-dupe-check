
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onFileUploaded: (file: File) => void;
  isProcessing: boolean;
  acceptXLSX?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, isProcessing, acceptXLSX = false }) => {
  const [dragActive, setDragActive] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    
    if (!isCSV && !isXLSX) {
      toast({
        title: "Invalid file format",
        description: `Please upload a ${acceptXLSX ? 'CSV or XLSX' : 'CSV'} file`,
        variant: "destructive"
      });
      return;
    }
    
    onFileUploaded(file);
  }, [onFileUploaded, acceptXLSX]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptXLSX 
      ? { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx', '.xls'] }
      : { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled: isProcessing
  });
  
  return (
    <div className="w-full mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-yellow-500/30 hover:border-primary'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDrop={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        <div className="transition-transform duration-200 ease-in-out transform hover:scale-105">
          <div className="text-6xl mb-4 emoji-shadow float">📊</div>
          <p className="text-lg font-medium mb-2 text-yellow-400">Drag & Drop your {acceptXLSX ? 'CSV or XLSX' : 'CSV'} file here</p>
          <p className="text-sm text-gray-400 mb-4">or</p>
          <Button 
            variant="outline" 
            disabled={isProcessing}
            className="transition-all duration-200 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
          >
            <span className="mr-2">📂</span> Browse files
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
