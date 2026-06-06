describe('API Testing - Checkout & Orders', () => {
  let userToken;
  let cartId;
  let productId;

  before(() => {
    cy.request({
      method: 'POST',
      url: '/api/users/login',
      body: {
        email: Cypress.env('ADMIN_EMAIL'),
        password: Cypress.env('ADMIN_PASSWORD')
      }
    }).then((res) => {
      userToken = res.body.access_token || res.body.token;
      cy.request('GET', '/api/products').then((prodRes) => {
        productId = prodRes.body.data[0].id;
        cy.request({
          method: 'POST',
          url: '/api/carts',
          headers: { Authorization: `Bearer ${userToken}` }
        }).then((cartRes) => {
          cartId = cartRes.body.id;
          cy.request({
            method: 'POST',
            url: `/api/carts/${cartId}`,
            headers: { Authorization: `Bearer ${userToken}` },
            body: { product_id: productId, quantity: 1 }
          });
        });
      });
    });
  });

  it('Should place an order (Checkout) and return invoice', () => {
    const checkoutPayload = {
      cart_id: cartId,
      payment_method: 'bank_transfer', 
      address: 'Tehran, Azadi Square, No 123',
      city: 'Tehran',
      state: 'Tehran',
      country: 'Iran',
      postcode: '1234567890'
    };

    cy.request({
      method: 'POST',
      url: '/api/invoices',
      headers: { Authorization: `Bearer ${userToken}` },
      body: checkoutPayload
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('status');
      expect(res.body.status).to.eq('AWAITING_FULFILLMENT');
      
      cy.log('Order placed successfully. Invoice ID: ' + res.body.id);
    });
  });
});
