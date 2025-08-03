export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  cuisine?: string;
  zone?: string;
  cluster?: number;
}

export interface ClusterData {
  id: number;
  center: [number, number];
  restaurants: Restaurant[];
  color: string;
}

export interface AnalyticsData {
  restaurants: Restaurant[];
  clusters: ClusterData[];
  cuisineStats: { [key: string]: number };
  zoneStats: { [key: string]: number };
}