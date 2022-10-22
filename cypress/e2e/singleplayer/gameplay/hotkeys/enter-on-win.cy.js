/// <reference types="cypress" />

describe('enter on win', () => {
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

  it('plays new game on key press', () => {
    const cities = ['Cambridge', 'Peterborough', 'Sheffield', 'York'];

    cities.forEach((city) => {
      cy.get('@input').type(`${city}{enter}`);
    });

    // Making sure we won
    cy.get('@tagline').should('have.text', `You win!`);

    cy.get('body').type('{enter}');
    cy.wait(100);

    // Make sure game is reloaded
    cy.get('@tagline').should('not.have.text', `You win!`);
    cy.get('main svg circle').should('have.length', 3);
  });

  it('key handler not retained upon map exit', () => {
    const cities = ['Cambridge', 'Peterborough', 'Sheffield', 'York'];

    cities.forEach((city) => {
      cy.get('@input').type(`${city}{enter}`);
    });

    // Making sure we won
    cy.get('@tagline').should('have.text', 'You win!');

    // Now go to a new map and type enter
    cy.contains('Singleplayer').click();
    cy.contains('Uk and Ireland').scrollIntoView().click();
    cy.get('@input').type(`${cities[0]}{enter}`);

    // Make sure not reloaded and went to city instead
    cy.get('@tagline').should('have.text', cities[0]);
    cy.get('main svg circle').should('have.length', 4);
  });
});
