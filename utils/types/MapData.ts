export interface MapData {
  name: string;
  path: string;
  longMax: number;
  longMin: number;
  latMax: number;
  latMin: number;
  countryCodes: string[];
  searchRadius: number;
}

export interface Bounds {
  north: number;
  east: number;
  south: number;
  west: number;
}