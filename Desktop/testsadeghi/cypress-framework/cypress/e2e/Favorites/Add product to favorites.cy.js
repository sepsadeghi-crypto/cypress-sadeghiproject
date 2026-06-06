describe('Favorites', () => {
  
  beforeEach(() => {
     cy.visit('/auth/login')
    cy.get('[data-testid="email"]').type('customer@automationcamp.org')
    cy.get('[data-testid="password"]').type('welcome01')
    cy.get('[data-testid="login-submit"]').click()
      cy.url().should('not.include', '/auth/login')
  })

    it('Should allow a logged-in user to add a product to favorites', () => {
    cy.contains('Adjustable Wrench 10').click();
    cy.get('[data-testid="favorite-btn"]').first().click();
    cy.wait(500); 
    cy.visit('/account/favorites');
    cy.contains('Adjustable Wrench 10').should('be.visible');
  })
})
