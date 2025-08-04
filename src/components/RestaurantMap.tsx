import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Restaurant, ClusterData } from '@/types/restaurant';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RestaurantMapProps {
  restaurants: Restaurant[];
  clusters: ClusterData[];
  showClusters: boolean;
  showHeatmap: boolean;
  filteredRestaurants?: Restaurant[];
}

const RestaurantMap: React.FC<RestaurantMapProps> = ({ 
  restaurants, 
  clusters, 
  showClusters, 
  showHeatmap,
  filteredRestaurants = restaurants 
}) => {
  // Calculate map center and bounds
  const getMapBounds = () => {
    if (filteredRestaurants.length === 0) {
      return { center: [40.7589, -73.9851] as [number, number], zoom: 10 };
    }

    const lats = filteredRestaurants.map(r => r.lat);
    const lons = filteredRestaurants.map(r => r.lon);

    const center = [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lons) + Math.max(...lons)) / 2
    ] as [number, number];

    return { center };
  };

  const { center } = getMapBounds();

  // Create custom icons for different cuisines
  const getCuisineIcon = (cuisine?: string) => {
    const colors: { [key: string]: string } = {
      'Italian': '#e91e63',
      'Japanese': '#9c27b0',
      'French': '#3f51b5',
      'Indian': '#00bcd4',
      'American': '#4caf50',
      'Chinese': '#ff9800',
      'Mexican': '#f44336',
      'Mediterranean': '#795548',
      'Vegetarian': '#8bc34a',
      'Seafood': '#00acc1',
      'Unknown': '#9e9e9e'
    };

    const color = colors[cuisine || 'Unknown'] || colors['Unknown'];
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  // Create cluster center icons
  const getClusterIcon = (cluster: ClusterData) => {
    return L.divIcon({
      className: 'cluster-marker',
      html: `<div style="
        background-color: ${cluster.color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">${cluster.restaurants.length}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const renderRestaurantMarkers = () => {
    return filteredRestaurants.map((restaurant) => (
      <Marker
        key={restaurant.id}
        position={[restaurant.lat, restaurant.lon]}
        icon={getCuisineIcon(restaurant.cuisine)}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold text-lg">{restaurant.name}</h3>
            <p className="text-sm text-gray-600">
              <strong>Cuisine:</strong> {restaurant.cuisine || 'Unknown'}
            </p>
            {restaurant.zone && (
              <p className="text-sm text-gray-600">
                <strong>Zone:</strong> {restaurant.zone}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {restaurant.lat.toFixed(4)}, {restaurant.lon.toFixed(4)}
            </p>
          </div>
        </Popup>
      </Marker>
    ));
  };

  const renderClusterMarkers = () => {
    const clusterElements = [];
    
    for (const cluster of clusters) {
      // Add cluster center
      clusterElements.push(
        <Marker
          key={`cluster-${cluster.id}`}
          position={cluster.center}
          icon={getClusterIcon(cluster)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-lg">Cluster {cluster.id + 1}</h3>
              <p className="text-sm text-gray-600">
                <strong>Restaurants:</strong> {cluster.restaurants.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Center: {cluster.center[0].toFixed(4)}, {cluster.center[1].toFixed(4)}
              </p>
              <div className="mt-2">
                <strong className="text-sm">Restaurants in cluster:</strong>
                <ul className="text-xs mt-1 max-h-20 overflow-y-auto">
                  {cluster.restaurants.slice(0, 5).map((restaurant) => (
                    <li key={restaurant.id}>{restaurant.name}</li>
                  ))}
                  {cluster.restaurants.length > 5 && (
                    <li className="text-gray-500">...and {cluster.restaurants.length - 5} more</li>
                  )}
                </ul>
              </div>
            </div>
          </Popup>
        </Marker>
      );

      // Add cluster members
      for (const restaurant of cluster.restaurants) {
        clusterElements.push(
          <CircleMarker
            key={`cluster-member-${restaurant.id}`}
            center={[restaurant.lat, restaurant.lon]}
            radius={6}
            pathOptions={{
              fillColor: cluster.color,
              color: 'white',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                <p className="text-sm text-gray-600">
                  <strong>Cuisine:</strong> {restaurant.cuisine || 'Unknown'}
                </p>
                <p className="text-sm" style={{ color: cluster.color }}>
                  <strong>Cluster:</strong> {cluster.id + 1}
                </p>
                {restaurant.zone && (
                  <p className="text-sm text-gray-600">
                    <strong>Zone:</strong> {restaurant.zone}
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      }
    }
    
    return clusterElements;
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={10}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {showClusters ? renderClusterMarkers() : renderRestaurantMarkers()}
      </MapContainer>
    </div>
  );
};

export default RestaurantMap;