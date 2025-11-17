import { expect, Locator, Page } from '@playwright/test';

export class PetSpotCartPage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly addToCartButton: Locator;
  readonly removeLink: Locator;
  readonly confirmRemovalButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.getByRole('link', { name: /Korpa/i }).first();
    this.addToCartButton = page.getByRole('button', { name: /DODAJTE U KORPU/i }).first();
    this.removeLink = page.getByRole('link', { name: /Remove/i }).first();
    this.confirmRemovalButton = page.getByRole('button', { name: 'OK' });
    this.emptyCartMessage = page.getByText(/Nemate nijedan artikal u korpi/i);
    this.successMessage = page.getByText(/Dodali ste.*u.*korpu/i);
  }

  async navigate() {
    await this.page.goto('https://petspot.rs/');
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for page to fully load and cart to be initialized
    await this.page.waitForTimeout(2000);
  }

  async getCartCount(): Promise<number> {
    const text = await this.cartLink.innerText();
    // Extract number from text, default to 0 if not found
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async waitForCartCount(expectedCount: number, timeout: number = 10000): Promise<void> {
    await expect.poll(async () => await this.getCartCount(), {
      timeout,
      message: `Cart count should be ${expectedCount}`,
    }).toBe(expectedCount);
  }

  async addFirstItemToCart(): Promise<void> {
    await expect(this.addToCartButton).toBeVisible({ timeout: 10000 });
    await this.addToCartButton.click();
  }

  async verifyItemAddedSuccessfully(): Promise<void> {
    // Verify cart count increased
    await this.waitForCartCount(1);
    // Verify success message appears
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async removeFirstItem(): Promise<void> {
    // Wait for cart contents to appear and find the Remove link
    await expect(this.removeLink).toBeVisible({ timeout: 10000 });
    await this.removeLink.click();
  }

  async confirmRemoval(): Promise<void> {
    // Confirm removal in the confirmation dialog if it appears
    if (await this.confirmRemovalButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.confirmRemovalButton.click();
    }
  }

  async verifyCartIsEmpty(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    // Verify cart count is 0
    await this.waitForCartCount(0);
    // Verify empty cart message appears
    await expect(this.emptyCartMessage).toBeVisible({ timeout: 5000 });
  }

  async verifyCartCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getCartCount();
    expect(actualCount).toBe(expectedCount);
  }
}
