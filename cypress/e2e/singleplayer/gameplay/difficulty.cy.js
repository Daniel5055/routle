/// <reference types="cypress" />

// Helper functions
const tooFar = (city) => `${city} is too far!`;
const inRange = (city) => city;

/**
 * Testing the broad difficulties in gameplay,
 * ensuring the radius is the correct size.
 */
describe('difficulty', () => {
  beforeEach(() => {
    // Stub the requests so everything is controlled
    cy.stubCities(['Oxford', 'Peterborough', 'Sheffield', 'St Andrews']);

    cy.visit('/singleplayer/uk-ireland?c1=0&c2=59');
    // FIXME
    // Have to wait currently as may generate different cities before loading, may need to fix
    cy.wait(50);
    cy.get('main>input').as('input');
    cy.get('main>p').as('tagline');
    cy.get('main svg .search-radius')
      .as('search')
      .then(($search) => {
        const radius = parseFloat($search.attr('r').slice(0, -2));

        cy.wrap(radius).as('default-radius');
      });
  });

  // Just testing search radius range and size compared to default
  context('normal', () => {
    beforeEach(() => {
      // Ensuring difficulty set to normal and refresh page
      cy.setCookie('Difficulty', '3');
      cy.reload();
      cy.wait(50);
    });

    it('has correct search radius length', () => {
      cy.get('@search').then(($search) => {
        const radius = parseFloat($search.attr('r').slice(0, -2));
        cy.get('@default-radius').should('equal', radius);
      });
    });

    it('can go to city in range', () => {
      const city = 'Peterborough';
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', inRange(city));
    });

    it('cannot go to city out of range', () => {
      const city = 'Sheffield';
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', tooFar(city));
    });
  });

  context('harder', () => {
    beforeEach(() => {
      // Ensuring difficulty set to harder and refresh page
      cy.setCookie('Difficulty', '4');
      cy.reload();
      cy.wait(50);
    });

    it('has correct search radius length', () => {
      cy.get('@search').then(($search) => {
        const radius = parseFloat($search.attr('r').slice(0, -2));
        cy.get('@default-radius').should('be.greaterThan', radius);
      });
    });

    it('can go to city in range', () => {
      const city = 'Oxford';
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', inRange(city));
    });

    it('cannot go to city out of range', () => {
      const city = 'Peterborough';
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', tooFar(city));
    });
  });

  context('easier', () => {
    beforeEach(() => {
      // Ensuring difficulty set to easier and refresh page
      cy.setCookie('Difficulty', '2');
      cy.reload();
      cy.wait(50);
    });

    it('has correct search radius length', () => {
      cy.get('@search').then(($search) => {
        const radius = parseFloat($search.attr('r').slice(0, -2));
        cy.get('@default-radius').should('be.lessThan', radius);
      });
    });

    it('can go to city in range', () => {
      const city = 'Sheffield';
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', inRange(city));
    });

    it('cannot go to city out of range', () => {
      const city = 'St Andrews';
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', tooFar(city));
    });
  });
});
