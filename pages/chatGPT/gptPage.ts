import { Locator, Page } from '@playwright/test';

const fs = require('fs');
const path = require('path');
const messagesFilePath = 'chatGPTLogs.txt';
const testsFilePath = './tests';
const testsFileName = 'chatGPTGeneratedTest.spec.ts';
const testFullPath = path.join(testsFilePath, testsFileName);
const answerWaitTime = 60_000;

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
    await this.page.waitForTimeout(answerWaitTime);
    let code = await this.logMessage(message);
    return code;
  }

  async createTest(code: string) {
    fs.writeFileSync(testFullPath, code);
  }

  async logMessage(message: string) {
    const capturedMessages: string[] = [];
    const xpathLocator = '//div[contains(@data-testid, "conversation-turn")]';
    const codeXpathLocator = '//div[contains(@data-testid, "conversation-turn")]//button[text() = "Copy code"]/../..//code';
    const codeXpathLocator2 = '//button[text() = "Copy code"]/../..//code';
    const elements = await this.page.$$(xpathLocator);
    let question = false;
    let answer;
    let codeText;
    for (const elementHandle of elements) {
      const text = await elementHandle.innerText();
      if (text === message) {
        question = true;
        capturedMessages.push("Question: " + message + '\n');
        // console.log("Question: " + message);
      } else if (question) {
        const code = await elementHandle.$(codeXpathLocator2);
        if (code) {
          codeText = code.innerText();
        }
        question = false;
        answer = text;
        capturedMessages.push("Answer: " + answer + '\n');
        // console.log("Answer: " + text);
      }
    }
    if (!answer) {
      fs.appendFileSync(messagesFilePath, "Cannot get answer for the question: " + message + '\n');
      // console.log("Cannot get answer for the question: " + message);
      throw new Error('Cannot get answer for the question: ' + question);
    } else {
      fs.appendFileSync(messagesFilePath, capturedMessages.join(''));
      return codeText;
    }
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