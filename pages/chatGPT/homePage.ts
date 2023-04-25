import { Page } from '@playwright/test';

export class HomePage {
  private page: Page;
  private accountAndListsLocator = '#nav-link-accountList-nav-line-1';
  private signInButtonLocator = '#nav-flyout-ya-signin > a';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto('https://www.amazon.com/gp/css/homepage.html/ref=nav_bb_ya');
  }

  async clickSignIn() {
    await this.page.hover(this.accountAndListsLocator, { force: true });
    await this.page.waitForSelector(this.signInButtonLocator);
    await this.page.click(this.signInButtonLocator);
  }
}