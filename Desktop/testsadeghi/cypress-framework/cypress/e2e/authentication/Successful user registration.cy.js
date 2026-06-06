describe('User Registration', () => {
  it('Successful user registration', () => {
    cy.visit('/auth/register');

    cy.get('[data-testid="first-name"]').type('Ali');
    cy.get('[data-testid="last-name"]').type('Alavi');
    cy.get('[data-testid="email"]').type(`user${Date.now()}@example.com`);
    cy.get('[data-testid="password"]').type('Password123!');
    cy.get('[data-testid="password-confirm"]').type('Password123!');
    
    cy.get('[data-testid="phone"]').type('09121234567');
    cy.get('[data-testid="dob"]').type('1990-01-01');

    cy.get('[data-testid="register-submit"]').click();

    cy.url().should('include', '/account/profile');
  });
});
