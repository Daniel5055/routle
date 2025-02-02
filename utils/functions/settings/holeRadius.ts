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

const holeRadius = new Property<number>(
  HOLE_RADIUS_COOKIE,
  HOLE_RADIUS_DEFAULT,
  (n) => n.toString(),
  (s) => parseInt(s)
);

export { holeRadiusMultiplier };

export default holeRadius;
