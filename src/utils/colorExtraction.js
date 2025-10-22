/**
 * Color Extraction Utility
 * Extracts dominant and secondary colors from album cover images
 */

import ColorThief from 'colorthief';

const colorThief = new ColorThief();

/**
 * Extract colors from image URL or base64
 * Returns dominant color + 2 secondary colors
 */
export async function extractColors(imageSource) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        // Get dominant color
        const dominant = colorThief.getColor(img);
        
        // Get palette (4 colors total: dominant + 3 additional)
        const palette = colorThief.getPalette(img, 4);
        
        // Convert RGB arrays to hex
        const dominantHex = rgbToHex(dominant);
        const secondaryHex = palette.slice(1, 3).map(rgb => rgbToHex(rgb));
        
        // Determine font color (black or white) based on dominant color brightness
        const fontColor = getBestFontColor(dominant);
        
        resolve({
          dominant: dominantHex,
          secondary: secondaryHex,
          fontColor: fontColor,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for color extraction'));
    };
    
    img.src = imageSource;
  });
}

/**
 * Convert RGB array to hex string
 */
function rgbToHex(rgb) {
  return '#' + rgb.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Calculate brightness of RGB color
 * Returns value between 0-255
 */
function getBrightness(rgb) {
  // Using perceived brightness formula
  return (0.299 * rgb[0]) + (0.587 * rgb[1]) + (0.114 * rgb[2]);
}

/**
 * Determine best font color (black or white) based on background
 */
function getBestFontColor(rgb) {
  const brightness = getBrightness(rgb);
  // If bright background, use dark text; if dark background, use light text
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

/**
 * Generate complementary color
 */
export function getComplementaryColor(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  
  // Calculate complementary
  const comp = [
    255 - rgb[0],
    255 - rgb[1],
    255 - rgb[2],
  ];
  
  return rgbToHex(comp);
}

/**
 * Convert hex to RGB array
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : null;
}

/**
 * Lighten a color by percentage
 */
export function lightenColor(hexColor, percent) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  
  const lighten = rgb.map(val => {
    const newVal = Math.round(val + (255 - val) * (percent / 100));
    return Math.min(255, newVal);
  });
  
  return rgbToHex(lighten);
}

/**
 * Darken a color by percentage
 */
export function darkenColor(hexColor, percent) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  
  const darken = rgb.map(val => {
    const newVal = Math.round(val * (1 - percent / 100));
    return Math.max(0, newVal);
  });
  
  return rgbToHex(darken);
}

/**
 * Validate if color extraction is possible
 */
export function canExtractColors(imageSource) {
  if (!imageSource) return false;
  if (typeof imageSource !== 'string') return false;
  if (imageSource.startsWith('data:image')) return true;
  if (imageSource.startsWith('http')) return true;
  return false;
}

export default {
  extractColors,
  getComplementaryColor,
  lightenColor,
  darkenColor,
  canExtractColors,
};
