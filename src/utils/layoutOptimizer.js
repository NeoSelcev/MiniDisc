/**
 * Advanced Layout Optimization Algorithm
 * Implements skyline bin-packing with rotation support for maximum space efficiency
 */

/**
 * Represents a free rectangle in the packing space
 */
class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  canFit(itemWidth, itemHeight) {
    return this.width >= itemWidth && this.height >= itemHeight;
  }
}

/**
 * Calculate printable area dimensions
 */
function getPrintableArea(settings) {
  const { paper, print } = settings;
  return {
    width: paper.width - print.margins.left - print.margins.right,
    height: paper.height - print.margins.top - print.margins.bottom,
    offsetX: print.margins.left,
    offsetY: print.margins.top,
  };
}

/**
 * Calculate maximum capacity for sticker sets
 * Now based on actual fitting attempts for accuracy
 */
export function calculateMaxCapacity(settings) {
  // Try fitting increasing numbers of dummy albums until we fail
  let capacity = 1;
  const maxAttempts = 20; // Don't try more than 20 sets
  
  for (let testCount = 1; testCount <= maxAttempts; testCount++) {
    // Create dummy albums for testing
    const dummyAlbums = Array.from({ length: testCount }, (_, i) => ({
      id: `test-${i}`,
      albumName: 'Test Album',
      artistName: 'Test Artist',
      year: 2025,
      coverImage: null,
      tracks: [],
      colors: { dominant: '#e0e0e0', fontColor: '#000' },
    }));
    
    // Try to fit them
    const layout = calculateLayout(dummyAlbums, settings);
    
    if (layout.fits) {
      capacity = testCount;
    } else {
      // Stop when we can't fit anymore
      break;
    }
  }
  
  return capacity;
}

/**
 * Calculate optimal layout for sticker sets using advanced bin-packing
 * Stickers can be rotated and placed independently for maximum efficiency
 * Returns positioned stickers or overflow indication
 */
export function calculateLayout(albums, settings) {
  const { dimensions, layout } = settings;
  const printable = getPrintableArea(settings);
  const spacing = layout.elementSpacing;
  const allowRotation = layout.allowRotation;
  
  // Collect all stickers from all albums
  const allStickers = [];
  for (const album of albums) {
    allStickers.push(...createStickersForAlbum(album, dimensions));
  }
  
  // Sort stickers by area (largest first) for better packing efficiency
  allStickers.sort((a, b) => (b.width * b.height) - (a.width * a.height));
  
  // Initialize free rectangles with the entire printable area
  const freeRectangles = [
    new Rectangle(0, 0, printable.width, printable.height)
  ];
  
  const placedStickers = [];
  const failedStickers = [];
  
  // Try to place each sticker
  for (const sticker of allStickers) {
    let placed = false;
    let bestFit = null;
    
    // Try to find the best position (with and without rotation)
    const rotations = allowRotation ? [0, 90] : [0];
    
    for (const rotation of rotations) {
      const rotatedWidth = rotation === 90 ? sticker.height : sticker.width;
      const rotatedHeight = rotation === 90 ? sticker.width : sticker.height;
      
      // Find the best free rectangle (smallest fitting rectangle = tightest fit)
      for (let i = 0; i < freeRectangles.length; i++) {
        const rect = freeRectangles[i];
        
        // Check if sticker + spacing fits in the rectangle
        if (rect.canFit(rotatedWidth + spacing, rotatedHeight + spacing)) {
          // Calculate waste (how much space is left)
          const waste = (rect.width * rect.height) - (rotatedWidth * rotatedHeight);
          
          if (!bestFit || waste < bestFit.waste) {
            bestFit = {
              rectIndex: i,
              rect: rect,
              rotation: rotation,
              width: rotatedWidth,
              height: rotatedHeight,
              waste: waste,
            };
          }
        }
      }
    }
    
    if (bestFit) {
      // Place the sticker at the rectangle position (no spacing offset)
      const rect = bestFit.rect;
      
      placedStickers.push({
        ...sticker,
        x: printable.offsetX + rect.x,
        y: printable.offsetY + rect.y,
        width: bestFit.width,
        height: bestFit.height,
        rotation: bestFit.rotation,
        originalWidth: sticker.width,
        originalHeight: sticker.height,
      });
      
      // Split the used rectangle into smaller free rectangles
      // Reserve the space for: sticker dimensions + spacing buffer
      const usedWidth = bestFit.width + spacing;
      const usedHeight = bestFit.height + spacing;
      
      const newRects = [];
      
      // Right remainder
      if (rect.width > usedWidth) {
        newRects.push(new Rectangle(
          rect.x + usedWidth,
          rect.y,
          rect.width - usedWidth,
          rect.height
        ));
      }
      
      // Bottom remainder
      if (rect.height > usedHeight) {
        newRects.push(new Rectangle(
          rect.x,
          rect.y + usedHeight,
          rect.width,
          rect.height - usedHeight
        ));
      }
      
      // Remove the used rectangle and add new ones
      freeRectangles.splice(bestFit.rectIndex, 1);
      freeRectangles.push(...newRects);
      
      // Clean up overlapping rectangles (keep the largest non-overlapping ones)
      pruneOverlappingRectangles(freeRectangles);
      
      placed = true;
    }
    
    if (!placed) {
      failedStickers.push(sticker);
    }
  }
  
  // Validate no overlaps (for debugging)
  validateNoOverlaps(placedStickers, spacing);
  
  return {
    stickers: placedStickers,
    fits: failedStickers.length === 0,
    capacity: albums.length,
    failedCount: failedStickers.length,
    totalStickers: allStickers.length,
    placedCount: placedStickers.length,
  };
}

/**
 * Validate that no stickers overlap
 */
function validateNoOverlaps(stickers, minSpacing) {
  for (let i = 0; i < stickers.length; i++) {
    for (let j = i + 1; j < stickers.length; j++) {
      const s1 = stickers[i];
      const s2 = stickers[j];
      
      // Check if rectangles overlap (with spacing tolerance)
      const overlap = !(
        s1.x + s1.width + minSpacing / 2 <= s2.x ||
        s2.x + s2.width + minSpacing / 2 <= s1.x ||
        s1.y + s1.height + minSpacing / 2 <= s2.y ||
        s2.y + s2.height + minSpacing / 2 <= s1.y
      );
      
      if (overlap) {
        console.error('❌ OVERLAP DETECTED!', {
          sticker1: { id: s1.id, type: s1.type, x: s1.x, y: s1.y, w: s1.width, h: s1.height },
          sticker2: { id: s2.id, type: s2.type, x: s2.x, y: s2.y, w: s2.width, h: s2.height },
          minSpacing,
        });
      }
    }
  }
}

/**
 * Remove overlapping free rectangles to keep the list clean
 */
function pruneOverlappingRectangles(rectangles) {
  for (let i = 0; i < rectangles.length; i++) {
    for (let j = i + 1; j < rectangles.length; j++) {
      const r1 = rectangles[i];
      const r2 = rectangles[j];
      
      // Check if r1 is completely inside r2
      if (r1.x >= r2.x && r1.y >= r2.y &&
          r1.x + r1.width <= r2.x + r2.width &&
          r1.y + r1.height <= r2.y + r2.height) {
        rectangles.splice(i, 1);
        i--;
        break;
      }
      
      // Check if r2 is completely inside r1
      if (r2.x >= r1.x && r2.y >= r1.y &&
          r2.x + r2.width <= r1.x + r1.width &&
          r2.y + r2.height <= r1.y + r1.height) {
        rectangles.splice(j, 1);
        j--;
      }
    }
  }
}

/**
 * Create sticker objects for an album
 * Each album has 4 stickers:
 * 1. Spine (disc edge) - 58mm × 3mm
 * 2. Disc face - 36mm × 53mm  
 * 3. Front cover (combined A+B with fold) - 68mm × 68mm (65mm + 3mm fold)
 * 4. Back cover (track list) - 68mm × 58mm
 */
function createStickersForAlbum(album, dimensions) {
  // Calculate combined front cover dimensions (Part A + Part B folded together)
  const frontCoverWidth = dimensions.holderFrontPartA.width; // 68mm
  const frontCoverHeight = dimensions.holderFrontPartA.height + dimensions.holderFrontPartB.height; // 65mm + 3mm = 68mm
  
  return [
    {
      id: `${album.id}-spine`,
      albumId: album.id,
      type: 'spine',
      label: 'Disc Edge (Spine)',
      width: dimensions.edgeSticker.width,
      height: dimensions.edgeSticker.height,
      data: album,
    },
    {
      id: `${album.id}-face`,
      albumId: album.id,
      type: 'face',
      label: 'Disc Face',
      width: dimensions.discFace.width,
      height: dimensions.discFace.height,
      data: album,
    },
    {
      id: `${album.id}-front`,
      albumId: album.id,
      type: 'front',
      label: 'Front Cover (with fold)',
      width: frontCoverWidth,
      height: frontCoverHeight,
      data: album,
      // Include both parts for rendering
      parts: {
        partA: {
          width: dimensions.holderFrontPartA.width,
          height: dimensions.holderFrontPartA.height,
        },
        partB: {
          width: dimensions.holderFrontPartB.width,
          height: dimensions.holderFrontPartB.height,
        },
      },
    },
    {
      id: `${album.id}-back`,
      albumId: album.id,
      type: 'back',
      label: 'Track List (Inner)',
      width: dimensions.holderBack.width,
      height: dimensions.holderBack.height,
      data: album,
    },
  ];
}

/**
 * Validate if new album can be added
 */
export function canAddAlbum(currentAlbums, settings) {
  const maxCapacity = calculateMaxCapacity(settings);
  return currentAlbums.length < maxCapacity;
}

/**
 * Get layout statistics
 */
export function getLayoutStats(albums, settings) {
  const layout = calculateLayout(albums, settings);
  const printable = getPrintableArea(settings);
  
  const printableArea = printable.width * printable.height;
  
  const usedArea = layout.stickers.reduce(
    (sum, s) => sum + s.width * s.height,
    0
  );
  
  return {
    currentSets: albums.length,
    maxCapacity: calculateMaxCapacity(settings),
    efficiency: printableArea > 0 ? (usedArea / printableArea) * 100 : 0,
    fitsOnPage: layout.fits,
    placedStickers: layout.placedCount,
    totalStickers: layout.totalStickers,
    failedStickers: layout.failedCount,
  };
}
