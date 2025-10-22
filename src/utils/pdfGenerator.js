/**
 * PDF Generation Utility
 * Generates print-ready PDFs with stickers and cut lines
 */

import { jsPDF } from 'jspdf';

const MM_TO_PT = 2.83465; // Convert millimeters to points (72 DPI)

/**
 * Generate PDF from layout
 */
export async function generatePDF(albums, settings, layout) {
  const { paper, print, dimensions } = settings;
  
  // Create PDF (A4 size)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Set properties
  pdf.setProperties({
    title: 'MiniDisc Stickers',
    subject: 'Custom MiniDisc sticker sheet',
    author: 'MiniDisc Sticker Printer',
    keywords: 'minidisc, stickers, album',
    creator: 'MiniDisc Sticker Printer',
  });
  
  // Draw each sticker
  for (const sticker of layout.stickers) {
    await drawSticker(pdf, sticker, settings);
  }
  
  // Draw cut lines
  if (print.cutLines.enabled) {
    drawCutLines(pdf, layout.stickers, settings);
  }
  
  // Draw margins (for reference, optional)
  if (print.bleedMarks) {
    drawMargins(pdf, settings);
  }
  
  return pdf;
}

/**
 * Draw a single sticker
 */
async function drawSticker(pdf, sticker, settings) {
  const { x, y, width, height, type, data } = sticker;
  
  switch (type) {
    case 'spine':
      drawSpineSticker(pdf, x, y, width, height, data, settings, sticker);
      break;
    case 'face':
      await drawFaceSticker(pdf, x, y, width, height, data, settings);
      break;
    case 'front':
      await drawFrontSticker(pdf, x, y, width, height, data, settings, sticker);
      break;
    case 'back':
      drawBackSticker(pdf, x, y, width, height, data, settings);
      break;
    // Legacy support
    case 'frontFolded':
    case 'frontA':
      await drawFrontSticker(pdf, x, y, width, height, data, settings, sticker);
      break;
  }
}

/**
 * Draw spine sticker (edge)
 */
function drawSpineSticker(pdf, x, y, width, height, data, settings, sticker) {
  const { dominant } = data.colors || {};
  const fontSettings = settings.design?.fontSizes || {};
  const fontStyles = settings.design?.fontStyles?.spine || {};
  
  // Background with dominant color
  pdf.setFillColor(dominant || '#e0e0e0');
  pdf.rect(x, y, width, height, 'F');
  
  // Blue border (2pt = ~0.7mm)
  pdf.setDrawColor(0, 0, 255); // Blue
  pdf.setLineWidth(0.5);
  pdf.rect(x, y, width, height, 'S');
  
  // Text
  const fontSize = fontSettings.spine || 8;
  pdf.setFontSize(fontSize);
  pdf.setTextColor(data.colors?.fontColor || '#000000');
  
  // Apply font styles
  if (fontStyles.bold && fontStyles.italic) {
    pdf.setFont(undefined, 'bolditalic');
  } else if (fontStyles.bold) {
    pdf.setFont(undefined, 'bold');
  } else if (fontStyles.italic) {
    pdf.setFont(undefined, 'italic');
  } else {
    pdf.setFont(undefined, 'normal');
  }
  
  // Album name
  const albumText = truncateText(data.albumName, width - 2);
  pdf.text(albumText, x + width / 2, y + height / 2, {
    align: 'center',
    baseline: 'middle',
  });
  
  // Reset font
  pdf.setFont(undefined, 'normal');
}

/**
 * Draw face sticker (disc)
 */
async function drawFaceSticker(pdf, x, y, width, height, data, settings) {
  // If album cover exists, draw it (do not stretch - use 'FAST' compression)
  if (data.coverImage) {
    try {
      pdf.addImage(data.coverImage, 'JPEG', x, y, width, height, undefined, 'FAST');
    } catch (error) {
      console.error('Failed to add disc face image:', error);
      drawPlaceholder(pdf, x, y, width, height, 'Disc Face');
    }
  } else {
    drawPlaceholder(pdf, x, y, width, height, 'Disc Face');
  }
}

/**
 * Draw front sticker (combined cover with fold)
 */
async function drawFrontSticker(pdf, x, y, width, height, data, settings, sticker) {
  const { dimensions } = settings;
  const partAHeight = sticker.parts?.partA?.height || dimensions.holderFrontPartA.height;
  const partBHeight = sticker.parts?.partB?.height || dimensions.holderFrontPartB.height;
  
  // Part A - Album cover
  if (data.coverImage) {
    try {
      // Maintain aspect ratio - do not stretch
      pdf.addImage(data.coverImage, 'JPEG', x, y, width, partAHeight, undefined, 'FAST');
    } catch (error) {
      console.error('Failed to add cover image:', error);
      drawPlaceholder(pdf, x, y, width, partAHeight, 'Front Cover');
    }
  } else {
    drawPlaceholder(pdf, x, y, width, partAHeight, 'Front Cover');
  }
  
  // Part B - Spine/fold text
  const partBY = y + partAHeight;
  const { dominant } = data.colors || {};
  
  pdf.setFillColor(dominant || '#e0e0e0');
  pdf.rect(x, partBY, width, partBHeight, 'F');
  
  const fontSize = settings.design?.fontSizes?.spine || 8;
  const fontStyles = settings.design?.fontStyles?.spine || {};
  
  pdf.setFontSize(fontSize);
  pdf.setTextColor(data.colors?.fontColor || '#000000');
  
  // Apply font styles
  if (fontStyles.bold && fontStyles.italic) {
    pdf.setFont(undefined, 'bolditalic');
  } else if (fontStyles.bold) {
    pdf.setFont(undefined, 'bold');
  } else if (fontStyles.italic) {
    pdf.setFont(undefined, 'italic');
  } else {
    pdf.setFont(undefined, 'normal');
  }
  
  const text = `${data.albumName} - ${data.artistName}`;
  const truncated = truncateText(text, width - 2);
  pdf.text(truncated, x + width / 2, partBY + partBHeight / 2, {
    align: 'center',
    baseline: 'middle',
  });
  
  // Reset font
  pdf.setFont(undefined, 'normal');
  
  // Fold line
  pdf.setDrawColor(150, 150, 150);
  pdf.setLineDash([2, 2]);
  pdf.setLineWidth(0.3);
  pdf.line(x, partBY, x + width, partBY);
  pdf.setLineDash([]);
}

/**
 * Draw back sticker with track list
 */
/**
 * Draw back sticker (track list)
 */
function drawBackSticker(pdf, x, y, width, height, data, settings) {
  const fontSizes = settings.design?.fontSizes || {};
  const fontStyles = settings.design?.fontStyles || {};
  const lineHeights = settings.design?.lineHeights || {};
  
  // Background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, width, height, 'F');
  
  // Border
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.2);
  pdf.rect(x, y, width, height, 'S');
  
  const padding = 2;
  let currentY = y + padding;
  
  // Helper to apply font styles
  const applyFontStyle = (styleKey) => {
    const style = fontStyles[styleKey] || {};
    if (style.bold && style.italic) {
      pdf.setFont(undefined, 'bolditalic');
    } else if (style.bold) {
      pdf.setFont(undefined, 'bold');
    } else if (style.italic) {
      pdf.setFont(undefined, 'italic');
    } else {
      pdf.setFont(undefined, 'normal');
    }
  };
  
  // Album title
  const titleSize = fontSizes.holderBackTitle || 14;
  const titleLineHeight = lineHeights.holderBackTitle || 4;
  pdf.setFontSize(titleSize);
  applyFontStyle('holderBackTitle');
  pdf.setTextColor(0, 0, 0);
  pdf.text(truncateText(data.albumName, width - 2 * padding), x + padding, currentY + titleSize * 0.35);
  currentY += titleLineHeight;
  
  // Artist
  const artistSize = fontSizes.holderBackArtist || 10;
  const artistLineHeight = lineHeights.holderBackArtist || 3;
  pdf.setFontSize(artistSize);
  applyFontStyle('holderBackArtist');
  pdf.text(truncateText(data.artistName, width - 2 * padding), x + padding, currentY + artistSize * 0.35);
  currentY += artistLineHeight;
  
  // Year
  const yearSize = fontSizes.holderBackYear || 9;
  const yearLineHeight = lineHeights.holderBackYear || 2.5;
  pdf.setFontSize(yearSize);
  applyFontStyle('holderBackYear');
  pdf.text(`${data.year || 'N/A'}`, x + padding, currentY + yearSize * 0.35);
  currentY += yearLineHeight + 2;
  
  // Track list
  const trackSize = fontSizes.trackList || 8;
  const trackLineHeight = lineHeights.trackList || 2.5;
  pdf.setFontSize(trackSize);
  applyFontStyle('trackList');
  
  const availableHeight = height - (currentY - y) - padding;
  const maxTracks = Math.floor(availableHeight / trackLineHeight);
  
  const tracksToShow = data.tracks?.slice(0, maxTracks) || [];
  
  for (const track of tracksToShow) {
    if (currentY + trackLineHeight > y + height - padding) break;
    
    const duration = formatDuration(track.duration);
    const trackText = `${track.number}. ${track.name}`;
    const truncated = truncateText(trackText, width - padding - 15);
    
    pdf.text(truncated, x + padding, currentY + trackSize * 0.35);
    pdf.text(duration, x + width - padding - 10, currentY + trackSize * 0.35);
    
    currentY += trackLineHeight;
  }
  
  // If more tracks than can fit
  if (data.tracks && data.tracks.length > maxTracks) {
    const remaining = data.tracks.length - maxTracks;
    pdf.setFont(undefined, 'italic');
    pdf.setFontSize(trackSize * 0.9);
    pdf.text(`... and ${remaining} more`, x + padding, currentY + trackSize * 0.35);
  }
  
  // Reset font
  pdf.setFont(undefined, 'normal');
}

/**
 * Draw cut lines around stickers
 */
function drawCutLines(pdf, stickers, settings) {
  const { cutLines } = settings.print;
  
  pdf.setDrawColor(cutLines.color || '#000000');
  pdf.setLineWidth(cutLines.width || 0.5);
  
  if (cutLines.style === 'dashed') {
    pdf.setLineDash([2, 2]);
  } else if (cutLines.style === 'dotted') {
    pdf.setLineDash([0.5, 1.5]);
  }
  
  for (const sticker of stickers) {
    pdf.rect(sticker.x, sticker.y, sticker.width, sticker.height, 'S');
  }
  
  pdf.setLineDash([]);
}

/**
 * Draw margin guides
 */
function drawMargins(pdf, settings) {
  const { margins } = settings.print;
  const { width, height } = settings.paper;
  
  pdf.setDrawColor(255, 0, 0);
  pdf.setLineWidth(0.2);
  pdf.setLineDash([1, 1]);
  
  // Draw margin rectangle
  pdf.rect(
    margins.left,
    margins.top,
    width - margins.left - margins.right,
    height - margins.top - margins.bottom,
    'S'
  );
  
  pdf.setLineDash([]);
}

/**
 * Draw placeholder for missing images
 */
function drawPlaceholder(pdf, x, y, width, height, label) {
  pdf.setFillColor(240, 240, 240);
  pdf.rect(x, y, width, height, 'F');
  
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(x, y, width, height, 'S');
  
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(label, x + width / 2, y + height / 2, {
    align: 'center',
    baseline: 'middle',
  });
}

/**
 * Format duration from seconds to M:SS
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Truncate text to fit width
 */
function truncateText(text, maxWidth) {
  // Simple truncation - in production, use proper text measurement
  const maxChars = Math.floor(maxWidth / 2); // Rough estimate
  if (text.length > maxChars) {
    return text.substring(0, maxChars - 3) + '...';
  }
  return text;
}

/**
 * Save PDF
 */
export function savePDF(pdf, filename = 'minidisc-stickers.pdf') {
  pdf.save(filename);
}

/**
 * Get PDF as blob
 */
export function getPDFBlob(pdf) {
  return pdf.output('blob');
}

export default {
  generatePDF,
  savePDF,
  getPDFBlob,
};
