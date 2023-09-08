// test.spec.js
import { test, expect } from '@playwright/test';

// Define the base URL as a request context option
const baseUrl = 'https://superhero.qa-test.csssr.com/';

// Define the API endpoint
const apiEndpoint = '/superheroes/1';

const capturedMessages: string[] = [];

const fs = require('fs');
const messagesFilePath = 'captured_messages.txt';

const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  const message = args.map(arg => String(arg)).join(' ');
  capturedMessages.push(message);
  originalConsoleLog(...args);
};

test.afterAll(async () => {
    fs.writeFileSync(messagesFilePath, capturedMessages.join('\n'));
  });

test('API Test', async ({ request }) => {
  // Send a GET request to the API endpoint
  const response = await request.get(`${baseUrl}${apiEndpoint}`);
  
  // Log the response status code
  console.log('Response Status Code:', response.status());

  // Log the response body
  const responseBody = await response.text();
  console.log('Response Body:', responseBody);

  // Check the response status code
  expect(response.status()).toBe(200); // Adjust the expected status code as needed

  // Check if the response matches the expected JSON structure
  const expectedData = {
    id: 1,
    fullName: "Dr Pepper New",
    birthDate: "2020-02-22",
    city: "Moscow",
    mainSkill: "Soda",
    gender: "M",
    phone: null
  };
  
  const responseData = await response.json();
  expect(responseData).toEqual(expectedData);
});
