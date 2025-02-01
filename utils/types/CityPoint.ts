export interface CityPoint extends Point {
  name: string;
  id: number;
  population: number;
}

export enum PointType {
  start = '#939F9B',
  end = '#A6F2A5',
  past = '#939F9B',
  far = '#E0A1A1',
  current = '#939F9B',
  hole = '#6b231e66',
}

export interface Point {
  x: number;
  y: number;
}
