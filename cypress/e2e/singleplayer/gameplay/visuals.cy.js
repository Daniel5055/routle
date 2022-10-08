/// <reference types="cypress" />

// Helper function
const cleanName = (city) => city.toLowerCase().replace(' ', '-');

// Standard theme colours
const tooFarColour = '#E0A1A1';
const pointColour = '#939F9B';
const endColour = '#A6F2A5';

// Custom specific commands
Cypress.Commands.add('areSamePosition', (s1, s2) => {
  cy.get(s1).then(($s1) => {
    cy.get(s2)
      .should('have.attr', 'cx', $s1.attr('cx'))
      .should('have.attr', 'cy', $s1.attr('cy'));
  });
});

/**
 * Testing the svg visuals of the gameplay.
 */
describe('visuals', () => {
  beforeEach(() => {
    // Stub the requests so everything is controlled
    cy.stubCities([
      'Oxford',
      'Cambridge',
      'Peterborough',
      'Sheffield',
      'York',
      'London',
    ]);

    // London is start city, York is end city
    cy.visit('/singleplayer/uk-ireland?c1=0&c2=59');

    // FIXME
    // Have to wait currently as may generate different cities before loading, may need to fix
    cy.wait(50);
    cy.get('main>input').as('input');
    cy.get('main>p').as('tagline');

    cy.get('.london').as('start');
    cy.get('.york').as('end');
  });

  it('first contains start point, end point, and search circle', () => {
    // End point exists and only one there
    cy.get('@end').should('have.attr', 'fill', endColour);
    cy.get(`main svg circle[fill="${endColour}"`).should('have.length', 1);

    // Start point exists and only itself and search circle exist
    cy.get('@start').should('have.attr', 'fill', pointColour);
    cy.get('.search-radius').should('have.attr', 'stroke', pointColour);
    cy.get(`main svg circle[fill="${pointColour}"`).should('have.length', 1);
    cy.get(`main svg circle[stroke="${pointColour}"`).should('have.length', 1);

    cy.get('main svg circle').should('have.length', 3);
  });

  it('has start point in centre of search circle', () => {
    cy.get('.search-radius').should('have.attr', 'fill', 'none');
    cy.areSamePosition('.search-radius', '@start');
  });

  it('renders next point in range and moves search circle', () => {
    const city = 'Oxford';
    cy.get('@input').type(`${city}{enter}`);
    cy.get('main svg circle').should('have.length', 4);
    cy.get('main svg line')
      .should('have.length', 1)
      .should('have.attr', 'stroke', pointColour);

    cy.get(`.${cleanName(city)}`)
      .as('next')
      .should('have.attr', 'fill', pointColour);
    cy.areSamePosition('.search-radius', '@next');
  });

  it('renders multiple points and routle lines', () => {
    const cities = ['Oxford', 'Peterborough', 'Sheffield'];

    cities.forEach((city, i) => {
      cy.get('@input').type(`${city}{enter}`);
      cy.get('main svg circle').should('have.length', 4 + i);
      cy.get(`main svg circle[fill="${pointColour}"]`).should(
        'have.length',
        2 + i
      );
      cy.get('main svg line')
        .should('have.length', 1 + i)
        .should('have.attr', 'stroke', pointColour);

      cy.areSamePosition('.search-radius', `.${cleanName(city)}`);
    });
  });

  it('renders points out of range and search circle does not move', () => {
    const city = 'Sheffield';
    cy.get('@input').type(`${city}{enter}`);
    cy.get('main svg circle').should('have.length', 4);
    cy.get('main svg line').should('have.length', 0);

    cy.get(`.${cleanName(city)}`)
      .as('next')
      .should('have.attr', 'fill', tooFarColour);

    // Ensure circle not moved
    cy.areSamePosition('.search-radius', '@start');
  });

  it('renders no new points on city repetition', () => {
    // A name with only a single city
    const city = 'Peterborough';

    cy.get('@input').type(`${city}{enter}`);
    cy.get('@input').type(`${city}{enter}`);

    // No extra point added on repetition
    cy.get('main svg circle').should('have.length', 4);
    cy.get('main svg line').should('have.length', 1);

    cy.get(`.${cleanName(city)}`)
      .as('next')
      .should('have.attr', 'fill', pointColour);

    // Ensure circle moved and stayed
    cy.areSamePosition('.search-radius', '@next');
  });

  it('renders no new points on wrong city', () => {
    // A name with only a single city
    const city = 'Wrong';

    cy.get('@input').type(`${city}{enter}`);

    cy.get('main svg circle').should('have.length', 3);
    cy.get('main svg line').should('have.length', 0);

    // Ensure circle not moved from start
    cy.areSamePosition('.search-radius', '@start');
  });

  it('renders new point on end city', () => {
    // A name with only a single city
    const cities = ['Peterborough', 'Sheffield', 'York'];

    cities.forEach((city) => {
      cy.get('@input').type(`${city}{enter}`);
    });

    cy.get('main svg circle').should('have.length', 6);
    cy.get('main svg line').should('have.length', 3);

    // Ensure circle at end
    cy.areSamePosition('.search-radius', '@end');
    cy.areSamePosition('@end', `.${cleanName(cities.at(-1))}`);
  });

  it('reset after play again', () => {
    // A name with only a single city
    const cities = ['Peterborough', 'Sheffield', 'York'];

    cities.forEach((city) => {
      cy.get('@input').type(`${city}{enter}`);
    });

    // Play again
    cy.contains('Play again?').click();

    // End point exists and only one there
    cy.get('@end').should('have.attr', 'fill', endColour);
    cy.get(`main svg circle[fill="${endColour}"`).should('have.length', 1);

    // Start point exists and only itself and search circle exist
    cy.get('@start').should('have.attr', 'fill', pointColour);
    cy.get('.search-radius').should('have.attr', 'stroke', pointColour);
    cy.get(`main svg circle[fill="${pointColour}"`).should('have.length', 1);
    cy.get(`main svg circle[stroke="${pointColour}"`).should('have.length', 1);

    cy.get('main svg circle').should('have.length', 3);
  });
});
