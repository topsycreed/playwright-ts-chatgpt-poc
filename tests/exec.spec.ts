// test.spec.js
import { test } from '@playwright/test';

import { execSync } from 'child_process';

// Replace 'apiTests.spec.ts' with your variable containing the test file name
const testFileName = 'apiTests.spec.ts';

// Formulate the command to execute
const command = `npx playwright test ${testFileName}`;

test('Execute', async ({ request }) => {
  execSync(command);
});
