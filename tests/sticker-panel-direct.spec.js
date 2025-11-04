import { test, expect } from '@playwright/test';

test.describe('Sticker Customization Panel - Direct Tests', () => {
  test('Panel should open and close correctly', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    
    // Clear any existing state and set up a fresh test environment
    await page.evaluate(() => {
      // Start with a clean slate
      const testAlbum = {
        id: 'test-album-123',
        name: 'Test Album',
        artist: 'Test Artist',
        year: '2024',
        image: 'https://i.scdn.co/image/ab67616d0000b273abcdef123456789',
        tracks: [{ name: 'Track 1', duration: '3:45' }]
      };
      
      const freshState = {
        state: {
          albums: [testAlbum],
          activeCustomizationPanel: null,
        },
        version: 0
      };
      
      localStorage.setItem('minidisc-storage', JSON.stringify(freshState));
    });
    
    // Reload to apply clean state
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-initial-state.png', fullPage: true });
    console.log('📸 Screenshot: Initial state');
    
    // Now open the panel
    await page.evaluate(() => {
      const storeState = JSON.parse(localStorage.getItem('minidisc-storage') || '{}');
      storeState.state.activeCustomizationPanel = {
        albumId: storeState.state.albums[0].id,
        stickerType: 'spine'  // Valid types: 'spine', 'face', 'front', 'back'
      };
      localStorage.setItem('minidisc-storage', JSON.stringify(storeState));
    });
    
    // Reload to apply the state
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check if panel is visible (looking for "Spine Sticker" title in header)
    const panel = page.locator('.fixed.bg-white.rounded-lg').filter({ hasText: 'Spine Sticker' }).first();
    await expect(panel).toBeVisible({ timeout: 5000 });
    console.log('✅ Panel opened successfully');
    
    // Take screenshot with panel open
    await page.screenshot({ path: 'test-results/02-panel-open.png', fullPage: true });
    console.log('📸 Screenshot: Panel open');
    
    // Test 1: Click on a slider - panel should NOT close
    console.log('\n🧪 Test 1: Clicking slider should NOT close panel');
    const slider = page.locator('input[type="range"]').first();
    if (await slider.count() > 0) {
      await slider.click();
      await page.waitForTimeout(500);
      await expect(panel).toBeVisible();
      console.log('✅ Panel stayed open after clicking slider');
    }
    
    // Test 2: Drag the slider - panel should NOT close
    console.log('\n🧪 Test 2: Dragging slider should NOT close panel');
    if (await slider.count() > 0) {
      const sliderBox = await slider.boundingBox();
      if (sliderBox) {
        await page.mouse.move(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(sliderBox.x + sliderBox.width / 2 + 50, sliderBox.y + sliderBox.height / 2);
        await page.mouse.up();
        await page.waitForTimeout(500);
        await expect(panel).toBeVisible();
        console.log('✅ Panel stayed open after dragging slider');
      }
    }
    
    // Test 3: Click a button inside the panel - panel should NOT close
    console.log('\n🧪 Test 3: Clicking button should NOT close panel');
    const resetButton = panel.locator('button').filter({ hasText: /reset/i }).first();
    if (await resetButton.count() > 0) {
      await resetButton.click();
      await page.waitForTimeout(500);
      await expect(panel).toBeVisible();
      console.log('✅ Panel stayed open after clicking button');
    }
    
    // Test 4: Drag the panel header - panel should NOT close
    console.log('\n🧪 Test 4: Dragging panel should NOT close panel');
    const dragHandle = panel.locator('div').filter({ hasText: /Customize.*Sticker/i }).first();
    if (await dragHandle.count() > 0) {
      const handleBox = await dragHandle.boundingBox();
      if (handleBox) {
        await page.mouse.move(handleBox.x + 50, handleBox.y + 10);
        await page.mouse.down();
        await page.mouse.move(handleBox.x + 100, handleBox.y + 50);
        await page.mouse.up();
        await page.waitForTimeout(500);
        await expect(panel).toBeVisible();
        console.log('✅ Panel stayed open after dragging');
      }
    }
    
    // Test 5: Press ESC key - panel SHOULD close
    console.log('\n🧪 Test 5: Pressing ESC should close panel');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(panel).not.toBeVisible();
    console.log('✅ Panel closed after pressing ESC');
    
    // Reopen panel for next tests
    await page.evaluate(() => {
      const storeState = JSON.parse(localStorage.getItem('minidisc-storage') || '{}');
      storeState.state.activeCustomizationPanel = {
        albumId: storeState.state.albums[0].id,
        stickerType: 'spine'
      };
      localStorage.setItem('minidisc-storage', JSON.stringify(storeState));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(panel).toBeVisible();
    console.log('✅ Panel reopened');
    
    // Test 6: Click outside panel - panel SHOULD close
    console.log('\n🧪 Test 6: Clicking outside should close panel');
    await page.mouse.click(50, 50); // Click in top-left corner (outside panel)
    await page.waitForTimeout(500);
    await expect(panel).not.toBeVisible();
    console.log('✅ Panel closed after clicking outside');
    
    // Reopen panel for close button test
    await page.evaluate(() => {
      const storeState = JSON.parse(localStorage.getItem('minidisc-storage') || '{}');
      storeState.state.activeCustomizationPanel = {
        albumId: storeState.state.albums[0].id,
        stickerType: 'spine'
      };
      localStorage.setItem('minidisc-storage', JSON.stringify(storeState));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await expect(panel).toBeVisible();
    console.log('✅ Panel reopened');
    
    // Test 7: Click close button - panel SHOULD close
    console.log('\n🧪 Test 7: Clicking X button should close panel');
    const closeButton = panel.locator('button').filter({ hasText: '×' }).first();
    if (await closeButton.count() > 0) {
      await closeButton.click();
      await page.waitForTimeout(500);
      await expect(panel).not.toBeVisible();
      console.log('✅ Panel closed after clicking X button');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/03-panel-closed.png', fullPage: true });
    console.log('📸 Screenshot: Panel closed');
    
    console.log('\n🎉 All tests passed!');
  });
});
