import { test, expect } from '@playwright/test';

test.describe('Inquiry E2E Tests', () => {
  test('dashboard - displays customer inquiries section', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Adgangskode').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Log ind' }).click();
    await expect(page).toHaveURL('/dashboard');

    await expect(page.getByRole('heading', { name: 'Leksikon.ai Dashboard' })).toBeVisible();
    await expect(page.getByText('Customer Inquiries')).toBeVisible();
    await expect(page.getByText('Response Review')).toBeVisible();
  });

  test('dashboard - status filter dropdown works', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Adgangskode').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Log ind' }).click();
    await expect(page).toHaveURL('/dashboard');

    const filterSelect = page.locator('select').first();
    await filterSelect.selectOption('pending');
    await expect(filterSelect).toHaveValue('pending');

    await filterSelect.selectOption('reviewed');
    await expect(filterSelect).toHaveValue('reviewed');

    await filterSelect.selectOption('all');
    await expect(filterSelect).toHaveValue('all');
  });

  test('dashboard - shows pending inquiries when filter is pending', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Adgangskode').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Log ind' }).click();
    await expect(page).toHaveURL('/dashboard');

    const filterSelect = page.locator('select').first();
    await filterSelect.selectOption('pending');

    const inquirySection = page.locator('text=Customer Inquiries').locator('..');
    await expect(inquirySection).toBeVisible();
  });

  test('review page - has pending and history tabs', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Adgangskode').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Log ind' }).click();
    await page.goto('/review');

    await expect(page.getByRole('button', { name: 'Pending' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'History' })).toBeVisible();
  });

  test('review page - clicking tab switches content', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Adgangskode').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Log ind' }).click();
    await page.goto('/review');

    await page.getByRole('button', { name: 'History' }).click();
    await expect(page.getByText('All caught up!')).toBeVisible();
  });

  test('dashboard - email settings link is visible when not verified', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Adgangskode').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Log ind' }).click();
    await expect(page).toHaveURL('/dashboard');

    await expect(page.getByText('Email indstillinger')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profil' })).toBeVisible();
  });

  test('dashboard - navigates to settings pages', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Adgangskode').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Log ind' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.goto('/dashboard/settings/email');
    await expect(page.getByRole('heading', { name: /email/i })).toBeVisible();
  });
});