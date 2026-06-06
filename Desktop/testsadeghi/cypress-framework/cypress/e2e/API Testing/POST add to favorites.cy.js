describe('API Testing - Favorites', () => {
  let userToken;
  let productId;
  const BASE_URL = 'http://localhost:5173'; 
  const LOGIN_API_URL = `${BASE_URL}/api/users/login`;
  const PRODUCTS_API_URL = `${BASE_URL}/api/products`;
  const FAVORITES_API_URL = `${BASE_URL}/api/favorites`;

  before(() => {
    cy.request({
      method: 'POST',
      url: LOGIN_API_URL,
      body: {
        email: Cypress.env('ADMIN_EMAIL'),
        password: Cypress.env('ADMIN_PASSWORD')
      }
    }).then((loginRes) => {
      if (loginRes.status !== 200 && loginRes.status !== 201) {
        cy.log('Login failed. Status:', loginRes.status, 'Response:', loginRes.body);
        throw new Error('Login failed. Cannot proceed with tests.');
      }
      userToken = loginRes.body.access_token || loginRes.body.token;
      cy.log('User token received:', userToken);
      cy.request('GET', PRODUCTS_API_URL).then((prodRes) => {
        if (prodRes.status !== 200) {
          cy.log('Failed to get products. Status:', prodRes.status, 'Response:', prodRes.body);
          throw new Error('Failed to get products. Cannot proceed with tests.');
        }
        if (prodRes.body.data && prodRes.body.data.length > 0) {
          productId = prodRes.body.data[0].id;
          cy.log('Product ID received:', productId);
        } else {
          cy.log('No products found or invalid response structure for /api/products');
          throw new Error('Could not get product ID for testing favorites.'); 
        }
      });
    });
  });

  it('Should add product to favorites and verify it appears in the list', () => {
      if (!userToken || !productId) {
      throw new Error('userToken or productId is missing. Tests cannot proceed.');
    }
    cy.request({
      method: 'GET',
      url: FAVORITES_API_URL,
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((getFavRes) => {
      if (getFavRes.status !== 200) {
        cy.log(`Failed to get favorites list. Status: ${getFavRes.status}, Response:`, getFavRes.body);
          throw new Error(`Failed to get favorites list. Status: ${getFavRes.status}`);
      }
      
      cy.log('Initial favorites list response:', JSON.stringify(getFavRes.body));

      let favoriteItems = [];
      if (getFavRes.body && Array.isArray(getFavRes.body)) {
        favoriteItems = getFavRes.body;
      } else if (getFavRes.body && getFavRes.body.data && Array.isArray(getFavRes.body.data)) {
        favoriteItems = getFavRes.body.data;
      }
      const isProductAlreadyInFavorites = favoriteItems.some(item => 
        item.product_id === productId || item.id === productId
      );

      if (isProductAlreadyInFavorites) {
        cy.log('Product is already in favorites. Skipping add operation.');
      } else {
             cy.request({
          method: 'POST',
          url: FAVORITES_API_URL,
          headers: { Authorization: `Bearer ${userToken}` },
          body: {
            product_id: productId
          }
        }).then((addFavRes) => {
               expect(addFavRes.status).to.be.oneOf([200, 201], `Expected status 200 or 201 for POST ${FAVORITES_API_URL}, but got ${addFavRes.status}. Response: ${JSON.stringify(addFavRes.body)}`);
          cy.log('Product successfully added to favorites.');
        });
      }
    }).then(() => {
       cy.request({
        method: 'GET',
        url: FAVORITES_API_URL,
        headers: { Authorization: `Bearer ${userToken}` }
      }).then((finalFavRes) => {
        if (finalFavRes.status !== 200) {
          cy.log(`Failed to get favorites list on final check. Status: ${finalFavRes.status}, Response:`, finalFavRes.body);
          throw new Error(`Failed to get favorites list on final check. Status: ${finalFavRes.status}`);
        }
        
        cy.log('Final favorites list response:', JSON.stringify(finalFavRes.body));

        let finalFavoriteItems = [];
        if (finalFavRes.body && Array.isArray(finalFavRes.body)) {
          finalFavoriteItems = finalFavRes.body;
        } else if (finalFavRes.body && finalFavRes.body.data && Array.isArray(finalFavRes.body.data)) {
          finalFavoriteItems = finalFavRes.body.data;
        }
        
        const isProductFinallyInFavorites = finalFavoriteItems.some(item => 
          item.product_id === productId || item.id === productId
        );
        
        expect(isProductFinallyInFavorites, 'Product should be in favorites list after operation').to.be.true;
        cy.log('Product successfully verified in favorites list.');
      });
    });
  });
});
