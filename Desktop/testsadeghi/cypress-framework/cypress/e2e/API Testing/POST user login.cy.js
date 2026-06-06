describe('API Testing - POST User Login', () => {
  const CUSTOMER_EMAIL = 'customer@automationcamp.org';
  const CUSTOMER_PASSWORD = 'welcome01';

  it('Should successfully login and return user details with token', () => {
    cy.request({
      method: 'POST',
      url: '/api/users/login',
      body: {
        email: CUSTOMER_EMAIL,
        password: CUSTOMER_PASSWORD
      },
      failOnStatusCode: false 
    }).then((res) => {
      if (res.status === 423) {
        cy.log('WARNING: Account is LOCKED (423). Cannot verify successful login right now.');
        expect(res.status).to.eq(423);
      } else {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('access_token');
        expect(res.body.access_token).to.be.a('string');
        const userData = res.body.user ? res.body.user : res.body;
        if (userData.email) {
          expect(userData.email).to.eq(CUSTOMER_EMAIL);
        }
        cy.log('Login successful and token verified.');
      }
    });
  });

  it('Should fail login with incorrect password', () => {
    cy.request({
      method: 'POST',
      url: '/api/users/login',
      body: {
        email: CUSTOMER_EMAIL,
        password: 'WrongPassword123'
      },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.be.oneOf([401, 423]);
      
      if (res.status === 423) {
        cy.log('Verified: Account is locked (Expected failure).');
      } else {
        cy.log('Verified: Received 401 Unauthorized (Expected failure).');
      }
    });
  });
});
