import { Property } from './property';

type CityPriority = 'Proximity' | 'Population' | 'Hybrid';

const cityPriorities: CityPriority[] = ['Proximity', 'Population', 'Hybrid'];

const PRIORITY_COOKIE = 'CityPriority';
const PRIORITY_DEFAULT: CityPriority = 'Proximity';

const priority = new Property<CityPriority>(
  PRIORITY_COOKIE,
  PRIORITY_DEFAULT,
  (s) => s,
  (s) => s as CityPriority
);

export { cityPriorities, type CityPriority };

export default priority;
