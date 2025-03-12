
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CollectionSelectorProps {
  collections: string[];
  selectedCollection: string;
  onCollectionChange: (collection: string) => void;
  disabled?: boolean;
}

const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  collections,
  selectedCollection,
  onCollectionChange,
  disabled = false
}) => {
  return (
    <div className="mb-6 transition-all duration-200 ease-in-out">
      <Label htmlFor="collection" className="mb-2 block">Select Firestore Collection</Label>
      <Select
        value={selectedCollection}
        onValueChange={onCollectionChange}
        disabled={disabled}
      >
        <SelectTrigger id="collection" className="w-full">
          <SelectValue placeholder="Select a collection" />
        </SelectTrigger>
        <SelectContent>
          {collections.map((collection) => (
            <SelectItem key={collection} value={collection}>
              {collection}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CollectionSelector;
