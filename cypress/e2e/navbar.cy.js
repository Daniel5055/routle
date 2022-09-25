/// <reference types="cypress" />

describe('navbar', () => {
  beforeEach(() => {
    // Visit blog
    cy.visit('/');
    cy.get('header').as('navbar');
  });

  context('wide screen', () => {
    it('displays app name', () => {
      cy.get('header').contains('Routle').as('title').should('be.visible');
      cy.get('@title').should('have.css', 'font-size', '48px');
    });

    it('displays link to singleplayer', () => {
      cy.get('header')
        .get('a[href="/singleplayer"]')
        .as('singleplayer')
        .should('be.visible')
        .should('have.text', 'Singleplayer');
      cy.get('@singleplayer').should('have.css', 'font-size', '32px');
    });

    it('displays link to multiplayer', () => {
      cy.get('header')
        .get('a[href="/multiplayer"]')
        .as('multiplayer')
        .should('be.visible')
        .should('have.text', 'Multiplayer');
      cy.get('@multiplayer').should('have.css', 'font-size', '32px');
    });

    it('displays icon to blog', () => {
      cy.get('header').get('a[href="/blog"] img').should('be.visible');
    });

    it('displays line at bottom of header', () => {
      cy.get('header').get('hr').should('be.visible');
    });
  });

  context('small screen', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
      cy.wait(100);
    });

    it('displays app name', () => {
      cy.get('header').contains('Routle').as('title').should('be.visible');
      cy.get('@title').should('have.css', 'font-size', '32px');
    });

    it('displays link to singleplayer', () => {
      cy.get('header')
        .get('a[href="/singleplayer"]')
        .as('singleplayer')
        .should('be.visible')
        .should('have.text', 'Singleplayer');
      cy.get('@singleplayer').should('have.css', 'font-size', '16px');
    });

    it('displays link to multiplayer', () => {
      cy.get('header')
        .get('a[href="/multiplayer"]')
        .as('multiplayer')
        .should('be.visible')
        .should('have.text', 'Multiplayer');
      cy.get('@multiplayer').should('have.css', 'font-size', '16px');
    });

    it('displays icon to blog', () => {
      cy.get('header').get('a[href="/blog"] img').should('be.visible');
    });

    it('displays line at bottom of header', () => {
      cy.get('header').get('hr').should('be.visible');
    });
  });
});
