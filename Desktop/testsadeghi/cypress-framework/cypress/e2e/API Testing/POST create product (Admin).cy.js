describe('API Testing - POST create product (Admin)', () => {
  const credentials = {
    email: 'admin@automationcamp.org', 
    password: 'welcome01'      
  };
  let token;
  it('Login and Create Product', () => {
      cy.request({
      method: 'POST',
      url: '/api/users/login', 
      body: credentials,
      failOnStatusCode: false
    }).then((loginRes) => {
         if (loginRes.status !== 200) {
        cy.log('LOGIN FAILED! Status:', loginRes.status);
        cy.log('Response Body:', JSON.stringify(loginRes.body));
            throw new Error(`Login Failed: ${loginRes.body.message || 'Check credentials'}`);
      }
      token = loginRes.body.token || loginRes.body.access_token || (loginRes.body.data && loginRes.body.data.token);
      expect(token, 'Token must be present').to.not.be.undefined;
      const newProduct = {
        name: `Admin Product ${Date.now()}`,
        price: 99.99,
        description: 'Testing Admin API',
        image: 'https://via.placeholder.com/150'
      };

      cy.request({
        method: 'POST',
        url: '/api/products',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: newProduct,
        failOnStatusCode: false
      }).then((createRes) => {
           expect(createRes.status, 'Check Create Permission').to.eq(201);
        cy.request('GET', '/api/products').then((listRes) => {
          const exists = listRes.body.data.some(p => p.name === newProduct.name);
          expect(exists, 'New product should be in list').to.be.true;
        });
      });
    });
  });
});
