
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Default schema for vehicle data
export const DEFAULT_VEHICLE_SCHEMA = [
  'StockCode',
  'Description',
  'LongDesc',
  'Customer',
  'RegNo',
  'WarrantyStartDate',
  'WarrantyBookNo',
  'EngineNo',
  'KM',
  'WarrantyEndDate',
  'VehicleProdClass',
  'ProductClass'
];

interface VehicleSchemaInfoProps {
  onUseSchema: (schema: string[]) => void;
}

const VehicleSchemaInfo: React.FC<VehicleSchemaInfoProps> = ({ onUseSchema }) => {
  return (
    <div className="mb-6 p-4 rounded-md border border-yellow-500/30 bg-black/60 transition-all duration-200 ease-in-out">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-yellow-400 flex items-center gap-2">
          <span className="text-xl emoji-shadow">🚗</span> Vehicle Data Schema
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                onClick={() => onUseSchema(DEFAULT_VEHICLE_SCHEMA)}
              >
                Use Schema
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-black border-yellow-500/30 text-yellow-300">
              <p>Apply this schema to CSV without headers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <p className="text-sm text-gray-400 mb-3">
        If your CSV data doesn't have column headers, this predefined schema will be applied:
      </p>
      
      <div className="bg-black/40 p-3 rounded border border-yellow-500/20 max-h-40 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {DEFAULT_VEHICLE_SCHEMA.map((field, index) => (
            <div key={field} className="flex items-center gap-2">
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full w-6 h-6 flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-sm text-yellow-300">{field}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleSchemaInfo;
