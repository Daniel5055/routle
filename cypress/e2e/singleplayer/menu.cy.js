/// <reference types="cypress" />

describe('Singleplayer menu', () => {
  beforeEach(() => {
    // Visit site
    cy.visit('/');
  });

  it('displays navbar', () => {
    // Get navbar header
    // Should have title of app at least
    cy.get('header')
      .should('have.length', 1)
      .contains('Routle')
      .should('be.visible');
  });

  describe('map list', () => {
    it('lists maps', () => {
      // Maps that should be options
      const maps = ['Europe', 'Italy', 'Norway', 'Uk and Ireland', 'USA'];

      cy.contains('Where to?').should('be.visible');

      // Should have a fair number of maps to choose from
      // At least the core ones
      cy.get('main div a').as('list').should('have.length.at.least', 5);
      maps.forEach((map) => {
        cy.get('@list').contains(map).should('exist');
      });
    });

    it('only shows first few', () => {
      cy.get('main div a')
        .as('list')
        .then(($list) => {
          cy.get('@list').first().should('be.visible');

          // If there exists more than 8 maps then there will likely be some hidden
          if ($list.length > 8) {
            cy.get('@list').last().should('not.be.visible');
          }
        });
    });

    it('shows rest on scroll', () => {
      cy.get('main div a')
        .as('list')
        .then(($list) => {
          // If there exists more than 8 maps then there will likely be some hidden
          if ($list.length > 8) {
            cy.get('main div').first().scrollTo('bottom');
            cy.get('@list').last().should('be.visible');
            cy.get('@list').first().should('not.be.visible');
          }
        });
    });

    it('leads to maps', () => {
      cy.get('main div a').first().click();

      // Should lead to a new page beyond singl,player
      cy.url().should('match', /\/singleplayer\/.+$/);
    });
  });

  describe('difficulty', () => {
    it('is visible', () => {
      cy.contains('Difficulty').should('be.visible');
      cy.get('input[type=range]').should('have.length', 1).as('range');
      cy.get('@range').siblings('p').should('have.length', 1);
    });

    it('starts on normal', () => {
      cy.get('input[type=range]').as('range');
      cy.get('@range').siblings('p').contains('Normal').should('be.visible');
      cy.get('@range').should('have.attr', 'value', '3');
      cy.getCookie('Difficulty').should('have.property', 'value', '3');
    });

    it('with range 1 to 5', () => {
      cy.get('input[type=range]').as('range');
      cy.get('@range').should('have.attr', 'min', '1');
      cy.get('@range').should('have.attr', 'max', '5');
    });

    it('can be made easy', () => {
      cy.get('input[type=range]').as('range').invoke('val', 2).trigger('input');
      cy.get('@range').siblings('p').should('have.text', 'Easy');
      cy.get('@range').should('have.attr', 'value', '2');
      cy.getCookie('Difficulty').should('have.property', 'value', '2');
    });

    it('can be made really easy', () => {
      cy.get('input[type=range]').as('range').invoke('val', 1).trigger('input');
      cy.get('@range').siblings('p').should('have.text', 'Baby Mode');
      cy.get('@range').should('have.attr', 'value', '1');
      cy.getCookie('Difficulty').should('have.property', 'value', '1');
    });

    it('can be made hard', () => {
      cy.get('input[type=range]').as('range').invoke('val', 4).trigger('input');
      cy.get('@range').siblings('p').should('have.text', 'Hard');
      cy.get('@range').should('have.attr', 'value', '4');
      cy.getCookie('Difficulty').should('have.property', 'value', '4');
    });

    it('can go from easy to really hard', () => {
      cy.get('input[type=range]').as('range').invoke('val', 2).trigger('input');
      cy.get('@range').invoke('val', 5).trigger('input');
      cy.get('@range').siblings('p').should('have.text', 'Fredrik Mode');
      cy.get('@range').should('have.attr', 'value', '5');
      cy.getCookie('Difficulty').should('have.property', 'value', '5');
    });

    it('can handle out of range difficulties', () => {
      // Set cookie and revist page
      cy.setCookie('Difficulty', '0');
      cy.visit('/singleplayer');
      cy.get('input[type=range]')
        .as('range')
        .siblings('p')
        .should('have.text', 'Unknown Territory: 0');
      // Centered thumb
      cy.get('@range').should('have.attr', 'value', '3');

      // Not altered
      cy.getCookie('Difficulty').should('have.property', 'value', '0');
    });

    it('can handle float difficulites', () => {
      // Set cookie and revist page
      cy.setCookie('Difficulty', '2.5');
      cy.visit('/singleplayer');
      cy.get('input[type=range]')
        .as('range')
        .siblings('p')
        .should('have.text', 'Easy');
      cy.get('@range').should('have.attr', 'value', '2');

      // Value is cast to int so floored
      cy.getCookie('Difficulty').should('have.property', 'value', '2');
    });

    it('can go from out of range to enumerated difficulties', () => {
      // Set cookie and revist page
      cy.setCookie('Difficulty', '0');
      cy.visit('/singleplayer');
      cy.get('input[type=range]').as('range').invoke('val', 2).trigger('input');
      cy.get('@range').should('have.attr', 'value', '2');
      cy.getCookie('Difficulty').should('have.property', 'value', '2');
    });
  });
});
