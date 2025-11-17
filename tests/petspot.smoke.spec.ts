import { test, expect } from '@playwright/test';

// Simple smoke test for petspot.rs
// Verifies URL, title, and presence of top-level category labels/links.

test.describe('PetSpot.rs homepage smoke', () => {
  test('loads and shows key categories', async ({ page }) => {
    await page.goto('https://petspot.rs/');

    // URL should be the homepage on petspot.rs
    await expect(page).toHaveURL(/https?:\/\/(www\.)?petspot\.rs\/?(\?.*)?$/);

    // Title should mention PetSpot (be tolerant to formatting/spaces)
    await expect(page).toHaveTitle(/pet\s*spot/i);

    // Dismiss cookie/consent banner if present (cover common variants)
    const possibleConsentButtons = [
      '#onetrust-accept-btn-handler',
      'button:has-text("Prihvati")',
      'button:has-text("Prihvatam")',
      'button:has-text("Prihvati sve")',
      'button:has-text("Accept")',
      'button:has-text("Slažem se")',
      '[role="button"]:has-text("Prihvati")',
    ];
    for (const selector of possibleConsentButtons) {
      const btn = page.locator(selector).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        break;
      }
    }

    // Verify main categories exist somewhere on the page (link or plain text)
    const categories = [
      /\bpsi\b/i,           // Dogs
      /mačk[ae]/i,          // Cats (Mačka/Mačke)
      /glodari/i,           // Rodents
      /ptice/i,             // Birds
      /akvaristik/i,        // Aquaristics
      /teraristik/i,        // Terraristics
    ];

    for (const re of categories) {
      const item = page.getByRole('menuitem', { name: re }).first();
      await expect(item).toBeVisible({ timeout: 10000 });
    }
  });
});
