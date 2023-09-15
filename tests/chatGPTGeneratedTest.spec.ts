import { test, expect } from '@playwright/test';
import axios from 'axios';

// Define the base URL and API endpoint
const baseUrl = 'https://superhero.qa-test.csssr.com/';
const apiEndpoint = 'superheroes/1';

test('API Test: GET Request', async () => {
  // Make a GET request using Axios
  const response = await axios.get(baseUrl + apiEndpoint);

  // Get the status code
  const statusCode = response.status;

  // Print the status code to the logs
  console.log(`Status Code: ${statusCode}`);

  // Get the response body
  const responseBody = response.data;

  // Print the response body to the logs
  console.log('Response Body:', responseBody);

  // Assert the HTTP status code
  expect(statusCode).toBe(200);

  // Assert that the response structure matches the expected JSON structure
  const expectedStructure = {
    id: expect.any(Number),
    fullName: expect.any(String),
    birthDate: expect.any(String),
    city: expect.any(String),
    mainSkill: expect.any(String),
    gender: expect.any(String),
    phone: expect.anything(), // Use `expect.anything()` to allow both null and defined values
  };

  expect(responseBody).toMatchObject(expectedStructure);
});
