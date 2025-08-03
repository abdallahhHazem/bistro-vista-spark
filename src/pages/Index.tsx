import React, { useState } from 'react';
import DataUpload from '@/components/DataUpload';
import Dashboard from '@/components/Dashboard';
import { Restaurant } from '@/types/restaurant';

const Index = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const handleDataLoaded = (loadedRestaurants: Restaurant[]) => {
    setRestaurants(loadedRestaurants);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {restaurants.length === 0 ? (
          <div className="flex items-center justify-center min-h-screen">
            <DataUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <Dashboard restaurants={restaurants} />
        )}
      </div>
    </div>
  );
};

export default Index;
