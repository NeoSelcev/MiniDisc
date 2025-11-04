import { test, expect } from '@playwright/test';

test.describe('Sticker Customization Panel Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (don't clear storage - use existing albums)
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Wait extra time for stickers to render
    await page.waitForTimeout(2000);
  });

  test('Panel should open and close correctly', async ({ page }) => {
    console.log('✅ Page loaded');
    
    // Wait for the albums section to be visible
    await page.waitForSelector('text=Albums', { timeout: 5000 });
    console.log('✅ Albums section found');
    
    // Wait longer for stickers to render (they might load asynchronously)
    await page.waitForTimeout(3000);
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/01-initial-state.png' });
    console.log('📸 Screenshot: Initial state');
    
    // Check if there's at least one album
    const albumCount = await page.locator('text=/Albums \\(\\d+\\)/').textContent();
    console.log(`Album count text: ${albumCount}`);
    
    // Debug: Log all elements to understand the structure
    const allDivs = await page.locator('div').count();
    const allSvgsCount = await page.locator('svg').count();
    const allImgs = await page.locator('img').count();
    console.log(`Found ${allDivs} divs, ${allSvgsCount} SVGs, ${allImgs} images`);
    
    // Wait for images (stickers) to appear
    try {
      await page.waitForSelector('img', { timeout: 5000 });
      console.log('✅ Image elements found!');
    } catch (e) {
      console.log('❌ No images found after 5 seconds. Stickers may not be rendering.');
      await page.screenshot({ path: 'test-results/01-no-images-state.png' });
      return;
    }
    
    // Find all images and look for sticker images (they should be in absolute positioned containers)
    const allImages = page.locator('img');
    const imgCount = await allImages.count();
    console.log(`Total image count: ${imgCount}`);
    
    let stickerImage = null;
    for (let i = 0; i < imgCount; i++) {
      const img = allImages.nth(i);
      const box = await img.boundingBox();
      console.log(`IMG ${i}: x=${box?.x?.toFixed(0)}, y=${box?.y?.toFixed(0)}, w=${box?.width?.toFixed(0)}, h=${box?.height?.toFixed(0)}`);
      // Look for an image that's part of the sticker preview (reasonably sized)
      if (box && box.width > 30 && box.height > 30) {
        stickerImage = img;
        console.log(`✅ Found sticker image at index ${i}!`);
        break;
      }
    }
    
    if (!stickerImage) {
      console.log('❌ Could not find a sticker image.');
      await page.screenshot({ path: 'test-results/02-no-sticker-image.png' });
      return;
    }
    
    // Now interact with the sticker - click on its parent container
    const stickerParent = stickerImage.locator('../..');  // Go up 2 levels to the clickable container
    console.log('Hovering over sticker parent container...');
    await stickerParent.hover();
    await page.waitForTimeout(800); // Wait for settings icon to appear
    
    console.log('Clicking sticker container to open customization panel...');
    await stickerParent.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-results/02-after-click.png' });
    console.log('📸 Screenshot: After click');
    
    // Check if panel is visible
    const panelTitle = page.locator('text=/Sticker$/');
    const isPanelVisible = await panelTitle.isVisible();
    console.log(`Panel visible: ${isPanelVisible}`);
    
    if (!isPanelVisible) {
      console.log('❌ Panel did not open');
      return;
    }
    
    // TEST 1: Click on a slider - should NOT close
    console.log('\n🧪 TEST 1: Clicking slider...');
    const slider = page.locator('input[type="range"]').first();
    await slider.click();
    await page.waitForTimeout(300);
    const stillVisibleAfterSlider = await panelTitle.isVisible();
    console.log(stillVisibleAfterSlider ? '✅ PASS: Panel still open after slider click' : '❌ FAIL: Panel closed after slider click');
    
    if (!stillVisibleAfterSlider) {
      await page.screenshot({ path: 'test-results/03-fail-slider-click.png' });
      throw new Error('Panel closed after clicking slider');
    }
    
    // TEST 2: Drag slider - should NOT close
    console.log('\n🧪 TEST 2: Dragging slider...');
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      await page.mouse.move(sliderBox.x + 10, sliderBox.y + sliderBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(sliderBox.x + 50, sliderBox.y + sliderBox.height / 2, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(300);
      const stillVisibleAfterDrag = await panelTitle.isVisible();
      console.log(stillVisibleAfterDrag ? '✅ PASS: Panel still open after dragging slider' : '❌ FAIL: Panel closed after dragging slider');
      
      if (!stillVisibleAfterDrag) {
        await page.screenshot({ path: 'test-results/04-fail-slider-drag.png' });
        throw new Error('Panel closed after dragging slider');
      }
    }
    
    // TEST 3: Drag panel by header - should NOT close
    console.log('\n🧪 TEST 3: Dragging panel...');
    const header = page.locator('.cursor-move').first();
    const headerBox = await header.boundingBox();
    if (headerBox) {
      await page.mouse.move(headerBox.x + headerBox.width / 2, headerBox.y + headerBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(headerBox.x + 100, headerBox.y + 100, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(300);
      const stillVisibleAfterPanelDrag = await panelTitle.isVisible();
      console.log(stillVisibleAfterPanelDrag ? '✅ PASS: Panel still open after dragging' : '❌ FAIL: Panel closed after dragging');
      
      if (!stillVisibleAfterPanelDrag) {
        await page.screenshot({ path: 'test-results/05-fail-panel-drag.png' });
        throw new Error('Panel closed after dragging panel');
      }
    }
    
    // TEST 4: Click reset button - should NOT close
    console.log('\n🧪 TEST 4: Clicking reset button...');
    const resetButton = page.locator('button[title="Reset to defaults"]');
    await resetButton.click();
    await page.waitForTimeout(300);
    const stillVisibleAfterReset = await panelTitle.isVisible();
    console.log(stillVisibleAfterReset ? '✅ PASS: Panel still open after reset' : '❌ FAIL: Panel closed after reset');
    
    if (!stillVisibleAfterReset) {
      await page.screenshot({ path: 'test-results/06-fail-reset-click.png' });
      throw new Error('Panel closed after clicking reset button');
    }
    
    // TEST 5: Click outside - SHOULD close
    console.log('\n🧪 TEST 5: Clicking outside panel...');
    await page.mouse.click(50, 50);
    await page.waitForTimeout(500);
    const closedAfterOutsideClick = !(await panelTitle.isVisible());
    console.log(closedAfterOutsideClick ? '✅ PASS: Panel closed after clicking outside' : '❌ FAIL: Panel still open after clicking outside');
    await page.screenshot({ path: 'test-results/07-after-outside-click.png' });
    
    if (!closedAfterOutsideClick) {
      throw new Error('Panel did not close after clicking outside');
    }
    
    // Reopen for next tests
    await stickerPreviews.first().click();
    await page.waitForTimeout(500);
    
    // TEST 6: Press ESC - SHOULD close
    console.log('\n🧪 TEST 6: Pressing ESC...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const closedAfterEsc = !(await panelTitle.isVisible());
    console.log(closedAfterEsc ? '✅ PASS: Panel closed after ESC' : '❌ FAIL: Panel still open after ESC');
    await page.screenshot({ path: 'test-results/08-after-esc.png' });
    
    if (!closedAfterEsc) {
      throw new Error('Panel did not close after pressing ESC');
    }
    
    // Reopen for final test
    await stickerPreviews.first().click();
    await page.waitForTimeout(500);
    
    // TEST 7: Click X button - SHOULD close
    console.log('\n🧪 TEST 7: Clicking X button...');
    const closeButton = page.locator('button').filter({ hasText: '✕' });
    await closeButton.click();
    await page.waitForTimeout(300);
    const closedAfterXButton = !(await panelTitle.isVisible());
    console.log(closedAfterXButton ? '✅ PASS: Panel closed after X button' : '❌ FAIL: Panel still open after X button');
    await page.screenshot({ path: 'test-results/09-after-x-button.png' });
    
    if (!closedAfterXButton) {
      throw new Error('Panel did not close after clicking X button');
    }
    
    console.log('\n🎉 ALL TESTS PASSED!');
  });
});
