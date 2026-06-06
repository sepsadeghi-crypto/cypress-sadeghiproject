describe('User Account - View user profile', () => {
  const email = 'customer@automationcamp.org'
  const password = 'welcome01'

  beforeEach(() => {
    cy.visit('/auth/login')
    cy.get('[data-testid="email"]').should('be.visible').type(email)
    cy.get('[data-testid="password"]').should('be.visible').type(password)
    cy.get('[data-testid="login-submit"]').click()
    cy.url().should('not.include', '/auth/login')
  })

  it('Verify user can view their profile', () => {
    cy.visit('/account/profile')
    cy.url().should('include', '/account/profile')
    cy.contains('Personal Information').should('be.visible')
    cy.get('[data-testid="first-name"]').should('be.visible')
    cy.get('[data-testid="last-name"]').should('be.visible')
    cy.get('[data-testid="email"]').should('be.visible')
    cy.get('[data-testid="phone"]').should('be.visible')
    cy.get('[data-testid="street"]').should('be.visible')
    cy.get('[data-testid="city"]').should('be.visible')
    cy.get('[data-testid="state"]').should('be.visible')
    cy.get('[data-testid="country"]').should('be.visible')
   cy.get('[data-testid="postal-code"]').should('be.visible')
    cy.contains(/change password/i).should('be.visible')
  })
})
