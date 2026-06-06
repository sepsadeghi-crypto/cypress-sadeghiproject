// cypress/e2e/Admin Panel/Disable user account.cy.js

describe('Admin Panel - Disable user account', () => {
  const admin = { email: 'admin@automationcamp.org', password: 'welcome01' };
  const targetUser = { email: 'customer3@automationcamp.org', password: 'welcome01' };

  it('Verify admin can disable a user account', () => {
    // 1. Intercepts
    cy.intercept('POST', '**/api/users/login').as('login');
    cy.intercept('GET', '**/api/users*').as('getUsers');
    cy.intercept('GET', '**/api/users/**').as('getUserDetail');
    cy.intercept({ method: /PUT|PATCH/, url: '**/api/users/**' }).as('updateUser');

    // 2. Login
    cy.visit('/auth/login');
    cy.get('[data-testid="email"]').type(admin.email);
    cy.get('[data-testid="password"]').type(admin.password);
    cy.get('[data-testid="login-submit"]').click();
    cy.wait('@login');

    // 3. Navigate to Users
    cy.visit('/admin/users');
    cy.wait('@getUsers');

    // 4. Find and Edit User
    cy.contains('td', targetUser.email).parents('tr').within(() => {
      cy.contains(/edit/i).click();
    });
    cy.wait('@getUserDetail');

    // 5. FIX: Ensure required fields are populated to satisfy validation
    // استفاده از label برای پیدا کردن فیلدها امن‌ترین راه است
    const fillIfEmpty = (label, value) => {
      cy.contains('label', label).parent().find('input').then($el => {
        if (!$el.val()) {
          cy.wrap($el).type(value);
        }
      });
    };

    fillIfEmpty('First Name', 'Bob');
    fillIfEmpty('Last Name', 'Wilson');

    // 6. Action: Uncheck Enable
    cy.contains('label', 'Account Enabled')
      .find('input[type="checkbox"]')
      .uncheck({ force: true });

    // 7. Submit
    cy.contains('button', /update user/i).click();

    // 8. Verify Success
    cy.wait('@updateUser').its('response.statusCode').should('be.oneOf', [200, 204]);
    
    // 9. Clear Session and Test Rejection
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => win.sessionStorage.clear());

    cy.visit('/auth/login');
    cy.get('[data-testid="email"]').type(targetUser.email);
    cy.get('[data-testid="password"]').type(targetUser.password);
    cy.get('[data-testid="login-submit"]').click();

    // 10. Final Assertion: Status should be error (4xx)
    cy.wait('@login').its('response.statusCode').should('be.oneOf', [400, 401, 403, 422]);
    cy.url().should('include', '/login');
  });
});
