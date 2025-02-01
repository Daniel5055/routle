import { Property } from './property';

const HOLES_COOKIE = 'Holes';
const HOLES_DEFAULT: number = 0;

const holes = new Property<number>(
  HOLES_COOKIE,
  HOLES_DEFAULT,
  (n) => n.toString(),
  (s) => parseInt(s)
);

export default holes;
