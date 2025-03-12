
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface KeyFieldSelectorProps {
  fields: string[];
  selectedField: string;
  onFieldChange: (field: string) => void;
  disabled?: boolean;
}

const KeyFieldSelector: React.FC<KeyFieldSelectorProps> = ({
  fields,
  selectedField,
  onFieldChange,
  disabled = false
}) => {
  return (
    <div className="mb-6 transition-all duration-200 ease-in-out">
      <Label htmlFor="keyField" className="mb-2 block">Select Key Field for Duplicate Check</Label>
      <Select
        value={selectedField}
        onValueChange={onFieldChange}
        disabled={disabled}
      >
        <SelectTrigger id="keyField" className="w-full">
          <SelectValue placeholder="Select a field" />
        </SelectTrigger>
        <SelectContent>
          {fields.map((field) => (
            <SelectItem key={field} value={field}>
              {field}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default KeyFieldSelector;
