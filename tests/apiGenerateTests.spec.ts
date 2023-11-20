import { test } from '@playwright/test';
import { sendSimpleMessage, sendSystemMessage, sendConversationMessage, executeTest, executeTestWithSelfHeal, createTest } from '../steps/gptSteps.ts'

const fs = require('fs');
const messagesFilePath = 'chatGPTLogs.txt';

const logFilePath = 'execution_log_messages.txt';

//clean logs before execution
test.beforeAll(async () => {
  fs.writeFileSync(messagesFilePath, "");
  fs.writeFileSync(logFilePath, "");
});

let conversationHistory = [
  { role: "system", content: "Behave like Automation QA Enginner. Your tech stack: TypeScript, Playwright, axios. Your main goal is to write API tests for baseUrl = process.env.BASE_URL!;. It should be only API calls without any UI steps. If you return code ALWAYS return any additional text as comments!" },
];

test('Generate test from postman', async ({ page }) => {
  test.setTimeout(100000);
  const code = "import { test, expect } from '@playwright/test';\nimport axios from 'axios';\n\nconst baseUrl = 'https://superhero.qa-test.csssr.com';\n\ntest('GET /superheroes/1 should return correct response', async () => {\n  const response = await axios.get(`${baseUrl}/superheroes/1`);\n\n  expect(response.status).toBe(200);\n  expect(response.data).toEqual({\n    id: 1,\n    fullName: 'Dr Pepper New',\n    birthDate: '2020-02-22',\n    city: 'Moscow',\n    mainSkill: 'Soda',\n    gender: 'M',\n    phone: null\n  });\n});"
  await createTest(code);
});

test('Get simple API answer', async ({ page }) => {
  test.setTimeout(100000);
  await sendSimpleMessage("Say this is a test!");
});

test('Get system API answer and save to file', async ({ page }) => {
  test.setTimeout(100000);
  const code = await sendSystemMessage("Generate simple GET API test for endpoint '/superheroes/1' using import test, expect from '@playwright/test' and 'axios' lib. Please do not use any other libraries. Use baseUrl as variable. Check that response matching the JSON structure: {\"id\": 1, \"fullName\": \"Dr Pepper New\", \"birthDate\": \"2020-02-22\", \"city\": \"Moscow\", \"mainSkill\": \"Soda\", \"gender\": \"M\", \"phone\": null }. Check only contract, without exact values of fields");
  await createTest(code);
});

test('Get conversation and save to file and execute test', async ({ page }) => {
  test.setTimeout(100000);
  await sendConversationMessage(conversationHistory, "Generate simple GET API test for endpoint '/superheroes/1' using import test, expect from '@playwright/test' and 'axios' lib. Please do not use any other libraries. Use baseUrl as variable. Check that response matching the JSON structure: {\"id\": 1, \"fullName\": \"Dr Pepper New\", \"birthDate\": \"2020-02-22\", \"city\": \"Moscow\", \"mainSkill\": \"Soda\", \"gender\": \"M\", \"phone\": null }. Check only contract, without exact values of fields");
  const code = await sendConversationMessage(conversationHistory, "Could you also print in logs status code and body of response? Keep in mind that to get status code you need to use method response.status, not response.status()");
  await createTest(code);
  await executeTest();
});

test('Self healing', async ({ page }) => {
  test.setTimeout(300000);
  await sendConversationMessage(conversationHistory, "Generate simple GET API test for endpoint '/superheroes/1' using import test, expect from '@playwright/test' and 'axios' lib. Please do not use any other libraries. Use baseUrl as variable. Check that response matching the JSON structure: {\"id\": 1, \"fullName\": \"Dr Pepper New\", \"birthDate\": \"2020-02-22\", \"city\": \"Moscow\", \"mainSkill\": \"Soda\", \"gender\": \"M\", \"phone\": null }. Check only contract, without exact values of fields");
  const code = await sendConversationMessage(conversationHistory, "Could you also print in logs status code and body of response? Keep in mind that to get status code you need to use method response.status, not response.status()");
  await createTest(code);
  await executeTestWithSelfHeal(conversationHistory);
});