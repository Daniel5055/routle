import { MapData } from '../../types/MapData';
import { Property } from './property';

const HOLE_RADIUS_COOKIE = 'HoleRadius';
const HOLE_RADIUS_DEFAULT: number = 3;

const HOLE_RADIUS_MULTIPLIER: Record<number, number> = {
  1: 0.6,
  2: 0.8,
  3: 1.0,
  4: 2.0,
  5: 4.0,
};

function holeRadiusMultiplier(value: number) {
  return (
    HOLE_RADIUS_MULTIPLIER[value] ?? HOLE_RADIUS_MULTIPLIER[HOLE_RADIUS_DEFAULT]
  );
}

function mapHoleRadius(mapData: MapData | undefined, value: number) {
  return ((mapData?.searchRadius ?? 1) * holeRadiusMultiplier(value)) / 8;
}

function rangeHoleRadius(mapData: MapData | undefined, value: number) {
  return ((mapData?.searchRadius ?? 1) * value) / 8;
}

const holeRadius = new Property<number>(
  HOLE_RADIUS_COOKIE,
  HOLE_RADIUS_DEFAULT,
  (n) => n.toString(),
  (s) => parseInt(s)
);

export { mapHoleRadius, holeRadiusMultiplier, rangeHoleRadius };

export default holeRadius;
