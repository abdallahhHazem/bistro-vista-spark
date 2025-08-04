import Papa from 'papaparse';
import { Restaurant } from '@/types/restaurant';

function convertGoogleSheetsURL(url: string): string {
  // Convert Google Sheets edit URL to CSV export URL
  const sheetsRegex = /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(sheetsRegex);
  
  if (match) {
    const spreadsheetId = match[1];
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
  }
  
  return url;
}

function validateURL(url: string): { isValid: boolean; message?: string } {
  try {
    new URL(url);
    
    if (url.includes('docs.google.com/spreadsheets')) {
      return { isValid: true };
    }
    
    if (url.endsWith('.csv') || url.includes('format=csv')) {
      return { isValid: true };
    }
    
    return { 
      isValid: true, 
      message: 'URL should point to a CSV file or Google Sheets document' 
    };
  } catch {
    return { isValid: false, message: 'Invalid URL format' };
  }
}

export function parseCSVData(csvText: string): Promise<Restaurant[]> {
  return new Promise((resolve, reject) => {
    // Debug: Log first 500 characters of CSV to help diagnose issues
    console.log('CSV Data Preview:', csvText.substring(0, 500));
    
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          console.log('Parsed CSV meta:', result.meta);
          console.log('Available columns:', result.meta.fields);
          console.log('First row of data:', result.data[0]);
          
          if (!result.data || result.data.length === 0) {
            throw new Error('No data found in CSV. Please check if the file contains valid restaurant data.');
          }
          
          const restaurants: Restaurant[] = result.data.map((row: any, index: number) => {
            // Try different column name variations (expanded list)
            const name = row.name || row.Name || row.restaurant_name || row.Restaurant || 
                        row['Restaurant Name'] || row.business_name || row['Business Name'] || 
                        row.title || row.Title || `Restaurant ${index + 1}`;
            
            const lat = parseFloat(
              row.lat || row.latitude || row.Lat || row.Latitude || 
              row.LAT || row.LATITUDE || row['latitude'] || row['Latitude'] ||
              row.y || row.Y || row.coord_lat || row.lat_coord
            );
            
            const lon = parseFloat(
              row.lon || row.lng || row.longitude || row.Lon || row.Lng || 
              row.Longitude || row.LON || row.LNG || row.LONGITUDE ||
              row['longitude'] || row['Longitude'] || row.x || row.X || 
              row.coord_lon || row.lng_coord || row.coord_lng
            );
            
            const cuisine = row.cuisine || row.Cuisine || row.type || row.Type || 
                          row.category || row.Category || row.food_type || row['Food Type'] ||
                          row.cuisine_type || row['Cuisine Type'];
            
            const zone = row.zone || row.Zone || row.area || row.Area || 
                        row.district || row.District || row.region || row.Region ||
                        row.neighborhood || row.Neighborhood || row.borough || row.Borough;
            
            // Debug: Log coordinate extraction for first few rows
            if (index < 3) {
              console.log(`Row ${index + 1} coordinates: lat=${lat}, lon=${lon}`);
              console.log(`Row ${index + 1} raw data:`, row);
            }
            
            if (isNaN(lat) || isNaN(lon)) {
              throw new Error(
                `Invalid coordinates for row ${index + 1}: lat=${lat}, lon=${lon}. ` +
                `Available columns: ${Object.keys(row).join(', ')}`
              );
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
          
          console.log(`Successfully parsed ${restaurants.length} restaurants`);
          resolve(restaurants);
        } catch (error) {
          console.error('CSV parsing error:', error);
          reject(error);
        }
      },
      error: (error) => {
        console.error('Papa parse error:', error);
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

export async function fetchDataFromURL(url: string): Promise<Restaurant[]> {
  try {
    // Validate URL format
    const validation = validateURL(url);
    if (!validation.isValid) {
      throw new Error(validation.message || 'Invalid URL');
    }
    
    // Convert Google Sheets URLs to CSV export format
    const csvUrl = convertGoogleSheetsURL(url);
    console.log('Original URL:', url);
    console.log('CSV URL:', csvUrl);
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('Response content type:', response.headers.get('content-type'));
    
    // Check if response is actually CSV
    if (csvText.includes('<!DOCTYPE html') || csvText.includes('<html')) {
      throw new Error('Received HTML instead of CSV. Please check the URL and ensure it points to a CSV file or public Google Sheets document.');
    }
    
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