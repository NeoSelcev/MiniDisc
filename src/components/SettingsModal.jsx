import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import useAppStore from '../store/useAppStore';
import { 
  FontFamilySelect, 
  FontStyleCheckboxes, 
  FontSizeInput, 
  LineHeightSlider,
  TypographySectionWithHeader,
  TrackPrefixStyleSelector
} from './TypographyControls';

function SettingsModal({ isOpen, onClose }) {
  const { settings, updateSettings } = useAppStore();
  const [position, setPosition] = useState({ x: 100, y: 50 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);
  
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Close modal on click outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e) => {
      // Delay check to allow modal to render
      setTimeout(() => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
          onClose();
        }
      }, 0);
    };
    
    // Use mousedown to prevent conflicts with button clicks
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  
  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);
  
  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e) => {
      const newWidth = Math.max(400, e.clientX - position.x);
      const newHeight = Math.max(300, e.clientY - position.y);
      setSize({ width: newWidth, height: newHeight });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, position]);
  
  const handleDragStart = (e) => {
    if (e.target.closest('.modal-content')) return; // Don't drag if clicking content
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };
  
  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
  };
  
  if (!isOpen) return null;
  
  const handleReset = () => {
    if (confirm('Reset all settings to defaults? This will reload the page.')) {
      window.location.reload();
    }
  };
  
  const updateDimension = (category, field, value) => {
    updateSettings({
      ...settings,
      dimensions: {
        ...settings.dimensions,
        [category]: {
          ...settings.dimensions[category],
          [field]: parseFloat(value) || 0,
        },
      },
    });
  };
  
  const updateFontSize = (field, value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        fontSizes: {
          ...settings.design.fontSizes,
          [field]: parseFloat(value) || 6,
        },
      },
    });
  };
  
  const updateFontStyle = (field, style, value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        fontStyles: {
          ...settings.design.fontStyles,
          [field]: {
            ...settings.design.fontStyles?.[field],
            [style]: value,
          },
        },
      },
    });
  };
  
  const updateFontFamily = (field, value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        fontFamilies: {
          ...settings.design.fontFamilies,
          [field]: value,
        },
      },
    });
  };
  
  const updateLineHeight = (field, value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        lineHeights: {
          ...settings.design.lineHeights,
          [field]: parseFloat(value) || 1.2,
        },
      },
    });
  };
  
  const updateLetterSpacing = (field, value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        letterSpacing: {
          ...settings.design.letterSpacing,
          [field]: parseFloat(value) || 0,
        },
      },
    });
  };
  
  const updateTrackListStyle = (value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        trackListStyle: value,
      },
    });
  };
  
  const handleResetSection = (sectionKey) => {
    // This would reset individual section - implement if needed
    console.log('Reset section:', sectionKey);
  };
  
  const updateTrackListStyle = (value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        trackListStyle: value,
      },
    });
  };
  
  const updatePrintSetting = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updateSettings({
        ...settings,
        print: {
          ...settings.print,
          [parent]: {
            ...settings.print[parent],
            [child]: value,
          },
        },
      });
    } else {
      updateSettings({
        ...settings,
        print: {
          ...settings.print,
          [field]: value,
        },
      });
    }
  };
  
  const updateLayoutSetting = (field, value) => {
    updateSettings({
      ...settings,
      layout: {
        ...settings.layout,
        [field]: value,
      },
    });
  };
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Modal */}
      <div 
        ref={modalRef}
        className="absolute bg-white rounded-lg border-2 border-gray-300 overflow-hidden pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          minWidth: '400px',
          minHeight: '300px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Draggable */}
        <div 
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between cursor-move select-none"
          onMouseDown={handleDragStart}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="modal-content overflow-y-auto px-6 py-4 space-y-8 bg-white dark:bg-gray-800" style={{ height: 'calc(100% - 120px)' }}>
            {/* Spotify Setup Help */}
            <section className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
                <FontAwesomeIcon icon={faSpotify} className="mr-2 w-5 h-5" />
                Spotify Integration Setup
              </h3>
              <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                <p>
                  <strong>How to get your Spotify token:</strong> The app will automatically generate one when you click "Connect Spotify".
                </p>
                <div className="bg-white dark:bg-gray-800 rounded p-3 space-y-2">
                  <p className="font-medium text-blue-900 dark:text-blue-300">Quick Setup (3 steps):</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Create a Spotify app at <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">developer.spotify.com/dashboard</a></li>
                    <li>Set redirect URI to: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs break-all">http://127.0.0.1:5173/callback</code></li>
                    <li>Copy Client ID & Secret to the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">.env</code> file</li>
                  </ol>
                </div>
              </div>
            </section>
            
            {/* Sticker Dimensions */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sticker Dimensions (mm)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Edge Sticker */}
                <div className="border border-gray-200 rounded p-4">
                  <h4 className="font-medium mb-2">MiniDisc Edge (Spine)</h4>
                  <div className="space-y-2">
                    <label className="block text-sm">
                      Width (mm)
                      <input
                        type="number"
                        value={settings.dimensions.edgeSticker.width}
                        onChange={(e) => updateDimension('edgeSticker', 'width', e.target.value)}
                        className="mt-1 input-field w-full"
                        step="0.1"
                      />
                    </label>
                    <label className="block text-sm">
                      Height (mm)
                      <input
                        type="number"
                        value={settings.dimensions.edgeSticker.height}
                        onChange={(e) => updateDimension('edgeSticker', 'height', e.target.value)}
                        className="mt-1 input-field w-full"
                        step="0.1"
                      />
                    </label>
                  </div>
                </div>
                
                {/* Disc Face */}
                <div className="border border-gray-200 rounded p-4">
                  <h4 className="font-medium mb-2">MiniDisc Face</h4>
                  <div className="space-y-2">
                    <label className="block text-sm">
                      Width (mm)
                      <input
                        type="number"
                        value={settings.dimensions.discFace.width}
                        onChange={(e) => updateDimension('discFace', 'width', e.target.value)}
                        className="mt-1 input-field w-full"
                        min="5"
                        max="200"
                      />
                    </label>
                    <label className="block text-sm">
                      Height (mm)
                      <input
                        type="number"
                        value={settings.dimensions.discFace.height}
                        onChange={(e) => updateDimension('discFace', 'height', e.target.value)}
                        className="mt-1 input-field w-full"
                        min="5"
                        max="200"
                      />
                    </label>
                  </div>
                </div>
                
                {/* Holder Front Image Part */}
                <div className="border border-gray-200 rounded p-4">
                  <h4 className="font-medium mb-2">Holder Front - Image Part</h4>
                  <div className="space-y-2">
                    <label className="block text-sm">
                      Width (mm)
                      <input
                        type="number"
                        value={settings.dimensions.holderFrontPartA.width}
                        onChange={(e) => updateDimension('holderFrontPartA', 'width', e.target.value)}
                        className="mt-1 input-field w-full"
                        min="5"
                        max="200"
                      />
                    </label>
                    <label className="block text-sm">
                      Height (mm)
                      <input
                        type="number"
                        value={settings.dimensions.holderFrontPartA.height}
                        onChange={(e) => updateDimension('holderFrontPartA', 'height', e.target.value)}
                        className="mt-1 input-field w-full"
                        min="5"
                        max="200"
                      />
                    </label>
                  </div>
                </div>
                
                {/* Holder Front Edge Part */}
                <div className="border border-gray-200 rounded p-4">
                  <h4 className="font-medium mb-2">Holder Front - Edge Part (Spine)</h4>
                  <div className="space-y-2">
                    <label className="block text-sm">
                      Width (mm) <span className="text-gray-500 text-xs">(Auto: matches Image Part)</span>
                      <input
                        type="number"
                        value={settings.dimensions.holderFrontPartA.width}
                        disabled
                        className="mt-1 input-field w-full bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </label>
                    <label className="block text-sm">
                      Height (mm) <span className="text-gray-500 text-xs">(Fold strip)</span>
                      <input
                        type="number"
                        value={settings.dimensions.holderFrontPartB.height}
                        onChange={(e) => updateDimension('holderFrontPartB', 'height', e.target.value)}
                        className="mt-1 input-field w-full"
                        min="1"
                        max="10"
                      />
                    </label>
                  </div>
                </div>
                
                {/* Holder Back */}
                <div className="border border-gray-200 rounded p-4">
                  <h4 className="font-medium mb-2">Holder Back (Track List)</h4>
                  <div className="space-y-2">
                    <label className="block text-sm">
                      Width (mm)
                      <input
                        type="number"
                        value={settings.dimensions.holderBack.width}
                        onChange={(e) => updateDimension('holderBack', 'width', e.target.value)}
                        className="mt-1 input-field w-full"
                        min="5"
                        max="200"
                      />
                    </label>
                    <label className="block text-sm">
                      Height (mm)
                      <input
                        type="number"
                        value={settings.dimensions.holderBack.height}
                        onChange={(e) => updateDimension('holderBack', 'height', e.target.value)}
                        className="mt-1 input-field w-full"
                        min="5"
                        max="200"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Typography Settings */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Typography Settings</h3>
              
              <div className="space-y-4">
                {/* 1. MiniDisc Edge Sticker (Spine) */}
                <TypographySectionWithHeader
                  sectionNumber="1"
                  title="MiniDisc Edge Sticker (Spine)"
                  values={{
                    fontFamily: settings.design.fontFamilies?.spine,
                    fontBold: settings.design.fontStyles?.spine?.bold,
                    fontItalic: settings.design.fontStyles?.spine?.italic,
                    fontUnderline: settings.design.fontStyles?.spine?.underline,
                    fontSize: settings.design.fontSizes?.spine,
                    lineHeight: settings.design.lineHeights?.spine,
                    letterSpacing: settings.design.letterSpacing?.spine || 0
                  }}
                  handlers={{
                    onFontFamilyChange: (e) => updateFontFamily('spine', e.target.value),
                    onBoldChange: (e) => updateFontStyle('spine', 'bold', e.target.checked),
                    onItalicChange: (e) => updateFontStyle('spine', 'italic', e.target.checked),
                    onUnderlineChange: (e) => updateFontStyle('spine', 'underline', e.target.checked),
                    onFontSizeChange: (e) => updateFontSize('spine', e.target.value),
                    onLineHeightChange: (e) => updateLineHeight('spine', e.target.value),
                    onLetterSpacingChange: (e) => updateLetterSpacing('spine', e.target.value)
                  }}
                  onReset={() => handleResetSection('spine')}
                  config={{
                    fontSizeMin: 6,
                    fontSizeMax: 12,
                    fontSizeStep: 0.5
                  }}
                />

                {/* 2. Holder Back - Album Title */}
                <TypographySectionWithHeader
                  sectionNumber="2"
                  title="Holder Back - Album Title"
                  values={{
                    fontFamily: settings.design.fontFamilies?.holderBackTitle,
                    fontBold: settings.design.fontStyles?.holderBackTitle?.bold,
                    fontItalic: settings.design.fontStyles?.holderBackTitle?.italic,
                    fontUnderline: settings.design.fontStyles?.holderBackTitle?.underline,
                    fontSize: settings.design.fontSizes?.holderBackTitle,
                    lineHeight: settings.design.lineHeights?.holderBackTitle,
                    letterSpacing: settings.design.letterSpacing?.holderBackTitle || 0
                  }}
                  handlers={{
                    onFontFamilyChange: (e) => updateFontFamily('holderBackTitle', e.target.value),
                    onBoldChange: (e) => updateFontStyle('holderBackTitle', 'bold', e.target.checked),
                    onItalicChange: (e) => updateFontStyle('holderBackTitle', 'italic', e.target.checked),
                    onUnderlineChange: (e) => updateFontStyle('holderBackTitle', 'underline', e.target.checked),
                    onFontSizeChange: (e) => updateFontSize('holderBackTitle', e.target.value),
                    onLineHeightChange: (e) => updateLineHeight('holderBackTitle', e.target.value),
                    onLetterSpacingChange: (e) => updateLetterSpacing('holderBackTitle', e.target.value)
                  }}
                  onReset={() => handleResetSection('holderBackTitle')}
                  config={{
                    fontSizeMin: 8,
                    fontSizeMax: 20,
                    fontSizeStep: 0.5
                  }}
                />

                {/* 3. Holder Back - Artist */}
                <TypographySectionWithHeader
                  sectionNumber="3"
                  title="Holder Back - Artist"
                  values={{
                    fontFamily: settings.design.fontFamilies?.holderBackArtist,
                    fontBold: settings.design.fontStyles?.holderBackArtist?.bold,
                    fontItalic: settings.design.fontStyles?.holderBackArtist?.italic,
                    fontUnderline: settings.design.fontStyles?.holderBackArtist?.underline,
                    fontSize: settings.design.fontSizes?.holderBackArtist,
                    lineHeight: settings.design.lineHeights?.holderBackArtist,
                    letterSpacing: settings.design.letterSpacing?.holderBackArtist || 0
                  }}
                  handlers={{
                    onFontFamilyChange: (e) => updateFontFamily('holderBackArtist', e.target.value),
                    onBoldChange: (e) => updateFontStyle('holderBackArtist', 'bold', e.target.checked),
                    onItalicChange: (e) => updateFontStyle('holderBackArtist', 'italic', e.target.checked),
                    onUnderlineChange: (e) => updateFontStyle('holderBackArtist', 'underline', e.target.checked),
                    onFontSizeChange: (e) => updateFontSize('holderBackArtist', e.target.value),
                    onLineHeightChange: (e) => updateLineHeight('holderBackArtist', e.target.value),
                    onLetterSpacingChange: (e) => updateLetterSpacing('holderBackArtist', e.target.value)
                  }}
                  onReset={() => handleResetSection('holderBackArtist')}
                  config={{
                    fontSizeMin: 6,
                    fontSizeMax: 16,
                    fontSizeStep: 0.5
                  }}
                />

                {/* 4. Holder Back - Year */}
                <TypographySectionWithHeader
                  sectionNumber="4"
                  title="Holder Back - Year"
                  values={{
                    fontFamily: settings.design.fontFamilies?.holderBackYear,
                    fontBold: settings.design.fontStyles?.holderBackYear?.bold,
                    fontItalic: settings.design.fontStyles?.holderBackYear?.italic,
                    fontUnderline: settings.design.fontStyles?.holderBackYear?.underline,
                    fontSize: settings.design.fontSizes?.holderBackYear,
                    lineHeight: settings.design.lineHeights?.holderBackYear,
                    letterSpacing: settings.design.letterSpacing?.holderBackYear || 0
                  }}
                  handlers={{
                    onFontFamilyChange: (e) => updateFontFamily('holderBackYear', e.target.value),
                    onBoldChange: (e) => updateFontStyle('holderBackYear', 'bold', e.target.checked),
                    onItalicChange: (e) => updateFontStyle('holderBackYear', 'italic', e.target.checked),
                    onUnderlineChange: (e) => updateFontStyle('holderBackYear', 'underline', e.target.checked),
                    onFontSizeChange: (e) => updateFontSize('holderBackYear', e.target.value),
                    onLineHeightChange: (e) => updateLineHeight('holderBackYear', e.target.value),
                    onLetterSpacingChange: (e) => updateLetterSpacing('holderBackYear', e.target.value)
                  }}
                  onReset={() => handleResetSection('holderBackYear')}
                  config={{
                    fontSizeMin: 6,
                    fontSizeMax: 14,
                    fontSizeStep: 0.5
                  }}
                />

                {/* 5. Track List Style */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600 dark:text-purple-400">5.</span> Track Prefix Style
                    </div>
                  </h4>
                  
                  <TrackPrefixStyleSelector
                    value={settings.design.trackListStyle || 'numbers'}
                    onChange={updateTrackListStyle}
                    name="defaultTrackListStyle"
                  />
                </div>

                {/* 6. Holder Back - Track List */}
                <TypographySectionWithHeader
                  sectionNumber="6"
                  title="Holder Back - Track List"
                  values={{
                    fontFamily: settings.design.fontFamilies?.trackList,
                    fontBold: settings.design.fontStyles?.trackList?.bold,
                    fontItalic: settings.design.fontStyles?.trackList?.italic,
                    fontUnderline: settings.design.fontStyles?.trackList?.underline,
                    fontSize: settings.design.fontSizes?.trackList,
                    lineHeight: settings.design.lineHeights?.trackList,
                    letterSpacing: settings.design.letterSpacing?.trackList || 0
                  }}
                  handlers={{
                    onFontFamilyChange: (e) => updateFontFamily('trackList', e.target.value),
                    onBoldChange: (e) => updateFontStyle('trackList', 'bold', e.target.checked),
                    onItalicChange: (e) => updateFontStyle('trackList', 'italic', e.target.checked),
                    onUnderlineChange: (e) => updateFontStyle('trackList', 'underline', e.target.checked),
                    onFontSizeChange: (e) => updateFontSize('trackList', e.target.value),
                    onLineHeightChange: (e) => updateLineHeight('trackList', e.target.value),
                    onLetterSpacingChange: (e) => updateLetterSpacing('trackList', e.target.value)
                  }}
                  onReset={() => handleResetSection('trackList')}
                  config={{
                    fontSizeMin: 3,
                    fontSizeMax: 10,
                    fontSizeStep: 0.5
                  }}
                />

                {/* 7. Holder Back - Track Duration */}
                <TypographySectionWithHeader
                  sectionNumber="7"
                  title="Holder Back - Track Duration"
                  values={{
                    fontFamily: settings.design.fontFamilies?.trackDuration,
                    fontBold: settings.design.fontStyles?.trackDuration?.bold,
                    fontItalic: settings.design.fontStyles?.trackDuration?.italic,
                    fontUnderline: settings.design.fontStyles?.trackDuration?.underline,
                    fontSize: settings.design.fontSizes?.trackDuration || 6,
                    lineHeight: settings.design.lineHeights?.trackDuration,
                    letterSpacing: settings.design.letterSpacing?.trackDuration || 0
                  }}
                  handlers={{
                    onFontFamilyChange: (e) => updateFontFamily('trackDuration', e.target.value),
                    onBoldChange: (e) => updateFontStyle('trackDuration', 'bold', e.target.checked),
                    onItalicChange: (e) => updateFontStyle('trackDuration', 'italic', e.target.checked),
                    onUnderlineChange: (e) => updateFontStyle('trackDuration', 'underline', e.target.checked),
                    onFontSizeChange: (e) => updateFontSize('trackDuration', e.target.value),
                    onLineHeightChange: (e) => updateLineHeight('trackDuration', e.target.value),
                    onLetterSpacingChange: (e) => updateLetterSpacing('trackDuration', e.target.value)
                  }}
                  onReset={() => handleResetSection('trackDuration')}
                  config={{
                    fontSizeMin: 4,
                    fontSizeMax: 10,
                    fontSizeStep: 0.5
                  }}
                />
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
                <strong>Typography Guidelines:</strong> Spine and track list text should be 6-8pt to fit within small heights. 
                Disc face text 8-12pt. Holder back (inner cover) text can vary based on content.
              </p>
            </section>
            
            {/* Print Settings */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Print Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-sm">
                  DPI (Print Resolution)
                  <input
                    type="number"
                    value={settings.print.dpi}
                    onChange={(e) => updatePrintSetting('dpi', parseInt(e.target.value))}
                    className="mt-1 input-field w-full"
                    min="72"
                    max="600"
                  />
                </label>
                
                <label className="block text-sm">
                  Element Spacing (mm)
                  <input
                    type="number"
                    value={settings.layout.elementSpacing}
                    onChange={(e) => updateLayoutSetting('elementSpacing', parseFloat(e.target.value) || 0)}
                    className="mt-1 input-field w-full"
                    min="0"
                    max="10"
                    step="0.5"
                  />
                </label>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Printer Margins (mm)</h4>
                <div className="grid grid-cols-2 gap-4">
                  {['top', 'bottom', 'left', 'right'].map((side) => (
                    <label key={side} className="block text-sm capitalize">
                      {side}
                      <input
                        type="number"
                        value={settings.print.margins[side]}
                        onChange={(e) => updatePrintSetting(`margins.${side}`, parseFloat(e.target.value))}
                        className="mt-1 input-field w-full"
                        min="0"
                        max="20"
                        step="0.5"
                      />
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.print.cutLines.enabled}
                    onChange={(e) => updatePrintSetting('cutLines.enabled', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Enable cut lines</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.print.showLabels}
                    onChange={(e) => updatePrintSetting('showLabels', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Show labels</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.print.bleedMarks}
                    onChange={(e) => updatePrintSetting('bleedMarks', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Show margin guides</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.layout.allowRotation}
                    onChange={(e) => updateLayoutSetting('allowRotation', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Allow rotation</span>
                </label>
              </div>
            </section>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition"
            >
              Reset to Defaults
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
            >
              Close
            </button>
          </div>
          
          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeStart}
            style={{
              background: 'linear-gradient(135deg, transparent 50%, #94a3b8 50%)',
            }}
          />
        </div>
    </div>
  );
}

export default SettingsModal;
