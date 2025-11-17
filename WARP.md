# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project type: Playwright end-to-end tests (TypeScript) with simple Page Object Model and GitHub Actions CI.

Quickstart
- Install deps: npm ci
- Install browsers: npx playwright install
- Run all tests: npx playwright test
- Run a single test file: npx playwright test tests/petspot.smoke.spec.ts
- Single browser project (e.g., Chromium): npx playwright test --project=chromium
- Headed/debug: npx playwright test --headed --project=chromium
- By test title (grep): npx playwright test -g "User can log in"
- Open last HTML report: npx playwright show-report
- Interactive debug with Playwright Inspector: npx playwright test --debug
- UI mode (interactive test runner): npx playwright test --ui

Environment required by tests
- The Amazon login tests depend on two env vars loaded from .env via dotenv in playwright.config.ts:
  - AMAZON_EMAIL
  - AMAZON_PASSWORD
- Create a .env in the repo root with these keys before running tests that hit Amazon (tests/login.spec.ts).

Playwright MCP (Model Context Protocol)
- Start the local MCP server (installed in this repo as @playwright/mcp):
  - npm run mcp:playwright -- --browser=chromium --shared-browser-context --save-session --port=8770
  - Add --headless for CI-like runs; omit it for interactive work.
- Typical connection endpoint for MCP clients: ws://localhost:8770
- Adjust allowed origins/hosts if your client requires it, e.g.:
  - npm run mcp:playwright -- --browser=chromium --port=8770 --allowed-origins=http://localhost:3000

High-level architecture
- Test runner configuration: playwright.config.ts
  - Loads environment variables via dotenv.
  - Projects: chromium, firefox, webkit (Desktop devices presets).
  - fullyParallel: true; retries on CI; HTML reporter; trace on first retry.
- Tests:
  - tests/petspot.smoke.spec.ts: basic smoke for https://petspot.rs/ (URL, title, key category labels).
  - tests/petspot.add-to-cart.spec.ts: E2E test for petspot.rs adding products to cart; includes consent handling helper, cart count verification, and product validation in cart.
  - tests/petspot.cart-management.spec.ts: E2E test for complete cart workflow using POM - adds item to cart, verifies addition, removes item, and confirms cart is empty. Demonstrates clean POM usage with PetSpotCartPage.
  - tests/login.spec.ts: Amazon login flow using Page Objects; reads AMAZON_EMAIL and AMAZON_PASSWORD.
  - tests/example.spec.ts: Playwright docs quickstart examples.
  - tests-examples/demo-todo-app.spec.ts: Playwright's TodoMVC sample suite.
- Page Objects (POM):
  - pages/login-page.ts: Comprehensive Amazon login POM using role-based locators (getByRole, getByLabel) and expectations. Demonstrates proper POM pattern with typed locators, navigation methods, and action methods.
  - pages/petspot-cart-page.ts: PetSpot cart management POM with methods for adding/removing items, verifying cart state, and extracting cart count. Includes helper methods like waitForCartCount() using expect.poll() for robust async operations.
  - pages/chatGPT/homePage.ts and pages/chatGPT/signInPage.ts: Simpler POM classes split by page responsibilities.
  - Locator strategy: Prefer role-based locators (getByRole, getByLabel) over CSS selectors for resilience. Use first() when dealing with multiple matching elements. When selecting from lists, use nth() after filtering visible items.

CI Pipeline
- .github/workflows/playwright.yml runs on push/PR to main/master using ubuntu-latest:
  - npm ci
  - npx playwright install --with-deps
  - npx playwright test
  - Uploads HTML report artifact (playwright-report/)

Notes for development
- Tests live under tests/. Add new specs alongside existing ones; they inherit settings from playwright.config.ts.
- For tests that require authentication, prefer storing credentials in .env (already wired via dotenv).
- Helper functions: Reusable helper functions (like acceptConsentIfAny in petspot.add-to-cart.spec.ts) can be extracted to test utilities for common operations across tests.
- Avoid { waitUntil: 'networkidle' } in page.goto() for petspot.rs—it causes timeouts. Use default load events.
- When clicking add-to-cart buttons on petspot.rs, locate product items first (e.g., li.product-item), then find the button relative to each item. This avoids invisible duplicate buttons elsewhere on the page.
- For polling assertions, use expect.poll() instead of waiting with fixed timeouts. See petspot.add-to-cart.spec.ts for cart count verification example.
- Windows notes: PowerShell commands differ from bash. Use Get-ChildItem instead of ls, Test-Path instead of test -f, etc.
