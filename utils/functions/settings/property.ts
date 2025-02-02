import Cookies from 'js-cookie';

export class Property<T> {
  private cookieName: string;
  private defaultValue: T;
  private toString: (v: T) => string;
  private fromString: (v: string) => T;

  constructor(
    cookieName: string,
    defaultValue: T,
    toString: (v: T) => string,
    fromString: (v: string) => T
  ) {
    this.cookieName = cookieName;
    this.toString = toString;
    this.fromString = fromString;
    this.defaultValue = defaultValue;
  }

  setValue(value: T) {
    Cookies.set(this.cookieName, this.toString(value));
  }

  getValue(): T {
    const value = Cookies.get(this.cookieName);
    if (value === undefined) {
      return this.defaultValue;
    } else {
      return this.fromString(value);
    }
  }
}
