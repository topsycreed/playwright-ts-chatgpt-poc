import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/aeo/homePage';

test('add to bag', async ({ page }) => {
  test.setTimeout(120000);
  const productId = '3375_8672_669';
  const homePage = new HomePage(page);

  await homePage.navigate();
  await homePage.acceptAll();
  await homePage.chooseTopsCategory();
  await homePage.openItemPageByProductId(productId);
  await homePage.chooseSize('XXS');
  await homePage.addItemToBag();

  console.log('Added to bag successfully!');
  await page.close();
});