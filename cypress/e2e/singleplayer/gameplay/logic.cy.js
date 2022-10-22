/// <reference types="cypress" />

// Helper functions
const tooFar = (city) => `${city} is too far!`;
const inRange = (city) => city;
const alreadyIn = (city) => `Already in ${city}`;
const noCity = (city) => `${city} ???`;
const searchCity = (city) => `Searching for ${city}...`;

/**
 * Testing the specific gameplay logic;
 */
describe('logic', () => {
  beforeEach(() => {
    // Stub the requests so everything is controlled
    cy.stubCities([
      'Oxford',
      'Cambridge',
      'Peterborough',
      'Sheffield',
      'York',
      'Wellington',
      'London',
    ]);

    cy.visit('/singleplayer/uk-ireland?c1=0&c2=59');
    // FIXME
    // Have to wait currently as may generate different cities before loading, may need to fix
    cy.wait(50);
    cy.get('main>input').as('input');
    cy.get('main>p').as('tagline');
  });

  it('has same start and end city given query params', () => {
    const startCity = 'London';
    const endCity = 'York';

    // Make sure the query params work
    cy.get('main>h3').should(
      'have.text',
      `Get from ${startCity} to ${endCity}`
    );
  });

  it('loading on city enter', () => {
    const city = 'Oxford';

    // Only says searching briefly
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', searchCity(city));
    cy.get('@tagline').should('not.have.text', searchCity(city));
  });

  it('can go to city in range', () => {
    const city = 'Oxford';
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city));
  });

  it('cannot go to city out of range', () => {
    const city = 'Sheffield';
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', tooFar(city));
  });

  it('can go to multiple cities in range', () => {
    const city1 = 'Cambridge';
    const city2 = 'Peterborough';
    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2));
  });

  it('can go back to previous cities in range', () => {
    const cities = ['Oxford', 'Peterborough', 'Cambridge', 'Oxford'];

    cities.forEach((city) => {
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', inRange(city));
    });
  });

  it('will say if already in city', () => {
    // This only applies if there only exists a single city with the searched name
    const city1 = 'Oxford';
    const city2 = 'Peterborough';

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', alreadyIn(city2));
  });

  it('will go to next city of same name in range', () => {
    // This only applies if there exists multiple city with the searched name
    const city1 = 'Oxford';
    const city2 = 'Wellington';

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2));
  });

  it('will not go to next city of same name if not in range', () => {
    const city = 'Oxford';

    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city));
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', tooFar(city));
  });

  it('will go to nearest city of same name', () => {
    // This is more of a specific case to show that it will not always
    // take you to most known city of that name, even if in range
    const city1 = 'Oxford';
    const city2 = 'Cambridge';
    const city3 = 'Peterborough';

    // Goes to a different cambridge so peterborough is too far now
    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2));
    cy.get('@input').type(`${city3}{enter}`);
    cy.get('@tagline').should('have.text', tooFar(city3));
  });

  it('will trigger win on going to end city in range', () => {
    const cities = ['Cambridge', 'Peterborough', 'Sheffield'];
    const endCity = 'York';

    cities.forEach((city) => {
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', inRange(city));
    });

    cy.get('@input').type(`${endCity}{enter}`);
    cy.get('@tagline').should('have.text', `You win!`);
  });

  it('cannot go to end city out of range', () => {
    const endCity = 'York';

    cy.get('@input').type(`${endCity}{enter}`);
    cy.get('@tagline').should('have.text', tooFar(endCity));
  });

  it('will always go to end city if in range', () => {
    // If Cambridge was not an end city, it would take you to
    // the other closer Cambridge to the west.
    cy.visit('/singleplayer/uk-ireland?c1=0&c2=57');
    const city1 = 'Oxford';
    const city2 = 'Cambridge';

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', 'You win!');
  });

  it('will not go to city not found', () => {
    const city = 'Wrong';
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', noCity(city));
  });
});
