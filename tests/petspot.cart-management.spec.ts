import { test } from '@playwright/test';
import { PetSpotCartPage } from '../pages/petspot-cart-page';

test('Add item to cart and remove it - verify cart is empty', async ({ page }) => {
  const cartPage = new PetSpotCartPage(page);
  await cartPage.navigate();
  await cartPage.verifyCartCount(0);
  await cartPage.addFirstItemToCart();
  await cartPage.verifyItemAddedSuccessfully();
  await cartPage.openCart();
  await cartPage.removeFirstItem();
  await cartPage.confirmRemoval();
  await cartPage.verifyCartIsEmpty();
});
