import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';

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
        className={`w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs ${className}`}
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
 * Track Prefix Style Selector Component
 * Provides radio buttons to select track list prefix style (numbers, dashes, bullets)
 * 
 * @param {string} value - Current selected style ('numbers', 'dashes', or 'bullets')
 * @param {function} onChange - Callback when style changes, receives new value
 * @param {string} name - Unique name for radio button group (e.g., album.id)
 * @param {string} className - Additional CSS classes for container
 */
export const TrackPrefixStyleSelector = ({ 
  value = 'numbers', 
  onChange, 
  name = 'trackListStyle',
  className = '' 
}) => {
  const styles = [
    { value: 'numbers', label: 'Numbers (1. 2.)' },
    { value: 'dashes', label: 'Dashes (- -)' },
    { value: 'bullets', label: 'Bullets (• •)' }
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {styles.map(style => (
        <label 
          key={style.value}
          onClick={(e) => {
            e.preventDefault();
            onChange(style.value);
          }}
          className={`flex items-center cursor-pointer text-xs px-3 py-2 rounded border transition-colors ${
            value === style.value
              ? 'bg-purple-100 border-purple-400 dark:bg-purple-900/30 dark:border-purple-500' 
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={style.value}
            checked={value === style.value}
            readOnly
            className="sr-only"
          />
          <div className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${
            value === style.value
              ? 'border-purple-500 bg-purple-500' 
              : 'border-gray-400'
          }`}>
            {value === style.value && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
            )}
          </div>
          <span>{style.label}</span>
        </label>
      ))}
    </div>
  );
};

/**
 * Typography Section with Header Component
 * Universal component for all typography sections (Album Title, Artist, Year, Track List, Duration)
 * Includes section header with number, title, and reset button
 * 
 * @param {string} sectionNumber - Section number to display (e.g., "1", "2", "5")
 * @param {string} title - Section title (e.g., "Album Title", "Artist Name")
 * @param {object} values - Typography values (fontFamily, fontBold, fontItalic, etc.)
 * @param {object} handlers - Event handlers for all typography controls
 * @param {function} onReset - Callback when reset button is clicked
 * @param {object} config - Configuration for min/max/step values
 */
export const TypographySectionWithHeader = ({ 
  sectionNumber,
  title,
  values,
  handlers,
  onReset,
  config = {}
}) => {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-purple-600 dark:text-purple-400">{sectionNumber}.</span> {title}
        </div>
        <ResetButton onReset={onReset} title={`Reset ${title} style`} />
      </h4>
      
      <TypographySection
        values={values}
        handlers={handlers}
        config={config}
      />
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

/**
 * Reset Button Component
 * Small icon-only button to reset settings to defaults
 * 
 * @param {function} onReset - Callback when button is clicked
 * @param {string} title - Tooltip text (default: "Reset to default settings")
 */
export const ResetButton = ({ onReset, title = "Reset to default settings" }) => {
  if (!onReset) return null;
  
  return (
    <button
      onClick={onReset}
      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
      title={title}
    >
      <FontAwesomeIcon icon={faRotateRight} className="w-3.5 h-3.5" />
    </button>
  );
};

/**
 * Complete Typography Section Component
 * Combines Font Family, Font Style, Font Size, Line Height, and Letter Spacing
 * in a 2-row grid layout (matching the design in the image)
 * 
 * @param {object} values - Typography values
 * @param {string} values.fontFamily - Font family
 * @param {boolean} values.fontBold - Bold state
 * @param {boolean} values.fontItalic - Italic state
 * @param {boolean} values.fontUnderline - Underline state
 * @param {number} values.fontSize - Font size in pt
 * @param {number} values.lineHeight - Line height multiplier
 * @param {number} values.letterSpacing - Letter spacing in em
 * 
 * @param {object} handlers - Change handlers
 * @param {function} handlers.onFontFamilyChange - Font family change handler
 * @param {function} handlers.onBoldChange - Bold change handler
 * @param {function} handlers.onItalicChange - Italic change handler
 * @param {function} handlers.onUnderlineChange - Underline change handler
 * @param {function} handlers.onFontSizeChange - Font size change handler
 * @param {function} handlers.onLineHeightChange - Line height change handler
 * @param {function} handlers.onLetterSpacingChange - Letter spacing change handler
 * @param {function} handlers.onReset - Optional reset handler to restore default values
 * 
 * @param {object} config - Configuration options
 * @param {number} config.fontSizeMin - Min font size (default: 6)
 * @param {number} config.fontSizeMax - Max font size (default: 20)
 * @param {number} config.fontSizeStep - Font size step (default: 0.5)
 * @param {boolean} config.showResetButton - Show reset button (default: true)
 */
export const TypographySection = ({ values, handlers, config = {} }) => {
  const {
    fontFamily,
    fontBold,
    fontItalic,
    fontUnderline,
    fontSize,
    lineHeight,
    letterSpacing
  } = values;

  const {
    onFontFamilyChange,
    onBoldChange,
    onItalicChange,
    onUnderlineChange,
    onFontSizeChange,
    onLineHeightChange,
    onLetterSpacingChange,
    onReset
  } = handlers;

  const {
    fontSizeMin = 6,
    fontSizeMax = 20,
    fontSizeStep = 0.5,
    showResetButton = true
  } = config;

  return (
    <div className="space-y-3">
      {/* Row 1: Font Family + Font Style */}
      <div className="grid grid-cols-2 gap-3">
        <FontFamilySelect
          value={fontFamily}
          onChange={onFontFamilyChange}
          label="Font Family"
          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-xs"
        />
        
        <FontStyleCheckboxes
          bold={fontBold}
          italic={fontItalic}
          underline={fontUnderline}
          onBoldChange={onBoldChange}
          onItalicChange={onItalicChange}
          onUnderlineChange={onUnderlineChange}
          label="Font Style"
        />
      </div>
      
      {/* Row 2: Font Size + Line Height + Letter Spacing */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
            Font Size: <strong>{fontSize}pt</strong>
          </label>
          <input
            type="range"
            min={fontSizeMin}
            max={fontSizeMax}
            step={fontSizeStep}
            value={fontSize}
            onChange={onFontSizeChange}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
            Line Height: <strong>{lineHeight}</strong>
          </label>
          <input
            type="range"
            min="0.8"
            max="2"
            step="0.1"
            value={lineHeight || 1.2}
            onChange={onLineHeightChange}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
            Letter Spacing: <strong>{letterSpacing}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="0.2"
            step="0.01"
            value={letterSpacing || 0}
            onChange={onLetterSpacingChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Image Settings Section Component
 * Controls for image zoom and position with section header and reset button
 * 
 * @param {string} sectionNumber - Section number or icon to display (e.g., "🔍", "1")
 * @param {string} title - Section title (default: "Image Settings")
 * @param {object} values - Image values (imageZoom, imageOffsetX, imageOffsetY)
 * @param {object} handlers - Event handlers for zoom and position controls
 * @param {function} onReset - Callback when reset button is clicked
 * @param {object} config - Configuration for min/max/step values
 */
export const ImageSettingsSection = ({ 
  sectionNumber = "🔍",
  title = "Image Settings",
  values,
  handlers,
  onReset,
  config = {}
}) => {
  const {
    imageZoom = 100,
    imageOffsetX = 0,
    imageOffsetY = 0
  } = values;

  const {
    onZoomChange,
    onOffsetXChange,
    onOffsetYChange
  } = handlers;

  const {
    zoomMin = 50,
    zoomMax = 200,
    zoomStep = 5,
    offsetMin = -50,
    offsetMax = 50,
    offsetStep = 1
  } = config;

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-purple-600 dark:text-purple-400">{sectionNumber}</span> {title}
        </div>
        <ResetButton onReset={onReset} title={`Reset ${title}`} />
      </h4>
      
      <div className="space-y-3">
        {/* Zoom Slider */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
            Zoom: <strong>{imageZoom}%</strong>
          </label>
          <input
            type="range"
            min={zoomMin}
            max={zoomMax}
            step={zoomStep}
            value={imageZoom}
            onChange={onZoomChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
            <span>{zoomMin}%</span>
            <span>{zoomMax}%</span>
          </div>
        </div>

        {/* Position X and Y in one row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
              Position X: <strong>{imageOffsetX}px</strong>
            </label>
            <input
              type="range"
              min={offsetMin}
              max={offsetMax}
              step={offsetStep}
              value={imageOffsetX}
              onChange={onOffsetXChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
              <span>{offsetMin}px</span>
              <span>{offsetMax}px</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
              Position Y: <strong>{imageOffsetY}px</strong>
            </label>
            <input
              type="range"
              min={offsetMin}
              max={offsetMax}
              step={offsetStep}
              value={imageOffsetY}
              onChange={onOffsetYChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
              <span>{offsetMin}px</span>
              <span>{offsetMax}px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

