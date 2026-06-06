describe('API Authentication - Negative Testing', () => {
  it('Should return 401 when accessing /api/users/me without token', () => {
    cy.request({
      method: 'GET',
      url: '/api/users/me',
      failOnStatusCode: false 
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.have.property('message');
      cy.log('Successfully blocked access: ' + res.body.message);
    });
  });
});
