import { Locator, Page } from '@playwright/test';

export class GptPage {
  private page: Page;
  private signInButton: Locator;
  private emailInput: Locator;
  private continueButon: Locator;
  private passwordInput: Locator;
  private continueButon2: Locator;
  private tipsCloseButton: Locator;
  private messageInput: Locator;
  private messageSendButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInButton = page.getByTestId('login-button');
    this.emailInput = page.getByLabel('Email address');
    this.continueButon = page.getByRole('button', { name: 'Continue', exact: true });
    this.passwordInput = page.getByLabel('Password');
    this.continueButon2 = page.getByRole('button', { name: 'Continue' });
    this.tipsCloseButton = page.getByRole('button', { name: 'Okay, let’s go' });
    this.messageInput = page.getByPlaceholder('Send a message');
    this.messageSendButton = page.getByTestId('send-button');
  }

  async navigate() {
    await this.page.goto('https://chat.openai.com/');
  }

  async clickSignIn() {
    await this.signInButton.waitFor({state: "visible"});
    await this.signInButton.click({ timeout: 5000 });
  }

  async login(email: string | undefined, password: string | undefined): Promise<void> {
    if (!email || !password) {
      throw new Error('Error: Missing ChatGPT credentials.');
    }
    await this.emailInput.waitFor({state: "visible"});
    await this.emailInput.type(email);
    await this.continueButon.click();
    await this.passwordInput.waitFor({state: "visible"});
    await this.passwordInput.type(password);
    await this.continueButon2.click();
  }

  async closeTips() {
    await this.tipsCloseButton.waitFor({state: "visible"});
    await this.tipsCloseButton.click();
  }

  async sendMessage(message: string) {
    await this.messageInput.waitFor({state: "visible"});
    await this.messageInput.type(message);
    await this.messageSendButton.click();
    await this.page.waitForTimeout(30000);
  }

  async logMessages() {
    const xpathLocator = '//div[contains(@data-testid, "conversation-turn")]';
    const elements = await this.page.$$(xpathLocator);
    let question = true;
    for (const elementHandle of elements) {
      const text = await elementHandle.innerText();
      if (question) {
        console.log("Question: " + text);
        question = false;
      }
      else {
        console.log("Answer: " + text);
        question = true;
      }
    }
  }
}