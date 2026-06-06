describe('API Testing - Cart Operations', () => {
  let userToken;
  let productId;
  let cartId;

  before(() => {
     const email = Cypress.env('ADMIN_EMAIL');
    const password = Cypress.env('ADMIN_PASSWORD');

    cy.request({
      method: 'POST',
      url: '/api/users/login',
      body: {
        email: email,
        password: password
      },
      failOnStatusCode: false
    }).then((res) => {
      if (res.status !== 200) {
        cy.log('LOGIN FAILED. Response:', JSON.stringify(res.body));
      }
      expect(res.status, 'Login should be successful').to.eq(200);
      userToken = res.body.access_token || res.body.token;
      cy.request('GET', '/api/products').then((productRes) => {
        expect(productRes.status).to.eq(200);
        productId = productRes.body.data[0].id;
        cy.log('Target Product ID:', productId);
      });
    });
  });

  it('Should create a cart, add an item and verify', () => {
    cy.request({
      method: 'POST',
      url: '/api/carts',
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((res) => {
      expect(res.status).to.eq(201);
      cartId = res.body.id;
      cy.log('Cart Created ID:', cartId);
      cy.request({
        method: 'POST',
        url: `/api/carts/${cartId}`,
        headers: { Authorization: `Bearer ${userToken}` },
        body: {
          product_id: productId,
          quantity: 2 
        }
      }).then((addRes) => {
        expect(addRes.status).to.be.oneOf([200, 201]);
        cy.request({
          method: 'GET',
          url: `/api/carts/${cartId}`,
          headers: { Authorization: `Bearer ${userToken}` }
        }).then((getRes) => {
          expect(getRes.status).to.eq(200);
              const item = getRes.body.items.find(i => i.product_id === productId);
          expect(item, 'Product must be in cart').to.not.be.undefined;
          expect(item.quantity).to.eq(2);
        });
      });
    });
  });
});
