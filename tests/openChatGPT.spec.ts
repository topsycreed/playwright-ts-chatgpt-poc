import { test } from '@playwright/test';
import { GptPage } from '../pages/chatGPT/gptPage';

const email: string | undefined = process.env.CHATGPT_EMAIL;
const password: string | undefined = process.env.CHATGPT_PASSWORD;

test('open chatGPT', async ({ page }) => {
  test.setTimeout(120000);

  const gptPage = new GptPage(page);

  await gptPage.navigate();
  await gptPage.clickSignIn();
  await gptPage.login(email, password);
  await gptPage.closeTips();
  await gptPage.sendMessage("Hello!");
  await gptPage.sendMessage("How could you help me with QA tasks?");
  await gptPage.logMessages();
  await page.close();
});