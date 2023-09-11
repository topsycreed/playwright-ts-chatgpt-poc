import { test } from '@playwright/test';
import { GptPage } from '../pages/chatGPT/gptPage';

const email: string | undefined = process.env.CHATGPT_EMAIL;
const password: string | undefined = process.env.CHATGPT_PASSWORD;

const fs = require('fs');
const messagesFilePath = 'chatGPTLogs.txt';

import { execSync } from 'child_process';

const path = require('path');
const testsFilePath = './tests';
const testsFileName = 'chatGPTGeneratedTest.spec.ts';
const testFullPath = path.join(testsFilePath, testsFileName);

// Formulate the command to execute
const command = `npx playwright test ${testFullPath}`;

test.beforeAll(async () => {
  fs.writeFileSync(messagesFilePath, "");
});

test('open chatGPT', async ({ page }) => {
  //timeout for the whole test
  test.setTimeout(450000);
  //open chatGPT
  const gptPage = new GptPage(page);
  await gptPage.navigate();
  await gptPage.clickSignIn();
  await gptPage.login(email, password);
  await gptPage.closeTips();
  //Asking chatGPT
  await gptPage.sendMessage("Hey, could you help me to generate simple GET API test using import test, expect from '@playwright/test' and 'axios' lib? Please do not use any other libraries. It should be only API calls without any UI steps. Add baseUrl as variable with value 'https://superhero.qa-test.csssr.com/' and api endpoint with '/superheroes/1'");
  await gptPage.sendMessage("If you are checking any field as example please remove such code and then add expect to check that response matching the JSON structure: {\"id\": 1, \"fullName\": \"Dr Pepper New\", \"birthDate\": \"2020-02-22\", \"city\": \"Moscow\", \"mainSkill\": \"Soda\", \"gender\": \"M\", \"phone\": null }");
  const code = await gptPage.sendMessage("Thanks, it's working. Could you also print in logs status code and body of response? Keep in mind that to get status code you need to use method response.status, not response.status()");
  await gptPage.createTest(code);
  //Get answers
  // await gptPage.logMessages();
  await page.close();
  execSync(command);
});