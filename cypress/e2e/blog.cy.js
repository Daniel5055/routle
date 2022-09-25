/// <reference types="cypress" />

const moment = require('moment/moment');

describe('blog', () => {
  beforeEach(() => {
    // Visit blog
    cy.visit('/blog');
    cy.get('main>div>div').as('posts');

    // Can't seem to figure out how to stub ssg stuff if even possible at all
  });

  it('contains line at bottom', () => {
    cy.get('main>hr').should('be.visible');
  });

  it('shows posts chronologically', () => {
    cy.get('@posts').each(($post, i, $posts) => {
      if (i === 0) {
        return;
      }

      // Parse dates from posts
      const dOld = moment($post.children('h3').text(), 'DD/MM/YYYY');
      const dNew = moment(
        Cypress.$($posts[i - 1])
          .children('h3')
          .text(),
        'DD/MM/YYYY'
      );
      expect(dNew.unix()).to.be.at.least(dOld.unix());
    });
  });

  it('only shows first few posts if many', () => {
    cy.get('@posts').then(($posts) => {
      cy.get('@posts').first().should('be.visible');
      if ($posts.length > 3) {
        cy.get('@posts').last().should('be.not.visible');
      }
    });
  });

  it('shows rest on scroll', () => {
    cy.get('main>div').scrollTo('bottom');
    cy.get('@posts').then(($posts) => {
      cy.get('@posts').last().should('be.visible');
      if ($posts.length > 3) {
        cy.get('@posts').first().should('be.not.visible');
      }
    });
  });
});
