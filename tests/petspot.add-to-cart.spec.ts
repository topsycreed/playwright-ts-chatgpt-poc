import { test, expect } from '@playwright/test';

// E2E: Open PSI category and add first available product to the cart
// Tries top-nav -> Psi -> first subcategory -> first product with an enabled Add-to-cart button.

async function acceptConsentIfAny(page) {
  const selectors = [
    '#onetrust-accept-btn-handler',
    'button:has-text("Prihvati")',
    'button:has-text("Prihvatam")',
    'button:has-text("Prihvati sve")',
    'button:has-text("Accept")',
    'button:has-text("Slažem se")',
    '[role="button"]:has-text("Prihvati")',
  ];
  for (const s of selectors) {
    const btn = page.locator(s).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      break;
    }
  }
}

test('PSI: add first available product to cart', async ({ page }) => {
  await page.goto('https://petspot.rs/');
  await acceptConsentIfAny(page);

  // Ensure header cart link is present and record initial count
  const cartLink = page.getByRole('link', { name: /Korpa/i }).first();
  await expect(cartLink).toBeVisible();
  const getCartCount = async () => {
    const text = await cartLink.innerText().catch(() => 'Korpa 0');
    const match = text.match(/\b(\d+)\b/);
    return match ? parseInt(match[1], 10) : 0;
  };
  const initialCount = await getCartCount();

  // 1) Click top-level PSI category
  const psiTopNav = page.getByRole('menuitem', { name: /psi/i }).first();
  await expect(psiTopNav).toBeVisible();
  await psiTopNav.click({ timeout: 10000 });
  await page.waitForLoadState('domcontentloaded');

  // Ensure we landed on PSI category page
  if (!/\/psi(\/|$)/i.test(page.url())) {
    await page.goto('https://petspot.rs/psi/');
    await page.waitForLoadState('domcontentloaded');
  }

  // 2) Find product items (container with product info), then locate relative add-to-cart button
  // Typical product items are list items with product data
  const productItems = page.locator('li.product-item, li.item.product.product-item, [class*="product-item"]');
  const itemCount = await productItems.count();

  let clicked = false;
  let productName = '';
  let productPrice = '';
  for (let i = 0; i < itemCount; i++) {
    const item = productItems.nth(i);
    if (await item.isVisible().catch(() => false)) {
      // Look for the add-to-cart button within this product item
      const btn = item.locator('button:has-text("DODAJTE U KORPU")').first();
      if (await btn.isVisible().catch(() => false)) {
        // Capture product name and price from the item
        productName = await item.locator('.product-item-link, a.product-item-name, strong a').first().innerText().catch(() => '');
        productPrice = await item.locator('[data-price-type="finalPrice"] .price, .price-box .price, span.price').first().innerText().catch(() => '');
        
        await btn.scrollIntoViewIfNeeded().catch(() => {});
        await btn.evaluate(el => (el as HTMLElement).click());
        clicked = true;
        break;
      }
    }
  }

  // If no product item with a direct add-to-cart button, open first product page
  if (!clicked) {
    const firstProductLink = page.locator('a.product-item-link, a[href*="/psi/"][href*=".html"]').first();
    if (await firstProductLink.isVisible().catch(() => false)) {
      await firstProductLink.click({ timeout: 10000 });
      await page.waitForLoadState('domcontentloaded');
      await acceptConsentIfAny(page);
      const pdpAdd = page.locator('button:has-text("DODAJTE U KORPU")').first();
      await expect(pdpAdd).toBeVisible({ timeout: 15000 });
      await pdpAdd.click({ timeout: 15000 });
      clicked = true;
    }
  }

  expect(clicked).toBeTruthy();

  // 3) Assert cart count increased numerically
  await expect.poll(async () => await getCartCount(), {
    timeout: 20000,
    message: 'Cart count should increase after adding to cart',
  }).toBeGreaterThan(initialCount);

  // 4) Click on cart (Korpa) icon to open cart dropdown/modal
  await cartLink.click();
  await page.waitForLoadState('domcontentloaded');

  // 5) Wait for cart product list to appear and verify product name and price
  const cartProductList = page.locator('.minicart-items, .cart.item, .product-item-details, [data-role="cart-item"]');
  await expect(cartProductList.first()).toBeVisible({ timeout: 10000 });

  // Verify product name appears in cart
  if (productName) {
    const cartProductName = page.locator('.product-item-name, .minicart-name, a.product-name').filter({ hasText: productName }).first();
    await expect(cartProductName).toBeVisible({ timeout: 10000 });
  }

  // Verify product price appears in cart
  if (productPrice) {
    const cleanPrice = productPrice.replace(/\s+/g, ' ').trim();
    const cartPrice = page.locator('.price, .minicart-price, [data-label="Price"]').filter({ hasText: cleanPrice }).first();
    await expect(cartPrice).toBeVisible({ timeout: 10000 });
  }
});
