import { test, expect } from '@playwright/test';
import axios from 'axios';

// Define your base URL and API endpoint
const baseUrl = 'https://superhero.qa-test.csssr.com';
const apiEndpoint = '/superheroes/1';

test('Test API GET Request', async () => {
  // Make a GET request to the API endpoint
  const response = await axios.get(`${baseUrl}${apiEndpoint}`);

  // Log the status code to the console
  console.log('Response Status Code:', response.status);

  // Log the response body to the console
  console.log('Response Body:', response.data);

  // Ensure the response status code is 200 (OK)
  expect(response.status).toBe(200);

  // Add an expectation to check the response JSON structure
  expect(response.data).toEqual({
    id: 1,
    fullName: "Dr Pepper New",
    birthDate: "2020-02-22",
    city: "Moscow",
    mainSkill: "Soda",
    gender: "M",
    phone: null
  });
});
