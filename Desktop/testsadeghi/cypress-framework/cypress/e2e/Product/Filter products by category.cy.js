describe('Product Filter', () => {
  it('Filter products by category', () => {
    cy.viewport(1280, 720); 
    cy.intercept('GET', '**/api/products**').as('getProducts');

    cy.visit('/');
    cy.wait('@getProducts');
    cy.get('[data-testid="category-power-tools"]').click();
    cy.wait('@getProducts');
    cy.get('[data-testid="product-card"]').should('have.length.at.least', 1);
  });
});
