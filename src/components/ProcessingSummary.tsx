
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface SummaryItem {
  id: string;
  status: 'updated' | 'added';
  keyField: string;
  keyValue: string;
  fields?: string[];
}

interface ProcessingSummaryProps {
  summary: SummaryItem[];
  keyField: string;
}

const ProcessingSummary: React.FC<ProcessingSummaryProps> = ({ summary, keyField }) => {
  const addedCount = summary.filter(item => item.status === 'added').length;
  const updatedCount = summary.filter(item => item.status === 'updated').length;
  
  if (summary.length === 0) return null;
  
  return (
    <div className="w-full transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-4">
      <Card className="glow-card accent-gradient backdrop-blur-sm bg-black/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl emoji-shadow">📋</span> Processing Summary
          </CardTitle>
          <CardDescription>
            <span className="text-green-400">{addedCount} documents added</span>, <span className="text-blue-400">{updatedCount} documents updated</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.map((item) => (
              <div 
                key={item.id} 
                className="p-4 rounded-md border transition-all duration-200 ease-in-out hover:shadow-md bg-black/40 border-primary/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{keyField}: </span>
                    <span>{item.keyValue}</span>
                  </div>
                  <Badge variant={item.status === 'added' ? 'default' : 'secondary'} 
                    className={item.status === 'added' ? 'bg-green-500/80' : 'bg-blue-500/80'}>
                    {item.status === 'added' ? '✨ Added' : '🔄 Updated'}
                  </Badge>
                </div>
                
                {item.fields && item.fields.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-1">
                      {item.status === 'updated' ? '🔄 Updated fields:' : '✨ Fields added:'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.fields.map((field) => (
                        <Badge key={field} variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingSummary;
