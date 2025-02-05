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
  other = '#939F9B80',
}

export interface Point {
  x: number;
  y: number;
}

export const nullPoint: CityPoint = {
  x: 10000,
  y: 10000,
  name: '???',
  id: 0,
  population: 0,
};
