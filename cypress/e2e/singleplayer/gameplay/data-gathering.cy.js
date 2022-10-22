/// <reference types="cypress" />

// TODO test that api calls don't get called at certain points

/**
 * Testing the data gathering during gameplay.
 */
describe('data gathering', () => {
  beforeEach(() => {
    // Stub entered cities
    cy.wrap(['Cambridge', 'Peterborough', 'Sheffield', 'York'])
      .as('cities')
      .then((cities) => {
        cy.stubCities(cities);
      });

    // Stub database api calls
    cy.intercept('/api/uk-ireland/play', '').as('api-play');
    cy.intercept('/api/uk-ireland/finish', '').as('api-finish');
    cy.intercept('/api/uk-ireland/city', '').as('api-city');

    // Visit controlled map
    cy.visit('/singleplayer/uk-ireland?c1=0&c2=59');
    cy.wait(50);

    cy.get('main>input').as('input');
    cy.get('main>p').as('tagline');
  });

  it('counts when game played', () => {
    // Should send play request when loading page
    cy.visit('/singleplayer/uk-ireland');
    cy.wait('@api-play').its('response.statusCode').should('eq', 200);
  });

  it('counts cities entered', () => {
    cy.get('@cities').then((cities) => {
      // Skip last city
      cities.slice(0, -1).forEach((city) => {
        cy.get('@input').type(`${city}{enter}`);
        cy.wait('@api-city').its('request.body.id').should('be.greaterThan', 0);
      });
    });
  });

  it('counts when game finished', () => {
    cy.get('@cities').then((cities) => {
      cities.forEach((city) => {
        cy.get('@input').type(`${city}{enter}`);
      });
    });
    // Make sure game is won
    cy.get('@tagline').should('have.text', `You win!`);
    cy.wait('@api-finish').its('response.statusCode').should('eq', 200);
  });
});
