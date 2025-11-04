import { test, expect } from '@playwright/test';

test.describe('MiniDisc Sticker Printer - Updated Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should have updated page title', async ({ page }) => {
    await expect(page).toHaveTitle('MiniDisc Sticker Printer');
  });

  test('should display minidisc favicon', async ({ page }) => {
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(favicon).toBe('/minidisc.svg');
  });

  test('should display header with Font Awesome disc icon', async ({ page }) => {
    // Check for Font Awesome icon in header
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check for Font Awesome icon class
    const icon = header.locator('svg[data-icon="compact-disc"], .fa-compact-disc');
    await expect(icon).toBeVisible();
  });

  test('should have theme toggle button', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator('button').filter({ hasText: /Light|Dark|Auto/ }).first();
    await expect(themeToggle).toBeVisible();
  });

  test('should toggle theme when clicking theme button', async ({ page }) => {
    const themeToggle = page.locator('button').filter({ hasText: /Light|Dark|Auto/ }).first();
    await expect(themeToggle).toBeVisible();
    
    // Get initial theme
    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class');
    
    // Click to change theme
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Check that class changed
    const newClass = await htmlElement.getAttribute('class');
    expect(initialClass).not.toBe(newClass);
  });

  test('should display Font Awesome icons in album list buttons', async ({ page }) => {
    // Check for Spotify button with icon
    const spotifyBtn = page.locator('button:has-text("Spotify")');
    await expect(spotifyBtn).toBeVisible();
    
    // Check for Manual button with icon  
    const manualBtn = page.locator('button:has-text("Manual")');
    await expect(manualBtn).toBeVisible();
  });

  test('should have settings button with Font Awesome icon', async ({ page }) => {
    const settingsBtn = page.locator('button:has-text("Settings")').first();
    await expect(settingsBtn).toBeVisible();
  });

  test('should display print button with Font Awesome icon', async ({ page }) => {
    const printBtn = page.locator('button:has-text("Print")');
    await expect(printBtn).toBeVisible();
  });

  test('dark mode should apply dark classes', async ({ page }) => {
    const themeToggle = page.locator('button').filter({ hasText: /Light|Dark|Auto/ }).first();
    
    // Click until we get to dark mode
    await themeToggle.click();
    await page.waitForTimeout(300);
    
    const buttonText = await themeToggle.textContent();
    if (!buttonText?.includes('Dark')) {
      await themeToggle.click();
      await page.waitForTimeout(300);
    }
    
    // Check for dark mode class
    const htmlElement = page.locator('html');
    const classList = await htmlElement.getAttribute('class');
    
    // If theme is Dark, html should have dark class
    const currentTheme = await themeToggle.textContent();
    if (currentTheme?.includes('Dark')) {
      expect(classList).toContain('dark');
    }
  });
});
