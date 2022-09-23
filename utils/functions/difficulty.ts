import Cookies from 'js-cookie';

const DIFFICULTY_COOKIE = 'Difficulty';

/**
 * Sets a cookie for difficulty and returns the new text
 *
 * @param difficulty The difficulty to set to, expects 1 to 5 inclusively
 * @returns The name of the difficulty
 */
export function applyDifficulty(difficulty: number): string {
  Cookies.set(DIFFICULTY_COOKIE, difficulty.toString());
  switch (difficulty) {
    case 1:
      return 'Baby Mode';
    case 2:
      return 'Easy';
    case 3:
      return 'Normal';
    case 4:
      return 'Hard';
    case 5:
      return 'Fredrik Mode';
    default:
      return `Unknown Territory: ${difficulty}`;
  }
}

/**
 * Fetches difficulty from cookie and returns as multiplier or normal
 *
 * @param asMultiplier whether to return as multiplier or enumerated
 * @returns The multiplier to apply to the search radius or the difficulty enum
 */
export function fetchDifficulty(asMultiplier: boolean = false): number {
  const difficultyEnum = parseInt(Cookies.get(DIFFICULTY_COOKIE) ?? '3');
  if (asMultiplier) {
    return [
      4.0,
      2.0,
      1.0,
      0.8,
      0.6
    ][difficultyEnum-1] ?? 1.0;
  }

  return difficultyEnum;
}
