export interface MapData {
  name: string;
  webPath: string;
  imagePath: string;
  longMax: number;
  longMin: number;
  latMax: number;
  latMin: number;
  countryCodes: { whole: string[]; part: { country: string; regions: string[] }[]}
  searchRadius: number;
  pointRadius: number;
}

export interface Bounds {
  north: number;
  east: number;
  south: number;
  west: number;
}
