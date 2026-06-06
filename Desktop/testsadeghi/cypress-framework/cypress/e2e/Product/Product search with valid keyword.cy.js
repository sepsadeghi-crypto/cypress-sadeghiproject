describe('Product', () => {
  it('Product search with valid keyword', () => {
    const keyword = 'hammer';

    cy.intercept('GET', '**/api/products**').as('getProducts');

    cy.visit('/');
    cy.contains(/all products/i).should('be.visible');
    cy.wait('@getProducts');
    cy.get('input[type="search"], input[placeholder*="Search" i]')
      .first()
      .clear()
      .type(`${keyword}{enter}`);

    cy.wait('@getProducts');
    cy.contains(/claw hammer/i).should('be.visible');
    cy.contains('button', /^add$/i).should('have.length.at.least', 1);
  });
});
