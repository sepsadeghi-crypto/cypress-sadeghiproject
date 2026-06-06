describe('Shopping Cart - Update Quantity', () => {
  it('Should update quantity to 3 in checkout', () => {
    cy.viewport(1280, 720);
    cy.visit('/');
    cy.get('[data-testid="add-to-cart-btn"]').first().click();
    cy.visit('/checkout'); 
    cy.get('[data-testid="cart-qty-increase"]').click(); 
    cy.get('[data-testid="cart-qty-increase"]').click(); 
    cy.get('[data-testid="cart-quantity"]').should('have.text', '3');
  });
});
