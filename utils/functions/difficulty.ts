import Cookies from 'js-cookie';

const DIFFICULTY_COOKIE = 'Difficulty';

/**
 * Sets a cookie for difficulty
 *
 * @param difficulty The difficulty to set to, expects 1 to 5 inclusively
 * @returns The name of the difficlty
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
 * Fetches difficulty from cookie and returns as multiplier
 *
 * @returns The multiplier to apply to the search radius
 */
export function fetchDifficulty(): number {
  switch (parseInt(Cookies.get(DIFFICULTY_COOKIE) ?? '3')) {
    case 1:
      return 4.0;
    case 2:
      return 2.0;
    case 3:
      return 1.0;
    case 4:
      return 0.8;
    case 5:
      return 0.6;
    default:
      return 1.0;
  }
}
