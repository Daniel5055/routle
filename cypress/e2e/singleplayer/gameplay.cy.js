describe('gameplay', () => {

  beforeEach(() => {
    // Stub the requests so everything is controlled
    [
      'Oxford',
      'Cambridge',
      'Peterborough',
      'Sheffield',
      'York',
      'Wellington',
      'London',
    ].forEach((city) => {
      cy.intercept(`https://secure.geonames.org/searchJSON?*${city}*`, { fixture: `${city.toLowerCase()}.json`}).as(city.toLowerCase());
    })
    cy.visit('/singleplayer/uk-ireland?c1=0&c2=59')
    cy.get('main input').as('input')
    cy.get('main p').as('tagline')
  })

  it('can go to city in range', () => {
    const city = 'Oxford'
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', city)
  })

  it('cannot go to city out of range', () => {
    const city = 'Sheffield'

    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', `${city} is too far!`)
  })

  it('can go to multiple cities in range', () => {
    const city1 = 'Cambridge'
    const city2 = 'Peterborough'

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', city1)

    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', city2)
  })

  it('can go back to previous cities in range', () => {
    const cities = [
      'Oxford',
      'Peterborough',
      'Cambridge',
      'Oxford',
    ];

    cities.forEach((city) => {
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', city)
    })
  })

  it('will go to next city of same name', () => {
    const city1 = 'Oxford'
    const city2 = 'Wellington'

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', city1)
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', city2)
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', city2)
  })

  it('will say if already in city', () => {
    const city1 = 'Oxford'
    const city2 = 'Peterborough'

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', city1)
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', city2)
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', `Already in ${city2}`)
  })

  it('will trigger win on going to end city in range', () => {
    const cities = [
      'Cambridge',
      'Peterborough',
      'Sheffield',
    ]
    const endCity = 'York'

    cities.forEach((city) => {
      cy.get('@input').type(`${city}{enter}`);
      cy.get('@tagline').should('have.text', city)
    })

    cy.get('@input').type(`${endCity}{enter}`);
    cy.get('@tagline').should('have.text', `You win!`)
  })

  it('Cannot go to end city out of range', () => {
    const endCity = 'York'

    cy.get('@input').type(`${endCity}{enter}`);
    cy.get('@tagline').should('have.text', `${endCity} is too far!`)
  })

  it('will always go to end city if in range', () => {
    cy.visit('/singleplayer/uk-ireland?c1=0&c2=57')
    const city1 = 'Oxford'
    const city2 = 'Cambridge'

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', city1)
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', 'You win!')
  })
})