type Difficulty = number;
type CityPriority = 'Proximity' | 'Population' | 'Hybrid';

interface Settings {
  difficulty: Difficulty;
  priority: CityPriority;
  holes: number;
  holeRadius: number;
}

export type { Difficulty, CityPriority };

export default Settings;
