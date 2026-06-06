describe('Admin Panel - Add new brand', () => {
  it('should allow admin to add a new brand', () => {
    const brandName = `Brand ${Date.now()}`;

    cy.visit('/auth/login');
    cy.get('[data-testid="email"]').type('admin@automationcamp.org');
    cy.get('[data-testid="password"]').type('welcome01');
    cy.get('[data-testid="login-submit"]').click();

    cy.url().should('not.include', '/auth/login');

    cy.visit('/admin/brands');

    cy.contains('Add Brand').click();

    cy.get('[data-testid="brand-name"]').type(brandName);

  cy.get('[data-testid="submit-brand"]').click();

    // 6. تایید نمایش برند در لیست
    cy.contains(brandName).should('be.visible');
  });
});
