import Papa from 'papaparse';
import { Restaurant } from '@/types/restaurant';

export function parseCSVData(csvText: string): Promise<Restaurant[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          const restaurants: Restaurant[] = result.data.map((row: any, index: number) => {
            // Try different column name variations
            const name = row.name || row.Name || row.restaurant_name || row.Restaurant || `Restaurant ${index + 1}`;
            const lat = parseFloat(row.lat || row.latitude || row.Lat || row.Latitude);
            const lon = parseFloat(row.lon || row.lng || row.longitude || row.Lon || row.Lng || row.Longitude);
            const cuisine = row.cuisine || row.Cuisine || row.type || row.Type || 'Unknown';
            const zone = row.zone || row.Zone || row.area || row.Area || row.district || row.District;
            
            if (isNaN(lat) || isNaN(lon)) {
              throw new Error(`Invalid coordinates for row ${index + 1}: lat=${lat}, lon=${lon}`);
            }
            
            return {
              id: `restaurant-${index}`,
              name: String(name),
              lat,
              lon,
              cuisine: cuisine ? String(cuisine) : undefined,
              zone: zone ? String(zone) : undefined
            };
          });
          
          resolve(restaurants);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

export async function fetchDataFromURL(url: string): Promise<Restaurant[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    return await parseCSVData(csvText);
  } catch (error) {
    throw new Error(`Failed to fetch data from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function generateSampleData(): Restaurant[] {
  const sampleRestaurants: Restaurant[] = [
    { id: 'r1', name: 'Mario\'s Italian Bistro', lat: 40.7589, lon: -73.9851, cuisine: 'Italian', zone: 'Manhattan' },
    { id: 'r2', name: 'Sakura Sushi', lat: 40.7505, lon: -73.9934, cuisine: 'Japanese', zone: 'Manhattan' },
    { id: 'r3', name: 'Le Petit Paris', lat: 40.7614, lon: -73.9776, cuisine: 'French', zone: 'Manhattan' },
    { id: 'r4', name: 'Spice Route', lat: 40.7505, lon: -73.9934, cuisine: 'Indian', zone: 'Manhattan' },
    { id: 'r5', name: 'Brooklyn Burger Co.', lat: 40.6892, lon: -73.9442, cuisine: 'American', zone: 'Brooklyn' },
    { id: 'r6', name: 'Pasta Palace', lat: 40.7831, lon: -73.9712, cuisine: 'Italian', zone: 'Manhattan' },
    { id: 'r7', name: 'Dragon Garden', lat: 40.7589, lon: -73.9851, cuisine: 'Chinese', zone: 'Manhattan' },
    { id: 'r8', name: 'Taco Libre', lat: 40.6782, lon: -73.9442, cuisine: 'Mexican', zone: 'Brooklyn' },
    { id: 'r9', name: 'Mediterranean Delight', lat: 40.7505, lon: -73.9934, cuisine: 'Mediterranean', zone: 'Manhattan' },
    { id: 'r10', name: 'BBQ Masters', lat: 40.6892, lon: -73.9442, cuisine: 'American', zone: 'Brooklyn' },
    { id: 'r11', name: 'Green Garden', lat: 40.7831, lon: -73.9712, cuisine: 'Vegetarian', zone: 'Manhattan' },
    { id: 'r12', name: 'Ocean Breeze', lat: 40.7589, lon: -73.9851, cuisine: 'Seafood', zone: 'Manhattan' },
    { id: 'r13', name: 'Curry House', lat: 40.6782, lon: -73.9442, cuisine: 'Indian', zone: 'Brooklyn' },
    { id: 'r14', name: 'Pizza Corner', lat: 40.7505, lon: -73.9934, cuisine: 'Italian', zone: 'Manhattan' },
    { id: 'r15', name: 'Golden Wok', lat: 40.6892, lon: -73.9442, cuisine: 'Chinese', zone: 'Brooklyn' }
  ];
  
  return sampleRestaurants;
}