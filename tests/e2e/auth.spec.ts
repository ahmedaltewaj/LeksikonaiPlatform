import { test, expect } from '@playwright/test';

test.describe('Auth E2E Tests', () => {
  const testEmail = `e2e.test.${Date.now()}@test.leksikon.ai`;
  const testPassword = 'TestPassword123!';

  test('signup flow - user can create account and is redirected to onboarding', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Adgangskode').fill(testPassword);
    await page.getByRole('button', { name: 'Opret konto' }).click();

    await expect(page).toHaveURL('/onboarding');
  });

  test('login flow - user can log in with email and password', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Adgangskode').fill(testPassword);
    await page.getByRole('button', { name: 'Log ind' }).click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('login flow - shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('nonexistent@test.com');
    await page.getByLabel('Adgangskode').fill('wrongpassword');
    await page.getByRole('button', { name: 'Log ind' }).click();

    await expect(page.getByText('Invalid login credentials')).toBeVisible();
  });

  test('logout flow - user can log out and is redirected to home', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Adgangskode').fill(testPassword);
    await page.getByRole('button', { name: 'Log ind' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.getByRole('button', { name: 'Log ud' }).click();

    await expect(page).toHaveURL('/');
  });

  test('navigation - unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });

  test('pricing page - displays all plan tiers', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByText('Vælg den plan der passer til din virksomhed')).toBeVisible();
    await expect(page.getByText('Gratis')).toBeVisible();
    await expect(page.getByText('Start')).toBeVisible();
    await expect(page.getByText('Professionel')).toBeVisible();
    await expect(page.getByText('Enterprise')).toBeVisible();
  });

  test('signup - password must be at least 6 characters', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Adgangskode').fill('123');

    const submitButton = page.getByRole('button', { name: 'Opret konto' });
    await expect(submitButton).toBeDisabled();
  });
});