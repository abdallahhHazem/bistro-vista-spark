import { Restaurant, ClusterData } from '@/types/restaurant';

// K-means clustering implementation
export function kMeansCluster(restaurants: Restaurant[], k: number = 5): ClusterData[] {
  if (restaurants.length === 0) return [];
  
  // Initialize centroids randomly
  const centroids: [number, number][] = [];
  const bounds = getBounds(restaurants);
  
  for (let i = 0; i < k; i++) {
    centroids.push([
      Math.random() * (bounds.maxLat - bounds.minLat) + bounds.minLat,
      Math.random() * (bounds.maxLon - bounds.minLon) + bounds.minLon
    ]);
  }
  
  let assignments: number[] = new Array(restaurants.length).fill(0);
  let iterations = 0;
  const maxIterations = 100;
  
  while (iterations < maxIterations) {
    const newAssignments: number[] = [];
    
    // Assign each restaurant to the nearest centroid
    for (const restaurant of restaurants) {
      let minDistance = Infinity;
      let assignedCluster = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const distance = euclideanDistance(
          [restaurant.lat, restaurant.lon],
          centroids[i]
        );
        if (distance < minDistance) {
          minDistance = distance;
          assignedCluster = i;
        }
      }
      newAssignments.push(assignedCluster);
    }
    
    // Check for convergence
    if (assignments.every((val, idx) => val === newAssignments[idx])) {
      break;
    }
    
    assignments = newAssignments;
    
    // Update centroids
    for (let i = 0; i < k; i++) {
      const clusterRestaurants = restaurants.filter((_, idx) => assignments[idx] === i);
      if (clusterRestaurants.length > 0) {
        const avgLat = clusterRestaurants.reduce((sum, r) => sum + r.lat, 0) / clusterRestaurants.length;
        const avgLon = clusterRestaurants.reduce((sum, r) => sum + r.lon, 0) / clusterRestaurants.length;
        centroids[i] = [avgLat, avgLon];
      }
    }
    
    iterations++;
  }
  
  // Create cluster data
  const clusterColors = ['#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50', '#ff9800', '#f44336'];
  const clusters: ClusterData[] = [];
  
  for (let i = 0; i < k; i++) {
    const clusterRestaurants = restaurants
      .map((restaurant, idx) => ({ ...restaurant, cluster: i }))
      .filter((_, idx) => assignments[idx] === i);
    
    if (clusterRestaurants.length > 0) {
      clusters.push({
        id: i,
        center: centroids[i],
        restaurants: clusterRestaurants,
        color: clusterColors[i % clusterColors.length]
      });
    }
  }
  
  return clusters;
}

function euclideanDistance(point1: [number, number], point2: [number, number]): number {
  const dx = point1[0] - point2[0];
  const dy = point1[1] - point2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function getBounds(restaurants: Restaurant[]) {
  const lats = restaurants.map(r => r.lat);
  const lons = restaurants.map(r => r.lon);
  
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons)
  };
}