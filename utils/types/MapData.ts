export interface MapData {
  name: string;
  webPath: string;
  imagePath: string;
  longMax: number;
  longMin: number;
  latMax: number;
  latMin: number;
  countryCodes: { whole: string[]; part: { country: string; admin1: string[]; admin2: string[] }[]}
  searchRadius: number;
  pointRadius: number;
}

export interface Bounds {
  north: number;
  east: number;
  south: number;
  west: number;
}
