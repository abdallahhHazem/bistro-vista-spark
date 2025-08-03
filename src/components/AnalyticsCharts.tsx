import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Restaurant } from '@/types/restaurant';

interface AnalyticsChartsProps {
  restaurants: Restaurant[];
  filteredRestaurants: Restaurant[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ restaurants, filteredRestaurants }) => {
  // Process cuisine data
  const cuisineData = React.useMemo(() => {
    const cuisineCounts: { [key: string]: number } = {};
    filteredRestaurants.forEach(restaurant => {
      const cuisine = restaurant.cuisine || 'Unknown';
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
    });
    
    return Object.entries(cuisineCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRestaurants]);

  // Process zone data
  const zoneData = React.useMemo(() => {
    const zoneCounts: { [key: string]: number } = {};
    filteredRestaurants.forEach(restaurant => {
      if (restaurant.zone) {
        zoneCounts[restaurant.zone] = (zoneCounts[restaurant.zone] || 0) + 1;
      }
    });
    
    return Object.entries(zoneCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRestaurants]);

  // Geographic distribution data
  const geoData = React.useMemo(() => {
    return filteredRestaurants.map(restaurant => ({
      name: restaurant.name,
      lat: restaurant.lat,
      lon: restaurant.lon,
      cuisine: restaurant.cuisine || 'Unknown'
    }));
  }, [filteredRestaurants]);

  // Colors for charts
  const cuisineColors = [
    '#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50', 
    '#ff9800', '#f44336', '#795548', '#607d8b', '#9e9e9e'
  ];

  const zoneColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
    '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce'
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-dashboard-primary">{filteredRestaurants.length}</div>
              <div className="text-sm text-muted-foreground">Total Restaurants</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-dashboard-secondary">{cuisineData.length}</div>
              <div className="text-sm text-muted-foreground">Cuisine Types</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-dashboard-accent">{zoneData.length}</div>
              <div className="text-sm text-muted-foreground">Zones</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cuisine Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cuisine Distribution</CardTitle>
            <CardDescription>Breakdown of restaurants by cuisine type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cuisineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cuisineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={cuisineColors[index % cuisineColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurants by Cuisine</CardTitle>
            <CardDescription>Number of restaurants per cuisine type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cuisineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#e91e63" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Zone Analysis */}
      {zoneData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Zone Distribution</CardTitle>
              <CardDescription>Restaurants by geographic zone</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={zoneData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {zoneData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={zoneColors[index % zoneColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restaurants by Zone</CardTitle>
              <CardDescription>Number of restaurants per zone</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={zoneData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#9c27b0" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Latitude and longitude distribution of restaurants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={geoData.reduce((acc: any[], restaurant) => {
                  const latBin = Math.round(restaurant.lat * 100) / 100;
                  const existing = acc.find(item => item.lat === latBin);
                  if (existing) {
                    existing.count++;
                  } else {
                    acc.push({ lat: latBin, count: 1 });
                  }
                  return acc;
                }, []).sort((a, b) => a.lat - b.lat)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lat" fontSize={10} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Restaurants']}
                  labelFormatter={(label) => `Latitude: ${label}`}
                />
                <Bar dataKey="count" fill="#00bcd4" name="Latitude Distribution" />
              </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={geoData.reduce((acc: any[], restaurant) => {
                  const lonBin = Math.round(restaurant.lon * 100) / 100;
                  const existing = acc.find(item => item.lon === lonBin);
                  if (existing) {
                    existing.count++;
                  } else {
                    acc.push({ lon: lonBin, count: 1 });
                  }
                  return acc;
                }, []).sort((a, b) => a.lon - b.lon)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lon" fontSize={10} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Restaurants']}
                  labelFormatter={(label) => `Longitude: ${label}`}
                />
                <Bar dataKey="count" fill="#4caf50" name="Longitude Distribution" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;