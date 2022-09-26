/// <reference types="cypress" />

// Helper functions
const tooFar = (city) => `${city} is too far!`;
const inRange = (city) => city;
const alreadyIn = (city) => `Already in ${city}`;
const noCity = (city) => `${city} ???`;

// Standard theme colours
const tooFarColour = '#e0a1a1';
const pointColour = '#939F9b';
const endColour = '#a652a5';

describe('gameplay', () => {
  beforeEach(() => {
    // Stub the requests so everything is controlled
    [
      'Oxford',
      'Cambridge',
      'Peterborough',
      'Sheffield',
      'York',
      'Wellington',
      'London',
    ].forEach((city) => {
      cy.intercept(`https://secure.geonames.org/searchJSON?*${city}*`, {
        fixture: `${city.toLowerCase()}.json`,
      }).as(city.toLowerCase());
    });

    cy.intercept('https://secure.geonames.org/searchJSON?*Wrong*', {
      fixture: 'no-cities.json',
    }).as('wrong');

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

  it('can go to city in range', () => {
    const city = 'Oxford';
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city));
    cy.get('main svg circle').should('have.length', 4);
  });

  it('cannot go to city out of range', () => {
    const city = 'Sheffield';

    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', tooFar(city));

    cy.get('main svg circle').should('have.length', 4);
    cy.get(`main svg circle[fill="${tooFarColour}"]`).should('have.length', 1);
  });

  it('can go to multiple cities in range', () => {
    const city1 = 'Cambridge';
    const city2 = 'Peterborough';

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));

    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2));

    cy.get('main svg circle').should('have.length', 5);
  });

  it('can go back to previous cities in range', () => {
    const cities = ['Oxford', 'Peterborough', 'Cambridge', 'Oxford'];

    cities.forEach((city) => {
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', inRange(city));
    });

    cy.get('main svg circle').should('have.length', 7);
  });

  it('will go to next city of same name in range', () => {
    const city1 = 'Oxford';
    const city2 = 'Wellington';

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2));

    cy.get('main svg circle').should('have.length', 6);
  });

  it('will not go to next city of same name if not in range', () => {
    const city = 'Oxford';

    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city));
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', tooFar(city));

    cy.get('main svg circle').should('have.length', 5);
    cy.get(`main svg circle[fill="${tooFarColour}"]`).should('have.length', 1);
  });

  it('will say if already in city', () => {
    const city1 = 'Oxford';
    const city2 = 'Peterborough';

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', alreadyIn(city2));

    cy.get('main svg circle').should('have.length', 5);
  });

  it('will trigger win on going to end city in range', () => {
    const cities = ['Cambridge', 'Peterborough', 'Sheffield'];
    const endCity = 'York';

    cities.forEach((city) => {
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', inRange(city));
    });

    cy.get('main svg circle').should('have.length', 6);

    cy.get('@input').type(`${endCity}{enter}`);
    cy.get('@tagline').should('have.text', `You win!`);

    cy.get('main svg circle').should('have.length', 7);
  });

  it('cannot go to end city out of range', () => {
    const endCity = 'York';

    cy.get('@input').type(`${endCity}{enter}`);
    cy.get('@tagline').should('have.text', tooFar(endCity));

    cy.get(`main svg circle[fill="${tooFarColour}"]`).should('have.length', 1);
  });

  it('will go to nearest city of same name', () => {
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

    cy.get('main svg circle').should('have.length', 6);
    cy.get(`main svg circle[fill="${tooFarColour}"]`).should('have.length', 1);
  });

  it('will always go to end city if in range', () => {
    cy.visit('/singleplayer/uk-ireland?c1=0&c2=57');
    const city1 = 'Oxford';
    const city2 = 'Cambridge';

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', 'You win!');

    cy.get('main svg circle').should('have.length', 5);
  });

  it('will not go to city not found', () => {
    const city = 'Wrong';
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', noCity(city));

    cy.get('main svg circle').should('have.length', 3);
  });

  describe.only('data gathering', () => {
    beforeEach(() => {
      cy.intercept('/api/uk-ireland/play', '').as('api-play');
      cy.intercept('/api/uk-ireland/finish', '').as('api-finish');
      cy.intercept('/api/uk-ireland/city', '').as('api-city');
    });

    it('counts when game played', () => {
      // Should send play request when loading page
      cy.visit('/singleplayer/uk-ireland');
      cy.wait('@api-play').its('response.statusCode').should('eq', 200);
    });

    it('counts cities entered', () => {
      const cities = ['Cambridge', 'Peterborough', 'Sheffield'];

      cities.forEach((city) => {
        cy.get('@input').type(`${city}{enter}`);
        cy.wait('@api-city').its('request.body.id').should('be.greaterThan', 0);
      });
    });

    it('counts when game finished', () => {
      const cities = ['Cambridge', 'Peterborough', 'Sheffield', 'York'];

      cities.forEach((city) => {
        cy.get('@input').type(`${city}{enter}`);
      });

      // Make sure game is won
      cy.get('@tagline').should('have.text', `You win!`);
      cy.wait('@api-finish').its('response.statusCode').should('eq', 200);
    });
  });
});
