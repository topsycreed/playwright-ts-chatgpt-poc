import { Page } from '@playwright/test';

export class SignInPage {
  private page: Page;
  private emailInputLocator = 'input[name="email"]';
  private continueButtonLocator = 'input[type="submit"]';
  private passwordInputLocator = 'input[name="password"]';

  constructor(page: Page) {
    this.page = page;
  }

  async enterEmail(email: string) {
    await this.page.type(this.emailInputLocator, email);
  }

  async clickContinue() {
    await this.page.click(this.continueButtonLocator);
  }

  async enterPassword(password: string) {
    await this.page.type(this.passwordInputLocator, password);
  }

  async clickSignIn() {
    await this.page.click(this.continueButtonLocator);
  }

  async waitForNavigation() {
    await this.page.waitForNavigation();
  }
}