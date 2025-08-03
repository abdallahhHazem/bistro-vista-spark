import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, BarChart3, PieChart, Layers, Settings, Filter } from 'lucide-react';
import { Restaurant, ClusterData } from '@/types/restaurant';
import { kMeansCluster } from '@/utils/clustering';
import RestaurantMap from './RestaurantMap';
import AnalyticsCharts from './AnalyticsCharts';

interface DashboardProps {
  restaurants: Restaurant[];
}

const Dashboard: React.FC<DashboardProps> = ({ restaurants }) => {
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [showClusters, setShowClusters] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [clusterCount, setClusterCount] = useState(5);

  // Generate clusters
  const clusters: ClusterData[] = useMemo(() => {
    return kMeansCluster(restaurants, clusterCount);
  }, [restaurants, clusterCount]);

  // Get unique cuisines and zones
  const cuisines = useMemo(() => {
    const uniqueCuisines = Array.from(new Set(restaurants.map(r => r.cuisine).filter(Boolean)));
    return uniqueCuisines.sort();
  }, [restaurants]);

  const zones = useMemo(() => {
    const uniqueZones = Array.from(new Set(restaurants.map(r => r.zone).filter(Boolean)));
    return uniqueZones.sort();
  }, [restaurants]);

  // Filter restaurants based on selected criteria
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      const cuisineMatch = selectedCuisine === 'all' || restaurant.cuisine === selectedCuisine;
      const zoneMatch = selectedZone === 'all' || restaurant.zone === selectedZone;
      return cuisineMatch && zoneMatch;
    });
  }, [restaurants, selectedCuisine, selectedZone]);

  const clearFilters = () => {
    setSelectedCuisine('all');
    setSelectedZone('all');
  };

  const hasActiveFilters = selectedCuisine !== 'all' || selectedZone !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-dashboard-primary via-dashboard-secondary to-dashboard-accent bg-clip-text text-transparent">
          Restaurant Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Analyze {restaurants.length} restaurants with interactive maps, clustering, and detailed insights
        </p>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Controls
          </CardTitle>
          <CardDescription>
            Filter restaurants and customize visualizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cuisine Filter */}
            <div className="space-y-2">
              <Label>Cuisine Type</Label>
              <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                <SelectTrigger>
                  <SelectValue placeholder="All cuisines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  {cuisines.map(cuisine => (
                    <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone Filter */}
            {zones.length > 0 && (
              <div className="space-y-2">
                <Label>Zone</Label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="All zones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    {zones.map(zone => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Cluster Count */}
            <div className="space-y-2">
              <Label>Cluster Count</Label>
              <Select value={clusterCount.toString()} onValueChange={(value) => setClusterCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8].map(count => (
                    <SelectItem key={count} value={count.toString()}>{count} clusters</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <Label>Actions</Label>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCuisine !== 'all' && (
                <Badge variant="secondary">Cuisine: {selectedCuisine}</Badge>
              )}
              {selectedZone !== 'all' && (
                <Badge variant="secondary">Zone: {selectedZone}</Badge>
              )}
            </div>
          )}

          {/* Map Controls */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="clusters"
                checked={showClusters}
                onCheckedChange={setShowClusters}
              />
              <Label htmlFor="clusters">Show Clusters</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="heatmap"
                checked={showHeatmap}
                onCheckedChange={setShowHeatmap}
              />
              <Label htmlFor="heatmap">Show Heatmap</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Interactive Map
          </TabsTrigger>
          <TabsTrigger value="clusters" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Clusters
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Locations</CardTitle>
              <CardDescription>
                Interactive map showing {filteredRestaurants.length} restaurants
                {hasActiveFilters && ` (filtered from ${restaurants.length} total)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantMap
                restaurants={restaurants}
                clusters={clusters}
                showClusters={false}
                showHeatmap={showHeatmap}
                filteredRestaurants={filteredRestaurants}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clusters Tab */}
        <TabsContent value="clusters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>K-Means Clustering Analysis</CardTitle>
              <CardDescription>
                Restaurants grouped into {clusterCount} clusters using geographic coordinates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestaurantMap
                restaurants={restaurants}
                clusters={clusters}
                showClusters={true}
                showHeatmap={false}
                filteredRestaurants={filteredRestaurants}
              />
            </CardContent>
          </Card>

          {/* Cluster Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.map((cluster) => (
              <Card key={cluster.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cluster.color }}
                    />
                    Cluster {cluster.id + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Restaurants:</strong> {cluster.restaurants.length}
                    </p>
                    <p className="text-sm">
                      <strong>Center:</strong> {cluster.center[0].toFixed(4)}, {cluster.center[1].toFixed(4)}
                    </p>
                    <div className="text-sm">
                      <strong>Top Cuisines:</strong>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(
                          cluster.restaurants.reduce((acc: { [key: string]: number }, r) => {
                            const cuisine = r.cuisine || 'Unknown';
                            acc[cuisine] = (acc[cuisine] || 0) + 1;
                            return acc;
                          }, {})
                        )
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([cuisine, count]) => (
                            <Badge key={cuisine} variant="outline" className="text-xs">
                              {cuisine} ({count})
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsCharts 
            restaurants={restaurants} 
            filteredRestaurants={filteredRestaurants}
          />
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Automated analysis of your restaurant data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-dashboard-primary/10 rounded-lg">
                  <h4 className="font-semibold text-dashboard-primary">Most Popular Cuisine</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(() => {
                      const cuisineCounts = filteredRestaurants.reduce((acc: { [key: string]: number }, r) => {
                        const cuisine = r.cuisine || 'Unknown';
                        acc[cuisine] = (acc[cuisine] || 0) + 1;
                        return acc;
                      }, {});
                      const topCuisine = Object.entries(cuisineCounts).sort(([,a], [,b]) => b - a)[0];
                      return topCuisine ? `${topCuisine[0]} (${topCuisine[1]} restaurants)` : 'No data available';
                    })()}
                  </p>
                </div>

                <div className="p-4 bg-dashboard-secondary/10 rounded-lg">
                  <h4 className="font-semibold text-dashboard-secondary">Geographic Spread</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(() => {
                      const lats = filteredRestaurants.map(r => r.lat);
                      const lons = filteredRestaurants.map(r => r.lon);
                      if (lats.length === 0) return 'No data available';
                      
                      const latRange = Math.max(...lats) - Math.min(...lats);
                      const lonRange = Math.max(...lons) - Math.min(...lons);
                      return `Covers ${latRange.toFixed(3)}° latitude × ${lonRange.toFixed(3)}° longitude`;
                    })()}
                  </p>
                </div>

                <div className="p-4 bg-dashboard-accent/10 rounded-lg">
                  <h4 className="font-semibold text-dashboard-accent">Density Analysis</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {zones.length > 0 ? (
                      (() => {
                        const zoneCounts = filteredRestaurants.reduce((acc: { [key: string]: number }, r) => {
                          if (r.zone) acc[r.zone] = (acc[r.zone] || 0) + 1;
                          return acc;
                        }, {});
                        const denseZone = Object.entries(zoneCounts).sort(([,a], [,b]) => b - a)[0];
                        return denseZone ? `Highest density in ${denseZone[0]} (${denseZone[1]} restaurants)` : 'No zone data available';
                      })()
                    ) : (
                      'Zone data not available for density analysis'
                    )}
                  </p>
                </div>

                <div className="p-4 bg-dashboard-warning/10 rounded-lg">
                  <h4 className="font-semibold text-dashboard-warning">Clustering Effectiveness</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(() => {
                      if (clusters.length === 0) return 'No clusters generated';
                      const avgClusterSize = clusters.reduce((sum, c) => sum + c.restaurants.length, 0) / clusters.length;
                      return `Average cluster size: ${avgClusterSize.toFixed(1)} restaurants`;
                    })()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality</CardTitle>
                <CardDescription>Assessment of your dataset completeness</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Restaurant Names</span>
                    <Badge variant="outline">100%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Coordinates</span>
                    <Badge variant="outline">100%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cuisine Information</span>
                    <Badge variant="outline">
                      {Math.round((restaurants.filter(r => r.cuisine).length / restaurants.length) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Zone Information</span>
                    <Badge variant="outline">
                      {Math.round((restaurants.filter(r => r.zone).length / restaurants.length) * 100)}%
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {restaurants.filter(r => !r.cuisine).length > 0 && (
                      <li>• Consider adding cuisine data for {restaurants.filter(r => !r.cuisine).length} restaurants</li>
                    )}
                    {restaurants.filter(r => !r.zone).length > 0 && (
                      <li>• Zone information missing for {restaurants.filter(r => !r.zone).length} restaurants</li>
                    )}
                    {restaurants.length < 10 && (
                      <li>• More data points would improve clustering accuracy</li>
                    )}
                    {clusters.length > 0 && clusters.some(c => c.restaurants.length < 2) && (
                      <li>• Consider reducing cluster count for better grouping</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;