describe('Authentication', () => {
  it('should allow a valid user to log in', () => {
    cy.visit('/auth/login')

    cy.get('[data-testid="email"]').type('customer@automationcamp.org')
    cy.get('[data-testid="password"]').type('welcome01')
    cy.get('[data-testid="login-submit"]').click()

    cy.url().should('not.include', '/auth/login')
    cy.contains('Toolshop').should('be.visible')
  })
})
