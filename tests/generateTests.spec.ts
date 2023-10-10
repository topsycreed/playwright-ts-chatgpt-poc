import { test } from '@playwright/test';
import { GptPage } from '../pages/chatGPT/gptPage';

const email: string | undefined = process.env.CHATGPT_EMAIL;
const password: string | undefined = process.env.CHATGPT_PASSWORD;

const fs = require('fs');
const messagesFilePath = 'chatGPTLogs.txt';

import { execSync } from 'child_process';

// const testsFileName = 'chatGPTGeneratedTest.spec.ts';
const testsFileName = 'apiChatTests.spec.ts';
const fixedtestFileName = 'apiChatFixedTest.spec.ts';

// Formulate the command to execute
const command = `npx playwright test ${testsFileName}`;
const commandFix = `npx playwright test ${fixedtestFileName}`;

const capturedMessages: string[] = [];

const logFilePath = 'execution_log_messages.txt';

const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  const message = args.map(arg => String(arg)).join(' ');
  capturedMessages.push(message);
  originalConsoleLog(...args);
};

//clean logs before execution
test.beforeAll(async () => {
  fs.writeFileSync(messagesFilePath, "");
  fs.writeFileSync(logFilePath, "");
});

test('Generate GET API test with chatGPT with auto-fix enabled', async ({ page }) => {
  //timeout for the whole test
  test.setTimeout(800000);
  //open chatGPT
  const gptPage = new GptPage(page);
  await gptPage.setup();
  //Asking chatGPT
  await gptPage.sendMessage("Hey, could you help me to generate simple GET API test using import test, expect from '@playwright/test' and 'axios' lib? Please do not use any other libraries. It should be only API calls without any UI steps. Add baseUrl as variable with value 'https://superhero.qa-test.csssr.com/' and api endpoint with '/superheroes/1'");
  await gptPage.sendMessage("If you are checking any field as example please remove such code and then add expect to check that response matching the JSON structure: {\"id\": 1, \"fullName\": \"Dr Pepper New\", \"birthDate\": \"2020-02-22\", \"city\": \"Moscow\", \"mainSkill\": \"Soda\", \"gender\": \"M\", \"phone\": null }");
  //Get code and execute it
  const code = await gptPage.sendMessage("Thanks, it's working. Could you also print in logs status code and body of response? Keep in mind that to get status code you need to use method response.status, not response.status()");
  await gptPage.createTest(code);
  // await gptPage.executeTest();
  await gptPage.fixTestIfFailed();
  await page.close();
});

// test('Generate GET API test with chatGPT', async ({ page }) => {
//   //timeout for the whole test
//   test.setTimeout(450000);
//   //open chatGPT
//   const gptPage = new GptPage(page);
//   await gptPage.navigate();
//   await gptPage.clickSignIn();
//   await gptPage.login(email, password);
//   await gptPage.closeTips();
//   //Asking chatGPT
//   await gptPage.sendMessage("Hey, could you help me to generate simple GET API test using import test, expect from '@playwright/test' and 'axios' lib? Please do not use any other libraries. It should be only API calls without any UI steps. Add baseUrl as variable with value 'https://superhero.qa-test.csssr.com/' and api endpoint with '/superheroes/1'");
//   await gptPage.sendMessage("If you are checking any field as example please remove such code and then add expect to check that response matching the JSON structure: {\"id\": 1, \"fullName\": \"Dr Pepper New\", \"birthDate\": \"2020-02-22\", \"city\": \"Moscow\", \"mainSkill\": \"Soda\", \"gender\": \"M\", \"phone\": null }");
//   //Get code and execute it
//   const code = await gptPage.sendMessage("Thanks, it's working. Could you also print in logs status code and body of response? Keep in mind that to get status code you need to use method response.status, not response.status()");
//   await gptPage.createTest(code);
//   await page.close();
//   try {
//     var result = execSync(command).toString();
//     console.log("Test passed!" + result);
//   } catch (error) {
//     console.log("Test failed!" + error.stdout.toString());
//   }
// });

// test('Only run already generated test and try to get suggestion for fix', async ( {page} ) => {
//   //timeout for the whole test
//   test.setTimeout(450000);
//   try {
//     var result = execSync(command).toString();
//     console.log("Test passed!" + result);
//   } catch (error) {
//     // console.log("error.status: " + error.status);  // 0 : successful exit, but here in exception it has to be greater than 0
//     // console.log("error.message: " + error.message); // Holds the message you typically want.
//     // console.log("error.stderr: " + error.stderr.toString());  // Holds the stderr output. Use `.toString()`.
//     console.log("Test failed!" + error.stdout.toString());  // Holds the stdout output. Use `.toString()`.
//   }
//   //logging test results to file
//   fs.writeFileSync(logFilePath, capturedMessages.join('\n'));
//   //reading test results
//   let firstLine;
//   let combinedString;
//   try {
//     // Read the entire file content into a string
//     const fileContent = fs.readFileSync(logFilePath, 'utf-8');
  
//     // Split the string into lines
//     const lines = fileContent.split('\n');
  
//     // Get the first line
//     firstLine = lines[0];
//     // Combine all lines into one string
//     combinedString = fileContent.split('\n').join('');
  
//     console.log('First line:', firstLine);
//   } catch (err) {
//     console.error('Error reading the file:', err);
//   };
//   let chatGPTErrorPromt;
//   if (firstLine == 'Test failed!') {
//     console.log('Need to ask chatGPT to fix the test');
//     chatGPTErrorPromt = "I executed test that you generated for me. It failed, please write suggestions to fix it. This is the results of my executions: " + combinedString;
//     const gptPage = new GptPage(page);
//     await gptPage.navigate();
//     await gptPage.clickSignIn();
//     await gptPage.login(email, password);
//     await gptPage.closeTips();
//     //Asking chatGPT
//     await gptPage.sendMessage(chatGPTErrorPromt);

//     let latestCode;
//     try {
//       const fileContent = fs.readFileSync(testsFileName, 'utf-8');
//       latestCode = fileContent.split('\n').join('');
//     } catch (err) {
//       console.error('Error reading the file:', err);
//     };

//     const code = await gptPage.sendMessage("Thanks! Now fix the latest test code with those suggestions and return fixed version! This is the latest code version: " + latestCode);
//     await gptPage.createTestWithPath(fixedtestFileName, code);
//     await page.close();
//     try {
//       var result = execSync(commandFix).toString();
//       console.log("Test passed after fix!" + result);
//     } catch (error) {
//       console.log("Test still failed after fix!" + error.stdout.toString());
//     }
//   }
// });