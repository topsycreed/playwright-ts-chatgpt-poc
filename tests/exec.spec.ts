// test.spec.js
import { test, expect } from '@playwright/test';

import { execSync, exec } from 'child_process';

// Replace 'apiTests.spec.ts' with your variable containing the test file name
const testFileName = 'apiTests.spec.ts';

// Formulate the command to execute
const command = `npx playwright test ${testFileName}`;

test('Execute', async ({ request }) => {
  execSync(command);

  // try {
  //   // Execute the Playwright test script
  //   const output = execSync(command, { stdio: 'inherit' });
  //   // console.log(`Script output:\n${output.toString()}`);
  // } catch (error) {
  //   console.error(`Error executing Playwright test: ${error.message}`);
  // }
});
