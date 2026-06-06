describe('Authentication', () => {
  it('Invalid login - wrong password', () => {
    cy.intercept('POST', '**/api/users/login').as('login')

    cy.visit('/auth/login')

    cy.get('[data-testid="email"]').clear().type('customer@automationcamp.org')
    cy.get('[data-testid="password"]').clear().type('wrongpassword123')
    cy.get('[data-testid="login-submit"]').click()

    cy.wait('@login').its('response.statusCode').should('be.oneOf', [400, 401])

    cy.contains(/invalid credentials/i).should('be.visible')
  })
})
