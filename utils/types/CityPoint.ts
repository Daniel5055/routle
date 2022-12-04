export interface CityPoint {
  name: string;
  id: number;
  x: number;
  y: number;
}

export enum PointType {
  start = '#939F9B',
  end = '#A6F2A5',
  past = '#939F9B',
  far = '#E0A1A1',
  current = '#939F9B',
  other = '#939F9B80',
}

export const nullPoint: CityPoint = { x: 10000, y: 10000, name: '???', id: 0 };
