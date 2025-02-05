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

function difficultyName(difficulty: Difficulty): string {
  return DIFFICULTY_NAMES[difficulty] ?? `Unknown territory: ${difficulty}`;
}

function difficultyMultiplier(difficulty: Difficulty): number {
  return DIFFICULTY_MULTIPLIER[difficulty] ?? DIFFICULTY_MULTIPLIER[3];
}

export {
  difficultyName,
  difficultyMultiplier,
  type Difficulty,
  DIFFICULTY_DEFAULT,
};

export default difficulty;
