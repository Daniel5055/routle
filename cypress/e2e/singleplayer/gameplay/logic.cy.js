/// <reference types="cypress" />

// Helper functions
const tooFar = (city) => `${city} is too far!`;
const inRange = (city) => city;
const alreadyIn = (city) => `Already in ${city}`;
const noCity = (city) => `${city} ???`;

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
      'Southampton',
    ]);

    cy.visit('/singleplayer/uk-ireland?c1=0&c2=59');
    // FIXME
    // Have to wait currently as may generate different cities before loading, may need to fix
    cy.wait(50);
    cy.get('main>input').as('input');
    cy.get('main>p').as('tagline');
  });
});
