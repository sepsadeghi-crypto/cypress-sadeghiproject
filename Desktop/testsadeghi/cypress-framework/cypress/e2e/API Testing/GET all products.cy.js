describe('API Testing - GET all products', () => {
  it('Verify the products list endpoint', () => {
    cy.request({
      method: 'GET',
      url: '/api/products',
      failOnStatusCode: false, 
    }).then((res) => {
      expect(res.status, 'status').to.eq(200);
      expect(res.body, 'body').to.be.an('object');
      expect(res.body).to.have.property('data');
      expect(res.body.data, 'data').to.be.an('array');
      const maybeNumber = (v) => v === undefined || typeof v === 'number';
      expect(maybeNumber(res.body.page), 'page should be number if present').to.be.true;
      expect(maybeNumber(res.body.limit), 'limit should be number if present').to.be.true;
      expect(maybeNumber(res.body.total), 'total should be number if present').to.be.true;
      if (res.body.data.length > 0) {
        const p = res.body.data[0];
        expect(p, 'product item').to.be.an('object');
        expect(p).to.have.property('id');
        expect(p).to.have.property('name');
        expect(p).to.have.property('price');
        expect(
          ['string', 'number'].includes(typeof p.id),
          `id type was ${typeof p.id}`
        ).to.be.true;

        expect(typeof p.name, `name type was ${typeof p.name}`).to.eq('string');
        const priceNum = Number(p.price);
        expect(Number.isFinite(priceNum), `price should be numeric, got ${p.price}`).to.be.true;
      }
    });
  });
});
