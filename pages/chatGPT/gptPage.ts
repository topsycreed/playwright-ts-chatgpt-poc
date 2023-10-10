import { Locator, Page } from '@playwright/test';
import { execSync } from 'child_process';

const fs = require('fs');
const path = require('path');
const messagesFilePath = 'chatGPTLogs.txt';
const testsFilePath = './tests';
const testsFileName = 'chatGPTGeneratedTest.spec.ts';
const fixedTestFileName = 'apiChatFixedTest.spec.ts';
const testFullPath = path.join(testsFilePath, testsFileName);
const answerWaitTime = 90_000;

const email: string | undefined = process.env.CHATGPT_EMAIL;
const password: string | undefined = process.env.CHATGPT_PASSWORD;

const command = `npx playwright test ${testsFileName}`;

const capturedMessages: string[] = [];

const logFilePath = 'execution_log_messages.txt';

const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  const message = args.map(arg => String(arg)).join(' ');
  capturedMessages.push(message);
  originalConsoleLog(...args);
};

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

  async createTestWithPath(path: string, code: string) {
    const fixedTestFullPath = require('path').join(testsFilePath, path);
    fs.writeFileSync(fixedTestFullPath, code);
  }

  async executeTest() {
    try {
      var result = execSync(command).toString();
      console.log("Test passed!" + result);
    } catch (error) {
      console.log("Test failed!" + error.stdout.toString());
    }
    //logging test results to file
    fs.writeFileSync(logFilePath, capturedMessages.join('\n'));
  }

  async executeTestByName(testName: string) {
    try {
      var result = execSync("npx playwright test " + testName).toString();
      console.log("Test passed!" + result);
    } catch (error) {
      console.log("Test failed!" + error.stdout.toString());
    }
    //logging test results to file
    fs.writeFileSync(logFilePath, capturedMessages.join('\n'));
  }

  async fixTestIfFailed() {
    let maxAttempts = 5;
    let passed = false;
    for (let i = 0; i < maxAttempts; i++) {
      await this.executeTest();
      let status = await this.getStatus();
      console.log("Value of status: " + status);
      if ('Test passed!' == status) {
        passed = true;
        break;
      }
    }
    console.log("Value of passed: " + passed);
    if (passed) {
      console.log("Test passed at least once in " + maxAttempts + " attempts. So no auto-fix required. Please check your env or scenario.");
    } else {
      console.log('Need to ask chatGPT to fix the test');
      let executionFullLog = await this.getExecutionLog();
      let chatGPTErrorPromt = "I executed test that you generated for me. It failed, please write suggestions to fix it. This is the results of my executions: " + executionFullLog;
      let latestCode = await this.getLatestCode();
      await this.sendMessage(chatGPTErrorPromt);
      const newTestCode = await this.sendMessage("Thanks! Now fix the latest test code with those suggestions and return fixed version! This is the latest code version: " + latestCode);
      await this.createTestWithPath(fixedTestFileName, newTestCode);
      await this.executeTestByName("apiChatFixedTest.spec.ts");
      let status = await this.getStatus();
      if ('Test passed!' == status) {
        console.log('Fix helped!');
      } else {
        console.log('Even after the fix there are still error!');
      }
    }
  }

  

  async getLatestCode() {
    let latestCode;
    try {
      const еestFullPath = require('path').join(testsFilePath, testsFileName);
      const fileContent = fs.readFileSync(еestFullPath, 'utf-8');
      latestCode = fileContent.split('\n').join('');
    } catch (err) {
      throw new Error('Error reading the file with test code:' + err);
    };
    return latestCode;
  }

  async getStatus() {
    let status;
    try {
      const fileContent = fs.readFileSync(logFilePath, 'utf-8');
      const lines = fileContent.split('\n');
      status = lines[0];
    } catch (err) {
      throw new Error('Error reading the file to get status:' + err);
    };
    return status;
  }

  async getExecutionLog() {
    let log;
    try {
      const fileContent = fs.readFileSync(logFilePath, 'utf-8');
      const lines = fileContent.split('\n');
      log = fileContent.split('\n').join('');
    } catch (err) {
      throw new Error('Error reading the file to get execution logs:' + err);
    };
    return log;
  }

  async logMessage(message: string) {
    const capturedMessages: string[] = [];
    const xpathLocator = '//div[contains(@data-testid, "conversation-turn")]';
    const codeXpathLocator = '//div[contains(@data-testid, "conversation-turn")]//button[text() = "Copy code"]/../..//code';
    const codeXpathLocator2 = '//button[text() = "Copy code"]/../..//code';
    const elements = await this.page.$$(xpathLocator);
    let answer;
    let codeText;
    for (let i = 0; i < elements.length; i++) {
      let elementHandle = elements[i];
      const text = await elementHandle.innerText();
      if (i % 2 === 0) {
        capturedMessages.push("Question: " + message + '\n');
        // console.log("Question: " + message);
      }
      else {
        const code = await elementHandle.$(codeXpathLocator2);
        if (code) {
          codeText = code.innerText();
        }
        answer = text;
        capturedMessages.push("Answer: " + answer + '\n');
        // console.log("Answer: " + text);
      }
    }
    fs.appendFileSync(messagesFilePath, capturedMessages.join(''));
    return codeText;
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

  async setup() {
    await this.navigate();
    await this.clickSignIn();
    await this.login(email, password);
    await this.closeTips();
  }
}