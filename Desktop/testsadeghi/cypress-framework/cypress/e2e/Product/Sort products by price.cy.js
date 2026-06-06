describe('Product Sorting', () => {
  it('Sort products by price (Low to High)', () => {
    cy.viewport(1280, 720);
    cy.intercept('GET', '**/api/products*').as('getProducts');
    cy.visit('/');
    cy.wait('@getProducts');
    cy.get('select').select('price-asc'); 
     cy.wait('@getProducts');
    });
});
