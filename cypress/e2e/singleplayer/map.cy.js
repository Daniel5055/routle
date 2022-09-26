/// <reference types="cypress" />

describe('Singleplayer map', () => {
  beforeEach(() => {
    // Visit site, the og
    cy.visit('/singleplayer/uk-ireland');
  });

  describe('layout', () => {
    it('displays navbar', () => {
      // Get navbar header
      // Should have title of app at least
      cy.get('header')
        .should('have.length', 1)
        .contains('Routle')
        .should('be.visible');
    });

    it('contains prompt', () => {
      cy.get('main>h3').as('prompt');
      cy.get('@prompt')
        .invoke('text')
        .should('match', /^Get from .+ to .+$/);
    });

    it('contains map', () => {
      cy.get('main div img').as('img').should('be.visible');
      cy.get('main div svg').as('svg').should('be.visible');

      // Ensure that img and svg aligned properly
      cy.get('@img').then(($img) => {
        cy.get('@svg')
          .invoke('width')
          .should('not.equal', '0')
          .should('equal', $img.width());
        cy.get('@svg')
          .invoke('height')
          .should('not.equal', '0')
          .should('equal', $img.height());
      });
    });

    it('contains tagline', () => {
      cy.get('main>p').then(($tagline) => {
        const startCity = $tagline.text();
        cy.get('main>h3').should('contain.text', startCity);
      });
    });

    it('contains input', () => {
      cy.get('main>input')
        .as('input')
        .should('have.attr', 'placeholder', 'Enter a city');
      cy.get('@input').should('have.attr', 'value', '');

      // Underlined
      cy.get('@input').next('hr').should('be.visible');
    });

    it('does not contain win elements', () => {
      cy.contains('You win!').should('not.exist');
      cy.contains('Play again?').should('not.exist');
    });

    describe('on win', () => {
      beforeEach(() => {
        cy.visit('/singleplayer/uk-ireland?c1=0&c2=52');
        cy.intercept('https://secure.geonames.org/searchJSON?*Oxford*', {
          fixture: 'oxford.json',
        }).as('oxford');
        cy.get('main>input').type('Oxford{enter}');
        cy.wait('@oxford');
      });

      it('contains win statement', () => {
        cy.contains('You win!').should('be.visible');
      });

      it('contains city count', () => {
        cy.get('main>h2')
          .invoke('text')
          .should('match', /^Number of cities: [1-9][0-9]*$/);
      });

      it('contains play again button', () => {
        cy.get('main>button').should('have.text', 'Play again?');
      });

      it('does not contain input', () => {
        cy.get('main>input').should('not.exist');
      });
    });
  });

  describe('input', () => {
    beforeEach(() => {
      cy.get('main>input').as('input');
    });
    it('is initially focused', () => {
      cy.get('@input').should('be.focused');
    });

    it('stays focused', () => {
      cy.get('@input').should('be.focused').blur().should('be.focused');
    });

    it('accepts text', () => {
      const text = 'hello there';
      cy.get('@input').type(text).should('have.attr', 'value', text);
    });

    it('submits on enter', () => {
      // Stub geonames
      cy.intercept('GET', 'https://secure.geonames.org/searchJSON?*', {
        fixture: 'no-cities.json',
      }).as('request');

      const text = 'hello there';
      cy.get('@input').type(text);
      cy.get('@input').type('{enter}');
      cy.get('@input').should('have.attr', 'value', '');
      cy.wait('@request');
    });

    it('hides placeholder on type', () => {
      const text = 'h';
      cy.get('@input').type(text);
      cy.get('@input').should('have.attr', 'placeholder', '');
      cy.get('@input').as('input').type('{backspace}');
      cy.get('@input').should('have.attr', 'placeholder', '');
    });

    context('special characters', () => {
      [
        'hello 123',
        'hellooooooooooooooooooooooooooooooooooooooooo',
        '!"£$%^&*()\':@~}{>?¬`#][l;_+=/.>,<?',
        'hełlø',
        'عَرَبيّ',
        'Україна',
        'हिंदी',
        'hey\tthere',
        'hi ',
        ' hi',
      ].forEach((input) => {
        it(`accepts ${input}`, () => {
          cy.get('@input').type(input);
          cy.get('@input').should('have.attr', 'value', input);
        });
      });
    });
  });
});
