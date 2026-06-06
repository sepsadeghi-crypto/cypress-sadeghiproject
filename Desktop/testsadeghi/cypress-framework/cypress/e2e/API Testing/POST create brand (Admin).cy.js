describe('API Testing - POST Create Brand (Admin)', () => {
  let adminToken;

  before(() => {
    const email = Cypress.env('ADMIN_EMAIL');
    const password = Cypress.env('ADMIN_PASSWORD');
    if (!email || !password) {
      throw new Error('خطا: ADMIN_EMAIL یا ADMIN_PASSWORD در فایل cypress.env.json یافت نشد!');
    }
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
        cy.log('جزئیات خطای لاگین:', JSON.stringify(res.body));
        throw new Error(`لاگین ادمین ناموفق بود. کد وضعیت: ${res.status}`);
      }
      adminToken = res.body.access_token || res.body.token;
      cy.log('توکن ادمین با موفقیت دریافت شد.');
    });
  });

  it('Should successfully create a new brand via API', () => {
    const brandName = `Brand_${Date.now()}`;
    cy.request({
      method: 'POST',
      url: '/api/brands',
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      body: {
        name: brandName
      },
      failOnStatusCode: false
    }).then((res) => {
      if (res.status !== 201) {
        cy.log('خطا در ایجاد برند:', JSON.stringify(res.body));
      }
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('name', brandName);

      cy.log(`برند جدید با موفقیت ایجاد شد. ID: ${res.body.id}`);
    });
  });
});
