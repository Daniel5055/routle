/// <reference types="cypress" />

import posts from '../../public/blog/posts.json';

describe('navbar', () => {
  beforeEach(() => {
    // Visit blog
    cy.visit('/');
    cy.get('header').as('navbar');
  });

  context('wide screen', () => {
    it('displays app name', () => {
      cy.get('@navbar').contains('Routle').as('title').should('be.visible');
      cy.get('@title').should('have.css', 'font-size', '48px');
    });

    it('displays link to singleplayer', () => {
      cy.get('@navbar')
        .get('a[href="/singleplayer"]')
        .as('singleplayer')
        .should('be.visible')
        .should('have.text', 'Singleplayer');
      cy.get('@singleplayer').should('have.css', 'font-size', '32px');
    });

    it('displays link to multiplayer', () => {
      cy.get('@navbar')
        .get('a[href="/multiplayer"]')
        .as('multiplayer')
        .should('be.visible')
        .should('have.text', 'Multiplayer');
      cy.get('@multiplayer').should('have.css', 'font-size', '32px');
    });

    it('displays icon to blog', () => {
      cy.get('@navbar').get('a[href="/blog"] img').should('be.visible');
    });

    it('displays line at bottom of header', () => {
      cy.get('@navbar').get('hr').should('be.visible');
    });
  });

  context('small screen', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
      cy.wait(100);
    });

    it('displays app name', () => {
      cy.get('@navbar').contains('Routle').as('title').should('be.visible');
      cy.get('@title').should('have.css', 'font-size', '32px');
    });

    it('displays link to singleplayer', () => {
      cy.get('@navbar')
        .get('a[href="/singleplayer"]')
        .as('singleplayer')
        .should('be.visible')
        .should('have.text', 'Singleplayer');
      cy.get('@singleplayer').should('have.css', 'font-size', '16px');
    });

    it('displays link to multiplayer', () => {
      cy.get('@navbar')
        .get('a[href="/multiplayer"]')
        .as('multiplayer')
        .should('be.visible')
        .should('have.text', 'Multiplayer');
      cy.get('@multiplayer').should('have.css', 'font-size', '16px');
    });

    it('displays icon to blog', () => {
      cy.get('@navbar').get('a[href="/blog"] img').should('be.visible');
    });

    it('displays line at bottom of header', () => {
      cy.get('@navbar').get('hr').should('be.visible');
    });
  });

  describe('blog notifications', () => {
    beforeEach(() => {
      cy.get('@navbar').get('a[href="/blog"]').as('icon');
    });

    it('shows ! for new comers', () => {
      cy.get('@icon').get('span').contains('!').should('be.visible');
    });

    it('disappears when visiting blog', () => {
      cy.get('@icon').click();
      cy.get('@icon').get('span').contains('!').should('not.exist');

      // Stays disappeared
      cy.visit('/');
      cy.get('@icon').get('span').contains('!').should('not.exist');
    });

    it('shows number of unread', () => {
      if (posts.length > 1) {
        cy.setCookie('lastRead', (posts.length - 1).toString());
        cy.visit('/');
        cy.get('@icon')
          .get('span')
          .last()
          .should('have.text', '1')
          .should('be.visible');
      }

      if (posts.length > 2) {
        cy.setCookie('lastRead', (posts.length - 2).toString());
        cy.reload();
        cy.get('@icon')
          .get('span')
          .last()
          .should('have.text', '2')
          .should('be.visible');
      }

      if (posts.length > 3) {
        cy.setCookie('lastRead', (posts.length - 3).toString());
        cy.reload();
        cy.get('@icon')
          .get('span')
          .last()
          .should('have.text', '3')
          .should('be.visible');
      }
    });

    it('does not exist if last read is length of posts', () => {
      cy.setCookie('lastRead', posts.length.toString());
      cy.reload();
      cy.get('@icon').get('span').contains('0').should('not.be.visible');
      cy.get('@icon').get('span').should('have.length', 2);
    });
  });
});
