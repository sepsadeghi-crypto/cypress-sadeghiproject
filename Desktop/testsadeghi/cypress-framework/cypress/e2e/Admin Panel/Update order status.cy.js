describe('Admin Panel - Update order status', () => {
  it('should allow admin to change an order status to SHIPPED', () => {
    // Intercepts
    cy.intercept('POST', '**/api/users/login').as('login');
    cy.intercept('GET', '**/api/invoices*').as('getInvoices');
    cy.intercept('GET', '**/api/invoices/inv-*').as('getInvoiceDetail');
    cy.intercept('PUT', '**/api/invoices/**/status').as('updateStatus');

    // Login
    cy.visit('/auth/login');
    cy.get('[data-testid="email"]').type('admin@automationcamp.org');
    cy.get('[data-testid="password"]').type('welcome01');
    cy.get('[data-testid="login-submit"]').click();
    cy.wait('@login');

    // Orders list
    cy.visit('/admin/orders');
    cy.wait('@getInvoices');

    // Open first order
    cy.get('table tbody tr').first().contains('View').click();
    cy.wait('@getInvoiceDetail');

    // Change status
    cy.get('[data-testid="status-select"]').should('be.visible').select('SHIPPED');

    // Click update
    cy.get('[data-testid="update-status"]').should('be.visible').click();

    // Wait backend update
    cy.wait('@updateStatus').then(({ response }) => {
      expect(response?.statusCode).to.be.oneOf([200, 204]);
    });

    // اگر UI بعد از آپدیت دوباره GET زد، فقط صبر کن (بدون assert روی 200)
    cy.wait('@getInvoiceDetail', { timeout: 10000 }).then(({ response }) => {
      // 200 یا 304 هر دو قابل قبول‌اند
      expect(response?.statusCode).to.be.oneOf([200, 304]);
    });

    // Final UI verification (پایدارتر از badge)
    // اگر value دقیقاً SHIPPED باشد:
    cy.get('[data-testid="status-select"]').should('have.value', 'SHIPPED');

    // اگر value با متن فرق داشت، این را جایگزین خط بالا کن:
    // cy.get('[data-testid="status-select"] option:selected').should('contain', 'SHIPPED');
  });
});
