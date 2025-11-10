import React from 'react';

// Shared font family options
export const FONT_OPTIONS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS'
];

/**
 * Font Family Select Component
 * @param {string} value - Current font family value
 * @param {function} onChange - Callback when font family changes
 * @param {string} className - Additional CSS classes
 * @param {string} label - Optional label text (default: "Font Family")
 * @param {boolean} showGlobalLabel - Show "(global)" indicator
 */
export const FontFamilySelect = ({ 
  value, 
  onChange, 
  className = '', 
  label = 'Font Family',
  showGlobalLabel = false 
}) => {
  return (
    <div>
      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
        {label} {showGlobalLabel && <span className="text-xs opacity-60">(global)</span>}
      </label>
      <select
        value={value || 'Arial'}
        onChange={onChange}
        className={`w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-xs ${className}`}
        style={{ fontFamily: value || 'Arial' }}
      >
        {FONT_OPTIONS.map(font => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Font Style Checkboxes Component (Bold/Italic/Underline)
 * @param {boolean} bold - Bold checkbox state
 * @param {boolean} italic - Italic checkbox state
 * @param {boolean} underline - Underline checkbox state
 * @param {function} onBoldChange - Callback when bold changes
 * @param {function} onItalicChange - Callback when italic changes
 * @param {function} onUnderlineChange - Callback when underline changes
 * @param {string} label - Optional label text (default: "Font Style")
 * @param {boolean} showGlobalLabel - Show "(global)" indicator
 */
export const FontStyleCheckboxes = ({ 
  bold, 
  italic, 
  underline, 
  onBoldChange, 
  onItalicChange, 
  onUnderlineChange,
  label = 'Font Style',
  showGlobalLabel = false
}) => {
  return (
    <div>
      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
        {label} {showGlobalLabel && <span className="text-xs opacity-60">(global)</span>}
      </label>
      <div className="flex items-center gap-3">
        <label className="flex items-center cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={bold || false}
            onChange={onBoldChange}
            className="mr-1"
          />
          <span className="font-bold">B</span>
        </label>
        <label className="flex items-center cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={italic || false}
            onChange={onItalicChange}
            className="mr-1"
          />
          <span className="italic">I</span>
        </label>
        <label className="flex items-center cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={underline || false}
            onChange={onUnderlineChange}
            className="mr-1"
          />
          <span className="underline">U</span>
        </label>
      </div>
    </div>
  );
};

/**
 * Font Size Input Component
 * @param {number} value - Current font size value
 * @param {function} onChange - Callback when font size changes
 * @param {string} label - Optional label text (default: "Font Size (pt)")
 * @param {number} min - Minimum value (default: 4)
 * @param {number} max - Maximum value (default: 72)
 * @param {number} step - Step increment (default: 0.5)
 * @param {string} className - Additional CSS classes
 */
export const FontSizeInput = ({ 
  value, 
  onChange, 
  label = 'Font Size (pt)',
  min = 4,
  max = 72,
  step = 0.5,
  className = ''
}) => {
  return (
    <div>
      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
        {label}
      </label>
      <input
        type="number"
        value={value || 8}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className={`w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-xs ${className}`}
      />
    </div>
  );
};

/**
 * Line Height Slider Component
 * @param {number} value - Current line height value
 * @param {function} onChange - Callback when line height changes
 * @param {string} label - Optional label prefix (default: "Line Height")
 * @param {number} min - Minimum value (default: 0.8)
 * @param {number} max - Maximum value (default: 2)
 * @param {number} step - Step increment (default: 0.1)
 * @param {boolean} showValue - Show current value in label (default: true)
 * @param {boolean} showGlobalLabel - Show "(global)" indicator
 */
export const LineHeightSlider = ({ 
  value, 
  onChange, 
  label = 'Line Height',
  min = 0.8,
  max = 2,
  step = 0.1,
  showValue = true,
  showGlobalLabel = false
}) => {
  const displayValue = value || 1.2;
  return (
    <div>
      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
        {label}: {showValue && <strong>{displayValue}</strong>}
        {showGlobalLabel && <span className="text-xs opacity-60"> (global)</span>}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={onChange}
        className="w-full"
      />
    </div>
  );
};

/**
 * Letter Spacing Slider Component
 * @param {number} value - Current letter spacing value
 * @param {function} onChange - Callback when letter spacing changes
 * @param {string} label - Optional label prefix (default: "Letter Spacing")
 * @param {number} min - Minimum value (default: 0)
 * @param {number} max - Maximum value (default: 0.2)
 * @param {number} step - Step increment (default: 0.01)
 * @param {boolean} showValue - Show current value in label (default: true)
 * @param {boolean} showGlobalLabel - Show "(global)" indicator
 */
export const LetterSpacingSlider = ({ 
  value, 
  onChange, 
  label = 'Letter Spacing',
  min = 0,
  max = 0.2,
  step = 0.01,
  showValue = true,
  showGlobalLabel = false
}) => {
  const displayValue = value || 0;
  return (
    <div>
      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
        {label}: {showValue && <strong>{displayValue}</strong>}
        {showGlobalLabel && <span className="text-xs opacity-60"> (global)</span>}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={onChange}
        className="w-full"
      />
    </div>
  );
};

/**
 * Combined Line Height + Letter Spacing Grid Component
 * Useful for displaying both sliders side-by-side in a 2-column grid
 */
export const LineHeightLetterSpacingGrid = ({
  lineHeightValue,
  lineHeightOnChange,
  lineHeightMin = 0.8,
  lineHeightMax = 2,
  lineHeightLabel = 'Line Height',
  letterSpacingValue,
  letterSpacingOnChange,
  letterSpacingMin = 0,
  letterSpacingMax = 0.2,
  letterSpacingLabel = 'Letter Spacing',
  showGlobalLabel = false
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <LineHeightSlider
        value={lineHeightValue}
        onChange={lineHeightOnChange}
        label={lineHeightLabel}
        min={lineHeightMin}
        max={lineHeightMax}
        showGlobalLabel={showGlobalLabel}
      />
      <LetterSpacingSlider
        value={letterSpacingValue}
        onChange={letterSpacingOnChange}
        label={letterSpacingLabel}
        min={letterSpacingMin}
        max={letterSpacingMax}
        showGlobalLabel={showGlobalLabel}
      />
    </div>
  );
};

/**
 * Complete Typography Controls Group
 * All typography controls in one component for consistent layout
 * @param {object} values - Object containing all typography values
 * @param {object} handlers - Object containing all change handlers
 * @param {object} config - Configuration options
 */
export const TypographyControlsGroup = ({
  values = {},
  handlers = {},
  config = {}
}) => {
  const {
    fontSize = 8,
    fontFamily = 'Arial',
    fontBold = false,
    fontItalic = false,
    fontUnderline = false,
    lineHeight = 1.2,
    letterSpacing = 0
  } = values;

  const {
    onFontSizeChange,
    onFontFamilyChange,
    onBoldChange,
    onItalicChange,
    onUnderlineChange,
    onLineHeightChange,
    onLetterSpacingChange
  } = handlers;

  const {
    showGlobalLabels = false,
    fontSizeLabel = 'Font Size (pt)',
    fontFamilyLabel = 'Font Family',
    fontStyleLabel = 'Font Style',
    lineHeightLabel = 'Line Height',
    letterSpacingLabel = 'Letter Spacing',
    includeLineHeight = true,
    includeLetterSpacing = true
  } = config;

  return (
    <div className="space-y-3">
      {/* Font Size */}
      <FontSizeInput
        value={fontSize}
        onChange={onFontSizeChange}
        label={fontSizeLabel}
      />

      {/* Font Family */}
      <FontFamilySelect
        value={fontFamily}
        onChange={onFontFamilyChange}
        label={fontFamilyLabel}
        showGlobalLabel={showGlobalLabels}
      />

      {/* Font Style (B/I/U) */}
      <FontStyleCheckboxes
        bold={fontBold}
        italic={fontItalic}
        underline={fontUnderline}
        onBoldChange={onBoldChange}
        onItalicChange={onItalicChange}
        onUnderlineChange={onUnderlineChange}
        label={fontStyleLabel}
        showGlobalLabel={showGlobalLabels}
      />

      {/* Line Height & Letter Spacing */}
      {(includeLineHeight || includeLetterSpacing) && (
        <LineHeightLetterSpacingGrid
          lineHeightValue={lineHeight}
          lineHeightOnChange={onLineHeightChange}
          lineHeightLabel={lineHeightLabel}
          letterSpacingValue={letterSpacing}
          letterSpacingOnChange={onLetterSpacingChange}
          letterSpacingLabel={letterSpacingLabel}
          showGlobalLabel={showGlobalLabels}
        />
      )}
    </div>
  );
};
