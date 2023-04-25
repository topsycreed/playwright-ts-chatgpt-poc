import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { HomePage } from '../pages/chatGPT/homePage';
import { SignInPage } from '../pages/chatGPT/signInPage';

test('should succesfully login to Amazon page', async ({ page }) => {
  const email: string | undefined = process.env.AMAZON_EMAIL;
  const password: string | undefined = process.env.AMAZON_PASSWORD;

  if (!email || !password) {
    throw new Error('Error: Missing Amazon credentials.');
  }

  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.clickSignIn();
  await loginPage.loginForUser(email, password);

  console.log('Logged in successfully');
  await page.close();
});


// Generated with ChatGPT
test.describe('Amazon Login', () => {
  let homePage: HomePage;
  let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    signInPage = new SignInPage(page);
    await homePage.navigate();
  });

  test('User can log in with valid credentials', async ({ page }) => {
    const email: string | undefined = process.env.AMAZON_EMAIL;
    const password: string | undefined = process.env.AMAZON_PASSWORD;

    if (!email || !password) {
      throw new Error('Error: Missing Amazon credentials.');
    }

    await homePage.clickSignIn();
    await page.waitForSelector('input[name="email"]');

    await signInPage.enterEmail(email);
    await signInPage.clickContinue();

    await page.waitForSelector('input[name="password"]');

    await signInPage.enterPassword(password);
    await signInPage.clickSignIn();

    // await signInPage.waitForNavigation();

    await page.waitForSelector('#nav-link-accountList-nav-line-1');
    const signedIn = await page.isVisible('#nav-link-accountList-nav-line-1');
    expect(signedIn).toBeTruthy();

    // const signedIn = await page.isVisible('#nav-link-accountList-nav-line-1', {timeout: 3000});
    // expect(signedIn).toBeTruthy();

    console.log('Logged in successfully');
    await page.close();
  });
});