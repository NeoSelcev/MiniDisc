import { test, expect } from '@playwright/test';

test('Sticker customization panel should only close on X button, ESC, or click outside', async ({ page }) => {
  // Go to the app
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(1000);
  
  // Find and click on a sticker to open customization panel
  console.log('Looking for sticker preview...');
  const stickerPreview = page.locator('.absolute').first();
  await stickerPreview.waitFor({ timeout: 5000 });
  await stickerPreview.click();
  await page.waitForTimeout(500);
  
  // Check if customization panel is open
  const panel = page.locator('text=Front Sticker').or(page.locator('text=Spine Sticker')).or(page.locator('text=Face Sticker')).or(page.locator('text=Back Sticker'));
  await expect(panel).toBeVisible();
  console.log('✅ Panel opened');
  
  // TEST 1: Click on slider - should NOT close
  console.log('\nTEST 1: Clicking slider...');
  const slider = page.locator('input[type="range"]').first();
  await slider.click();
  await page.waitForTimeout(300);
  await expect(panel).toBeVisible();
  console.log('✅ Panel still open after slider click');
  
  // TEST 2: Drag slider - should NOT close
  console.log('\nTEST 2: Dragging slider...');
  await slider.hover();
  await page.mouse.down();
  await page.mouse.move(100, 0, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  await expect(panel).toBeVisible();
  console.log('✅ Panel still open after slider drag');
  
  // TEST 3: Drag panel by header - should NOT close
  console.log('\nTEST 3: Dragging panel...');
  const header = page.locator('.cursor-move').first();
  const headerBox = await header.boundingBox();
  if (headerBox) {
    await page.mouse.move(headerBox.x + headerBox.width / 2, headerBox.y + headerBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(headerBox.x + 100, headerBox.y + 100, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    await expect(panel).toBeVisible();
    console.log('✅ Panel still open after dragging');
  }
  
  // TEST 4: Click reset button - should NOT close (but should work)
  console.log('\nTEST 4: Clicking reset button...');
  const resetButton = page.locator('button[title="Reset to defaults"]');
  await resetButton.click();
  await page.waitForTimeout(300);
  await expect(panel).toBeVisible();
  console.log('✅ Panel still open after reset button click');
  
  // TEST 5: Click outside - SHOULD close
  console.log('\nTEST 5: Clicking outside panel...');
  await page.mouse.click(50, 50);
  await page.waitForTimeout(300);
  await expect(panel).not.toBeVisible();
  console.log('✅ Panel closed after clicking outside');
  
  // Reopen panel for next tests
  await stickerPreview.click();
  await page.waitForTimeout(500);
  await expect(panel).toBeVisible();
  console.log('✅ Panel reopened');
  
  // TEST 6: Press ESC - SHOULD close
  console.log('\nTEST 6: Pressing ESC...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await expect(panel).not.toBeVisible();
  console.log('✅ Panel closed after ESC');
  
  // Reopen panel for final test
  await stickerPreview.click();
  await page.waitForTimeout(500);
  await expect(panel).toBeVisible();
  console.log('✅ Panel reopened');
  
  // TEST 7: Click X button - SHOULD close
  console.log('\nTEST 7: Clicking X button...');
  const closeButton = page.locator('button').filter({ hasText: '✕' });
  await closeButton.click();
  await page.waitForTimeout(300);
  await expect(panel).not.toBeVisible();
  console.log('✅ Panel closed after X button click');
  
  console.log('\n🎉 ALL TESTS PASSED!');
});
