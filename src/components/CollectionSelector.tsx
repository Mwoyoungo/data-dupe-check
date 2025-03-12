
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
      <Label htmlFor="collection" className="mb-2 block flex items-center gap-2">
        <span className="text-xl emoji-shadow">🗃️</span> Select Firestore Collection
      </Label>
      <Select
        value={selectedCollection}
        onValueChange={onCollectionChange}
        disabled={disabled}
      >
        <SelectTrigger id="collection" className="w-full bg-black/60 border-yellow-500/30 focus:ring-yellow-500/50">
          <SelectValue placeholder="Select a collection" />
        </SelectTrigger>
        <SelectContent className="bg-black border-yellow-500/30">
          {collections.map((collection) => (
            <SelectItem key={collection} value={collection} className="focus:bg-yellow-500/20 focus:text-yellow-400">
              {collection}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CollectionSelector;
