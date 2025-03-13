
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FieldMapping {
  csvField: string;
  schemaField: string;
}

interface SchemaAlignmentTableProps {
  csvHeaders: string[];
  schemaFields: string[];
  fieldMappings: FieldMapping[];
  setFieldMappings: React.Dispatch<React.SetStateAction<FieldMapping[]>>;
  disabled?: boolean;
}

export const SchemaAlignmentTable: React.FC<SchemaAlignmentTableProps> = ({
  csvHeaders,
  schemaFields,
  fieldMappings,
  setFieldMappings,
  disabled = false,
}) => {
  const handleSchemaFieldChange = (csvField: string, schemaField: string) => {
    setFieldMappings(prev => 
      prev.map(mapping => 
        mapping.csvField === csvField 
          ? { ...mapping, schemaField } 
          : mapping
      )
    );
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-black/40">
          <TableRow>
            <TableHead className="text-yellow-400">CSV Column</TableHead>
            <TableHead className="text-yellow-400">Firebase Field</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fieldMappings.map((mapping, index) => (
            <TableRow key={index} className="hover:bg-black/60">
              <TableCell className="text-gray-300">{mapping.csvField}</TableCell>
              <TableCell>
                <Select
                  value={mapping.schemaField}
                  onValueChange={(value) => handleSchemaFieldChange(mapping.csvField, value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="bg-black/60 border-yellow-500/30 focus:ring-yellow-500/50">
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-yellow-500/30">
                    <SelectItem value="" className="text-gray-400 italic">Ignore this column</SelectItem>
                    {schemaFields.map((field) => (
                      <SelectItem key={field} value={field} className="focus:bg-yellow-500/20 focus:text-yellow-400">
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
