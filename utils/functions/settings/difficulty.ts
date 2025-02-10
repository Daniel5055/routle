import { MapData } from '../../types/MapData';
import { Difficulty } from '../../types/Settings';
import { Property } from './property';

const DIFFICULTY_COOKIE = 'Difficulty';
const DIFFICULTY_DEFAULT = 3;
const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  1: 'Baby Mode',
  2: 'Easy',
  3: 'Normal',
  4: 'Hard',
  5: 'Fredrik Mode',
};
const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  1: 4.0,
  2: 2.0,
  3: 1.0,
  4: 0.8,
  5: 0.6,
};

const difficulty = new Property<Difficulty>(
  DIFFICULTY_COOKIE,
  DIFFICULTY_DEFAULT,
  (n) => n.toString(),
  parseInt
);

function difficultyName(value: Difficulty): string {
  return DIFFICULTY_NAMES[value] ?? `Unknown territory: ${value}`;
}

function difficultyMultiplier(value: Difficulty): number {
  return DIFFICULTY_MULTIPLIER[value] ?? DIFFICULTY_MULTIPLIER[3];
}

function mapDifficulty(mapData: MapData | undefined, value: number) {
  return ((mapData?.searchRadius ?? 1) * difficultyMultiplier(value)) / 8;
}

export { difficultyName, mapDifficulty, type Difficulty, DIFFICULTY_DEFAULT };

export default difficulty;
