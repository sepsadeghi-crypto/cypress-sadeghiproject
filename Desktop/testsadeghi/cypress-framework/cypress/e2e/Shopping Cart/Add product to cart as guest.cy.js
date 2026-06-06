describe('Shopping Cart', () => {
  it('Add product to cart as guest', () => {
    cy.viewport(1280, 720);
    cy.visit('/');
     cy.get('[data-testid="add-to-cart-btn"]').should('have.length.greaterThan', 0);
     cy.get('[data-testid="add-to-cart-btn"]').first().click();
    cy.get('[data-id="cart-count"]')
      .should('be.visible')
      .and('contain', '1');
  });
});
