describe('Contact Form Functionality', () => {
    it('Should allow a guest to submit the contact form', () => {
          cy.visit('/contact');
        cy.get('[data-testid="contact-name"]').type('John Doe');
        cy.get('[data-testid="contact-email"]').type('john@example.com');
        cy.get('[data-testid="contact-subject"]').type('Test Subject');
        cy.get('[data-testid="contact-message"]').type('This is a test message from Cypress.');
        cy.get('[data-testid="contact-submit"]').click();
cy.contains('Message Sent!').should('be.visible');
        });
});
