describe('API Testing - DELETE product (Admin)', () => {
  const ADMIN_EMAIL = 'admin@automationcamp.org';
  const ADMIN_PASSWORD = 'welcome01';
  
  let token;
  let productId;

  before(() => {
    cy.request({
      method: 'POST',
      url: '/api/users/login',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      failOnStatusCode: false
    }).then((res) => {
      token = res.body.token || res.body.access_token;
    });
  });

  it('Should delete a product and verify it no longer exists', () => {
    cy.request({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        name: 'Product to be deleted',
        price: 10.00
      }
    }).then((createRes) => {
      productId = createRes.body.id;
      cy.log(`Created product ID to delete: ${productId}`);
      cy.request({
        method: 'DELETE',
        url: `/api/products/${productId}`,
        headers: { Authorization: `Bearer ${token}` }
      }).then((deleteRes) => {
        expect(deleteRes.status).to.be.oneOf([200, 204]);
        cy.log('Product deleted successfully');
        cy.request({
          method: 'GET',
          url: `/api/products/${productId}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false 
        }).then((getRes) => {
          expect(getRes.status).to.eq(404);
          cy.log('Verified: Product not found (404)');
        });
      });
    });
  });
});
