import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly accountIcon: Locator;
  readonly signInLink: Locator;
  readonly loginInput: Locator;
  readonly passwordInput: Locator;
  readonly continueButton: Locator;
  readonly signInButton: Locator;
  readonly menu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountIcon = page.getByRole('link', { name: 'Hello, sign in Account & Lists' });
    this.signInLink = page.getByRole('link', { name: 'Sign in', exact: true });
    this.loginInput = page.getByLabel('Email or mobile phone number');
    this.passwordInput = page.getByLabel('Password');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.menu = page.getByRole('button', { name: 'Open Menu' });
  }

  async navigate() {
    // await this.page.goto('https://www.amazon.com/');
    await this.page.goto('https://www.amazon.com/gp/css/homepage.html/ref=nav_bb_ya');
  }

  async clickSignIn() {
    await this.accountIcon.hover({force: true});
    await this.signInLink.waitFor({state: "visible"});
    await this.signInLink.click({ timeout: 5000 });
    await expect(this.page).toHaveURL(/.*signin/);
  }

  async loginForUser(username: string, password: string): Promise<void> {
    await this.loginInput.waitFor({state: "visible"});
    await this.loginInput.type(username, {delay: 100});
    await this.continueButton.click({ timeout: 5000 });
    await this.passwordInput.waitFor({state: "visible"});
    await this.passwordInput.type(password, {delay: 100});
    await this.signInButton.click({ timeout: 5000 });
    await expect(this.menu).toBeVisible({ timeout: 5000 });
  }
}