const { test, expect } = require('@playwright/test');

const adminUser = {
  email: 'admin@bellabliss.com',
  password: 'admin123',
};

async function dismissDialogs(page) {
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });
}

test.describe('BellaBliss storefront and auth flows', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await dismissDialogs(page);
  });

  test('homepage loads featured products and core navigation', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/BellaBliss Studio/i);
    await expect(page.getByRole('link', { name: 'Products' }).first()).toBeVisible();
    await expect(page.getByText(/premium beauty products/i).first()).toBeVisible();

    await expect(page.locator('#featuredProducts .product-card').first()).toBeVisible();
    await expect(page.locator('#featuredProducts .product-card')).toHaveCount(4);
  });

  test('products page supports browsing, filtering, sorting, and product detail navigation', async ({ page }) => {
    await page.goto('/pages/products/products.html');

    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
    await expect(page.locator('#productsGrid .product-card').first()).toBeVisible();

    await page.getByLabel('Skincare').check();
    await page.getByRole('button', { name: 'Apply Filters' }).click();

    await expect(page.locator('#resultsSummary')).toContainText(/Showing/i);
    await expect(page.locator('#productsGrid .product-card')).toHaveCount(2);
    await expect(page.locator('#productsGrid')).toContainText('Hydrating Face Cream');

    await page.locator('#sortBy').selectOption('price-desc');
    await expect(page.locator('#productsGrid .product-card').first()).toContainText(/Hydrating Face Cream|Face Serum/);

    await page.fill('#searchInput', 'Hydrating');
    await page.getByRole('button', { name: 'Apply Filters' }).click();

    await expect(page.locator('#productsGrid .product-card')).toHaveCount(1);
    await page.locator('#productsGrid .product-card a').first().click();

    await expect(page).toHaveURL(/product-detail\.html\?slug=/);
    await expect(page.locator('#productNameTitle')).toContainText('Hydrating Face Cream');
    await expect(page.locator('#productPrice')).not.toHaveText('$0.00');
    await expect(page.locator('#relatedProducts')).not.toContainText('Could not load related products');
  });

  test('login page shows validation for invalid credentials', async ({ page }) => {
    await page.goto('/pages/auth/login.html');

    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'badpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toContainText(/invalid|failed/i);
  });

  test('login succeeds for admin demo account and redirects to dashboard', async ({ page }) => {
    await page.goto('/pages/auth/login.html');

    await page.fill('#email', adminUser.email);
    await page.fill('#password', adminUser.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL(/pages\/admin\/dashboard\.html/, { timeout: 15_000 });
    await expect(page).toHaveURL(/pages\/admin\/dashboard\.html/);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('customer registration creates a new account and redirects home', async ({ page }) => {
    const uniqueId = Date.now();
    const email = `customer.${uniqueId}@example.com`;

    await page.goto('/pages/auth/register.html?role=customer');

    await page.fill('#name', 'Playwright Customer');
    await page.fill('#email', email);
    await page.fill('#phone', '9812345600');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.check('#terms');
    await page.getByRole('button', { name: /register/i }).click();

    await expect(page.locator('#message')).toContainText(/successful/i);
    await page.waitForURL('http://127.0.0.1:4173/index.html', { timeout: 15_000 });

    const storedUser = await page.evaluate(() => JSON.parse(localStorage.getItem('user') || '{}'));
    expect(storedUser.email).toBe(email);
    expect(storedUser.role).toBe('customer');
  });

  test('professional registration captures extra fields and redirects to dashboard', async ({ page }) => {
    const uniqueId = Date.now() + 1;
    const email = `pro.${uniqueId}@example.com`;

    await page.goto('/pages/auth/register.html?role=professional');

    await page.fill('#name', 'Playwright Professional');
    await page.fill('#email', email);
    await page.fill('#phone', '9812345601');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.selectOption('#specialization', 'Hair Stylist');
    await page.fill('#experience', '5');
    await page.fill('#bio', 'Experienced stylist created during automated testing.');
    await page.check('#terms');
    await page.getByRole('button', { name: /register/i }).click();

    await expect(page.locator('#message')).toContainText(/successful/i);
    await page.waitForURL(/pages\/professional\/dashboard\.html/, { timeout: 15_000 });

    const storedUser = await page.evaluate(() => JSON.parse(localStorage.getItem('user') || '{}'));
    expect(storedUser.email).toBe(email);
    expect(storedUser.role).toBe('professional');
  });
});
