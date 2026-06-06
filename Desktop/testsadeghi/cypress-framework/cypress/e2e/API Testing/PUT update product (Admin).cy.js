describe('API Testing - PUT update product (Admin)', () => {
  const ADMIN_EMAIL = 'admin@automationcamp.org'; 
  const ADMIN_PASSWORD = 'welcome01';
  
  let token;
  let productId;

  before(() => {
    cy.request({
      method: 'POST',
      url: '/api/users/login',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      },
      failOnStatusCode: false
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(`Login failed with status ${res.status}. Check credentials.`);
      }
      token = res.body.token || res.body.access_token;
    });
  });

  it('Should create, update and verify the product', () => {
     cy.request({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        name: 'Original Product Name',
        price: 50.00,
        description: 'Before update',
        category_id: 1,
        brand_id: 1
      }
    }).then((createRes) => {
      productId = createRes.body.id;
      cy.log(`Product created with ID: ${productId}`);
      const updatedData = {
        name: 'Updated Product Name By Cypress',
        price: 75.25,
        description: 'After update description'
      };

      cy.request({
        method: 'PUT',
        url: `/api/products/${productId}`,
        headers: { Authorization: `Bearer ${token}` },
        body: updatedData,
        failOnStatusCode: false
      }).then((updateRes) => {
        expect(updateRes.status).to.eq(200);
            cy.log('Update Response:', JSON.stringify(updateRes.body));
        cy.request({
          method: 'GET',
          url: `/api/products/${productId}`,
          headers: { Authorization: `Bearer ${token}` }
        }).then((getRes) => {
          expect(getRes.status).to.eq(200);
          expect(getRes.body.name).to.eq(updatedData.name);
          expect(Number(getRes.body.price)).to.eq(updatedData.price);
        });
      });
    });
  });
});
