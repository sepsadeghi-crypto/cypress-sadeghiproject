describe('Shopping Cart - Remove Product', () => {
  it('Should remove product from cart', () => {
    cy.viewport(1280, 720);
    cy.visit('/');
    cy.get('[data-testid="add-to-cart-btn"]').first().click();
     cy.visit('/checkout'); 
    cy.get('[data-testid="cart-remove"]').should('be.visible');
      cy.get('[data-testid="cart-remove"]').click(); 
    cy.contains('Your cart is empty').should('be.visible');
  });
});
