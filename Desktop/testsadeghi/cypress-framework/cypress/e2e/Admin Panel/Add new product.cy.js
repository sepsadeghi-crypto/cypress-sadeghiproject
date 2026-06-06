describe('Admin Panel - Add new product', () => {
  it('should allow admin to add a new product and verify its presence', () => {
    // 1. ورود به سیستم
    cy.visit('/auth/login');
    cy.get('[data-testid="email"]').type('admin@automationcamp.org');
    cy.get('[data-testid="password"]').type('welcome01');
    cy.get('[data-testid="login-submit"]').click();

    // 2. تعریف Interceptها
    cy.intercept('GET', '/api/categories').as('getCategories');
    cy.intercept('GET', '/api/brands').as('getBrands');
    cy.intercept('POST', '/api/products').as('addProduct');
    cy.intercept('GET', '/api/products*').as('getProducts');

    // 3. رفتن به صفحه محصولات
    cy.get('[data-testid="nav-products"]').click();
    cy.wait('@getProducts');

    // 4. باز کردن فرم افزودن
    cy.get('[data-testid="add-product"]').click();
    cy.wait(['@getCategories', '@getBrands']);

    // ایجاد نام داینامیک برای محصول
    const productName = `Test Product ${Date.now()}`;
    
    // پر کردن فرم
    cy.get('[data-testid="product-name"]').type(productName);
    cy.get('[data-testid="product-description"]').type('Test Description');
    cy.get('[data-testid="product-price"]').type('99.99');
    cy.get('[data-testid="product-stock"]').type('50');
    cy.get('[data-testid="product-category"]').select('Power Tools');
    cy.get('[data-testid="product-brand"]').select('BuildPro');
    
    // ثبت محصول
    cy.get('[data-testid="submit-product"]').click();

    // 5. بررسی پاسخ سرور و جستجو
    cy.wait('@addProduct').then((interception) => {
      // این همان نامی است که سرور تایید کرده ذخیره شده
      const actualProductName = interception.response.body.name;
      
      cy.log(`نامی که ما فرستادیم: ${productName}`);
      cy.log(`نامی که سرور ذخیره کرد: ${actualProductName}`);

      // انتظار برای بارگذاری لیست جدید
      cy.wait('@getProducts');

      // جستجو با نامی که از سرور گرفتیم
      cy.get('[data-testid="search-products"]').clear().type(actualProductName);
      
      // انتظار برای اعمال جستجو (درخواست جدید)
      cy.wait('@getProducts');

      // تأیید نهایی
      cy.contains(actualProductName).should('be.visible');
    });
  });
});
