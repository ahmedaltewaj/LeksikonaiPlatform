import { test, expect } from '@playwright/test';

test.describe('Stripe E2E Tests', () => {
  test('pricing page - loads and displays all plans', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByRole('heading', { name: 'Priser' })).toBeVisible();

    const planCards = page.locator('[data-testid="pricing-plan-card"]');
    await expect(planCards).toHaveCount(4);
  });

  test('pricing page - FAQ accordion opens and closes', async ({ page }) => {
    await page.goto('/pricing');

    const firstFaqButton = page.getByRole('button').filter({ hasText: 'Kan jeg skifte plan når som helst?' });
    await firstFaqButton.click();

    await expect(page.getByText('Ja, du kan til enhver tid opgradere eller nedgradere din plan.')).toBeVisible();

    await firstFaqButton.click();
    await expect(page.getByText('Ja, du kan til enhver tid opgradere eller nedgradere din plan.')).not.toBeVisible();
  });

  test('pricing - unauthenticated user clicking starter plan redirects to login', async ({ page }) => {
    await page.goto('/pricing');

    const starterPlan = page.locator('[data-plan-tier="starter"]');
    await starterPlan.getByRole('button', { name: /vælg|select/i }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('pricing - starter plan button is clickable for logged in user', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Adgangskode').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Log ind' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/pricing');

    const starterPlan = page.locator('[data-plan-tier="starter"]');
    const selectButton = starterPlan.getByRole('button', { name: /vælg|select/i });

    await selectButton.click();
  });

  test('checkout session - mocked API returns session URL', async ({ page }) => {
    await page.route('**/api/stripe/checkout', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { url: 'https://checkout.stripe.com/test' } }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Adgangskode').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Log ind' }).click();
    await page.goto('/pricing');

    const starterPlan = page.locator('[data-plan-tier="starter"]');
    await starterPlan.getByRole('button', { name: /vælg|select/i }).click();

    await page.waitForURL('https://checkout.stripe.com/test**');
  });
});