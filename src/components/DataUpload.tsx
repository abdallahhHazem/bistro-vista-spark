import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, Database } from 'lucide-react';
import { parseCSVData, fetchDataFromURL, generateSampleData } from '@/utils/dataParser';
import { Restaurant } from '@/types/restaurant';
import { useToast } from '@/hooks/use-toast';

interface DataUploadProps {
  onDataLoaded: (restaurants: Restaurant[]) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ onDataLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const restaurants = await parseCSVData(text);
      onDataLoaded(restaurants);
      toast({
        title: "Success!",
        description: `Loaded ${restaurants.length} restaurants from CSV file.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleURLSubmit = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      const restaurants = await fetchDataFromURL(url);
      onDataLoaded(restaurants);
      toast({
        title: "Success!",
        description: `Loaded ${restaurants.length} restaurants from URL.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch data from URL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleData = () => {
    const sampleData = generateSampleData();
    onDataLoaded(sampleData);
    toast({
      title: "Sample Data Loaded",
      description: `Loaded ${sampleData.length} sample restaurants.`,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl bg-gradient-to-r from-dashboard-primary to-dashboard-secondary bg-clip-text text-transparent">
          Restaurant Data Import
        </CardTitle>
        <CardDescription>
          Upload a CSV file, provide a URL, or use sample data to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload CSV
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              From URL
            </TabsTrigger>
            <TabsTrigger value="sample" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Sample Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Choose CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Expected columns:</strong> name, lat, lon, cuisine (optional), zone (optional)</p>
              <p><strong>Alternative names:</strong> latitude/longitude, restaurant_name, type, area, district</p>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Data URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/restaurants.csv"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleURLSubmit} 
              disabled={isLoading || !url.trim()}
              className="w-full"
            >
              {isLoading ? 'Loading...' : 'Load Data from URL'}
            </Button>
            <div className="text-sm text-muted-foreground">
              <p><strong>Tip:</strong> You can use Google Sheets export URLs or any public CSV endpoint</p>
            </div>
          </TabsContent>

          <TabsContent value="sample" className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Load sample restaurant data to explore the dashboard features
              </p>
              <Button 
                onClick={handleSampleData}
                className="w-full"
                variant="outline"
              >
                Load Sample Data (15 restaurants)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataUpload;