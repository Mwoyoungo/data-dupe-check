
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HeaderEditorProps {
  headers: string[];
  onHeaderChange: (index: number, value: string) => void;
  previewData?: string[][];
}

const HeaderEditor: React.FC<HeaderEditorProps> = ({ 
  headers, 
  onHeaderChange,
  previewData = []
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {headers.map((header, index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`header-${index}`}>Column {index + 1}</Label>
            <Input
              id={`header-${index}`}
              value={header}
              onChange={(e) => onHeaderChange(index, e.target.value)}
              placeholder={`Header ${index + 1}`}
              className="w-full"
            />
            {previewData.length > 0 && (
              <div className="text-xs text-gray-500 italic truncate">
                Example: {previewData[0][index] || 'N/A'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeaderEditor;
