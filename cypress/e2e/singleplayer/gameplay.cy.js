// Helper functions
const tooFar = (city) =>  `${city} is too far!`;
const inRange = (city) => city;
const alreadyIn = (city) =>  `Already in ${city}`;
const noCity = (city) =>  `${city} ???`;

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

    cy.intercept('https://secure.geonames.org/searchJSON?*Wrong*', { fixture: 'no-cities.json'}).as('wrong');

    cy.visit('/singleplayer/uk-ireland?c1=0&c2=59')
    cy.get('main input').as('input')
    cy.get('main p').as('tagline')
  })

  it('can go to city in range', () => {
    const city = 'Oxford'
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city))
  })

  it('cannot go to city out of range', () => {
    const city = 'Sheffield'

    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', tooFar(city))
  })

  it('can go to multiple cities in range', () => {
    const city1 = 'Cambridge'
    const city2 = 'Peterborough'

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1))

    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2))
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
      cy.get('@tagline').should('have.text', inRange(city))
    })
  })

  it('will go to next city of same name in range', () => {
    const city1 = 'Oxford'
    const city2 = 'Wellington'

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1))
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2))
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2))
  })

  it('will not go to next city of same name if not in range', () => {
    const city = 'Oxford'

    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city))
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', tooFar(city))
  })

  it('will say if already in city', () => {
    const city1 = 'Oxford'
    const city2 = 'Peterborough'

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1))
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2))
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', alreadyIn(city2))
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
      cy.get('@tagline').should('have.text', inRange(city))
    })

    cy.get('@input').type(`${endCity}{enter}`);
    cy.get('@tagline').should('have.text', `You win!`)
  })

  it('cannot go to end city out of range', () => {
    const endCity = 'York'

    cy.get('@input').type(`${endCity}{enter}`);
    cy.get('@tagline').should('have.text',tooFar(endCity))
  })

  it('will go to nearest city of same name', () => {
    const city1 = 'Oxford'
    const city2 = 'Cambridge'
    const city3 = 'Peterborough'

    // Goes to a different cambridge so peterborough is too far now
    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city2));
    cy.get('@input').type(`${city3}{enter}`);
    cy.get('@tagline').should('have.text', tooFar(city3));
  })

  it('will always go to end city if in range', () => {
    cy.visit('/singleplayer/uk-ireland?c1=0&c2=57')
    const city1 = 'Oxford'
    const city2 = 'Cambridge'

    cy.get('@input').type(`${city1}{enter}`);
    cy.get('@tagline').should('have.text', inRange(city1));
    cy.get('@input').type(`${city2}{enter}`);
    cy.get('@tagline').should('have.text', 'You win!')
  })

  it('will not go to city not found', () => {
    const city = 'Wrong'
    cy.get('@input').type(`${city}{enter}`);
    cy.get('@tagline').should('have.text', noCity(city));
  })
})