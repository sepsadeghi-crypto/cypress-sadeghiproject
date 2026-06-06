describe('Product Display', () => {
  it('Verify products are displayed on landing page', () => {
    cy.visit('/');
    cy.get('[data-testid="product-card"]').should('have.length.at.least', 9);
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="product-name"]').should('be.visible');
      cy.get('[data-testid="product-price"]').should('be.visible');
    });
  });
});
