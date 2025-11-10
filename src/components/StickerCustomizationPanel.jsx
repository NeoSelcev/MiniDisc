import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCog, faXmark, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../store/useAppStore';
import { 
  FontFamilySelect, 
  FontStyleCheckboxes, 
  FontSizeInput, 
  LineHeightSlider,
  LetterSpacingSlider,
  LineHeightLetterSpacingGrid
} from './TypographyControls';

const StickerCustomizationPanel = ({ album, stickerType, onClose, position: initialPosition, onPanelHover }) => {
  const { getStickerCustomization, updateStickerCustomization, settings, updateSettings } = useAppStore();
  
  // Get initial values (album-specific or defaults)
  const initialCustomization = getStickerCustomization(album, stickerType);
  
  // Local state for live preview
  const [customization, setCustomization] = useState(initialCustomization);
  
  // Draggable state
  const [position, setPosition] = useState(initialPosition || { x: 20, y: 100 });
  const [size, setSize] = useState({ width: 320, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const panelRef = useRef(null);
  
  // Update customization when slider changes (LIVE)
  const handleChange = (field, value) => {
    const updated = { ...customization, [field]: value };
    setCustomization(updated);
    // Live update in store
    updateStickerCustomization(album.id, stickerType, updated);
  };
  
  // Reset to defaults
  const handleReset = () => {
    // Clear customization in store (set to null)
    updateStickerCustomization(album.id, stickerType, null);
    
    // Get fresh defaults from store (without album customization)
    const defaults = getStickerCustomization({ id: album.id, stickerCustomization: null }, stickerType);
    setCustomization(defaults);
  };
  
  // Update global font family
  const updateFontFamily = (key, value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        fontFamilies: {
          ...settings.design.fontFamilies,
          [key]: value,
        },
      },
    });
  };
  
  // Update global font style
  const updateFontStyle = (key, style, value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        fontStyles: {
          ...settings.design.fontStyles,
          [key]: {
            ...settings.design.fontStyles?.[key],
            [style]: value,
          },
        },
      },
    });
  };
  
  // Update global line height
  const updateLineHeight = (key, value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        lineHeights: {
          ...settings.design.lineHeights,
          [key]: parseFloat(value) || 1.2,
        },
      },
    });
  };
  
  // Update global letter spacing
  const updateLetterSpacing = (key, value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        letterSpacing: {
          ...settings.design.letterSpacing,
          [key]: parseFloat(value) || 0,
        },
      },
    });
  };
  
  // Update global track list style
  const updateTrackListStyle = (value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        trackListStyle: value,
      },
    });
  };
  
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check immediately if the click was outside the panel
      // For elements like range sliders, we need to check the composed path
      const path = e.composedPath ? e.composedPath() : [e.target];
      const clickedInsidePanel = path.some(el => el === panelRef.current);
      
      if (panelRef.current && !clickedInsidePanel) {
        onClose();
      }
    };
    
    // Use mousedown to capture the event before any state changes
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
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
      const newWidth = resizeStart.width + (e.clientX - resizeStart.x);
      const newHeight = resizeStart.height + (e.clientY - resizeStart.y);
      setSize({ 
        width: Math.max(280, newWidth),
        height: Math.max(300, newHeight)
      });
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
  }, [isResizing, resizeStart]);
  
  const handleDragStart = (e) => {
    // Don't drag if clicking on a button or interactive element
    if (e.target.closest('button')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };
  
  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };
  
  // Render fields based on sticker type
  const renderFields = () => {
    switch (stickerType) {
      case 'spine':
        // Spine sticker shows only album name text
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>MiniDisc Edge (Spine)</strong><br/>
                Displays album name as vertical text on the edge
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="text-lg">🅰️</span> Text Settings
              </h3>
              
              <div>
                <FontFamilySelect
                  value={settings.design.fontFamilies?.spine}
                  onChange={(e) => updateFontFamily('spine', e.target.value)}
                  label="Font Family"
                  showGlobalLabel={true}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              
              <div>
                <FontStyleCheckboxes
                  bold={settings.design.fontStyles?.spine?.bold}
                  italic={settings.design.fontStyles?.spine?.italic}
                  underline={settings.design.fontStyles?.spine?.underline}
                  onBoldChange={(e) => updateFontStyle('spine', 'bold', e.target.checked)}
                  onItalicChange={(e) => updateFontStyle('spine', 'italic', e.target.checked)}
                  onUnderlineChange={(e) => updateFontStyle('spine', 'underline', e.target.checked)}
                  label="Font Style"
                  showGlobalLabel={true}
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Font Size: <strong>{customization.fontSize}pt</strong>
                </label>
                <input
                  type="range"
                  min="6"
                  max="12"
                  step="0.5"
                  value={customization.fontSize}
                  onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>6pt</span>
                  <span>12pt</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Letter Spacing: <strong>{customization.letterSpacing}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.2"
                  step="0.01"
                  value={customization.letterSpacing}
                  onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>0</span>
                  <span>0.2</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Line Height: <strong>{customization.lineHeight}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={customization.lineHeight}
                  onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>1.0</span>
                  <span>2.0</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'face':
        // Face sticker shows only the disc cover image
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-800">
              <p className="text-xs text-purple-800 dark:text-purple-300">
                <strong>Disc Face (On Disc Edge)</strong><br/>
                Displays album cover image on the visible disc edge
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" /> Image Settings
              </h3>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Zoom: <strong>{customization.imageZoom}%</strong>
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={customization.imageZoom}
                  onChange={(e) => handleChange('imageZoom', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>50%</span>
                  <span>200%</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Position X: <strong>{customization.imageOffsetX}px</strong>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={customization.imageOffsetX}
                  onChange={(e) => handleChange('imageOffsetX', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>-50px</span>
                  <span>+50px</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Position Y: <strong>{customization.imageOffsetY}px</strong>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={customization.imageOffsetY}
                  onChange={(e) => handleChange('imageOffsetY', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>-50px</span>
                  <span>+50px</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'front':
        // Front sticker has Image Part (cover image) and Edge Part (folded spine text)
        return (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-800 dark:text-green-300">
                <strong>Holder Front</strong><br/>
                <strong>Image Part:</strong> Cover image (main area)<br/>
                <strong>Edge Part (Spine):</strong> Album info text (folded spine, ~3mm)
              </p>
            </div>
            
            {/* Image Part - Image Settings */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 border-b pb-2 dark:border-gray-600">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" /> Image Part - Image Settings
              </h3>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Zoom: <strong>{customization.imageZoom}%</strong>
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={customization.imageZoom}
                  onChange={(e) => handleChange('imageZoom', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>50%</span>
                  <span>200%</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Position X: <strong>{customization.imageOffsetX}px</strong>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={customization.imageOffsetX}
                  onChange={(e) => handleChange('imageOffsetX', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>-50px</span>
                  <span>+50px</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Position Y: <strong>{customization.imageOffsetY}px</strong>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={customization.imageOffsetY}
                  onChange={(e) => handleChange('imageOffsetY', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>-50px</span>
                  <span>+50px</span>
                </div>
              </div>
            </div>
            
            {/* Edge Part - Text Settings for Folded Spine */}
            <div className="space-y-3 pt-3 border-t dark:border-gray-600">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="text-lg">🅰️</span> Edge Part (Spine) - Text Settings
              </h3>
              
              <div>
                <FontFamilySelect
                  value={settings.design.fontFamilies?.spine}
                  onChange={(e) => updateFontFamily('spine', e.target.value)}
                  label="Font Family"
                  showGlobalLabel={true}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              
              <div>
                <FontStyleCheckboxes
                  bold={settings.design.fontStyles?.spine?.bold}
                  italic={settings.design.fontStyles?.spine?.italic}
                  underline={settings.design.fontStyles?.spine?.underline}
                  onBoldChange={(e) => updateFontStyle('spine', 'bold', e.target.checked)}
                  onItalicChange={(e) => updateFontStyle('spine', 'italic', e.target.checked)}
                  onUnderlineChange={(e) => updateFontStyle('spine', 'underline', e.target.checked)}
                  label="Font Style"
                  showGlobalLabel={true}
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Font Size: <strong>{customization.titleFontSize}pt</strong>
                </label>
                <input
                  type="range"
                  min="4"
                  max="8"
                  step="0.5"
                  value={customization.titleFontSize}
                  onChange={(e) => handleChange('titleFontSize', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>4pt</span>
                  <span>8pt</span>
                </div>
              </div>
            </div>
          </div>
        );
    
    case 'back':
      // Back sticker shows album title, artist, year, and track list
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded border-2 border-purple-300 dark:border-purple-700">
            <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-1">
              📄 Holder Back Cover Typography
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-400">
              Complete typography control for all back cover text elements
            </p>
          </div>
          
          {/* 1. Album Title */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400">1.</span> Album Title
            </h4>
            
            <div className="space-y-3">
              {/* Row 1: Font Family + Font Style */}
              <div className="grid grid-cols-2 gap-3">
                <FontFamilySelect
                  value={customization.titleFontFamily}
                  onChange={(e) => handleChange('titleFontFamily', e.target.value)}
                  label="Font Family"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-xs"
                />
                
                <FontStyleCheckboxes
                  bold={customization.titleFontBold}
                  italic={customization.titleFontItalic}
                  underline={customization.titleFontUnderline}
                  onBoldChange={(e) => handleChange('titleFontBold', e.target.checked)}
                  onItalicChange={(e) => handleChange('titleFontItalic', e.target.checked)}
                  onUnderlineChange={(e) => handleChange('titleFontUnderline', e.target.checked)}
                  label="Font Style"
                />
              </div>
              
              {/* Row 2: Font Size + Line Height + Letter Spacing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Font Size: <strong>{customization.titleFontSize}pt</strong>
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="20"
                    step="0.5"
                    value={customization.titleFontSize}
                    onChange={(e) => handleChange('titleFontSize', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Line Height: <strong>{customization.titleLineHeight}</strong>
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="2"
                    step="0.1"
                    value={customization.titleLineHeight}
                    onChange={(e) => handleChange('titleLineHeight', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Letter Spacing: <strong>{customization.titleLetterSpacing}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.2"
                    step="0.01"
                    value={customization.titleLetterSpacing}
                    onChange={(e) => handleChange('titleLetterSpacing', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* 2. Artist Name */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400">2.</span> Artist Name
            </h4>
            
            <div className="space-y-3">
              {/* Row 1: Font Family + Font Style */}
              <div className="grid grid-cols-2 gap-3">
                <FontFamilySelect
                  value={settings.design.fontFamilies?.holderBackArtist}
                  onChange={(e) => updateFontFamily('holderBackArtist', e.target.value)}
                  label="Font Family"
                  showGlobalLabel={true}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-xs"
                />
                
                <FontStyleCheckboxes
                  bold={settings.design.fontStyles?.holderBackArtist?.bold}
                  italic={settings.design.fontStyles?.holderBackArtist?.italic}
                  underline={settings.design.fontStyles?.holderBackArtist?.underline}
                  onBoldChange={(e) => updateFontStyle('holderBackArtist', 'bold', e.target.checked)}
                  onItalicChange={(e) => updateFontStyle('holderBackArtist', 'italic', e.target.checked)}
                  onUnderlineChange={(e) => updateFontStyle('holderBackArtist', 'underline', e.target.checked)}
                  label="Font Style"
                  showGlobalLabel={true}
                />
              </div>
              
              {/* Row 2: Font Size + Line Height + Letter Spacing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Font Size: <strong>{customization.artistFontSize}pt</strong>
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="16"
                    step="0.5"
                    value={customization.artistFontSize}
                    onChange={(e) => handleChange('artistFontSize', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Line Height: <strong>{settings.design.lineHeights?.holderBackArtist}</strong> <span className="text-xs opacity-60">(global)</span>
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="2"
                    step="0.1"
                    value={settings.design.lineHeights?.holderBackArtist || 1.2}
                    onChange={(e) => updateLineHeight('holderBackArtist', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Letter Spacing: <strong>{settings.design.letterSpacing?.holderBackArtist}</strong> <span className="text-xs opacity-60">(global)</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.2"
                    step="0.01"
                    value={settings.design.letterSpacing?.holderBackArtist || 0}
                    onChange={(e) => updateLetterSpacing('holderBackArtist', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* 3. Year of Production */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400">3.</span> Year of Production
            </h4>
            
            <div className="space-y-3">
              {/* Row 1: Font Family + Font Style */}
              <div className="grid grid-cols-2 gap-3">
                <FontFamilySelect
                  value={settings.design.fontFamilies?.holderBackYear}
                  onChange={(e) => updateFontFamily('holderBackYear', e.target.value)}
                  label="Font Family"
                  showGlobalLabel={true}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-xs"
                />
                
                <FontStyleCheckboxes
                  bold={settings.design.fontStyles?.holderBackYear?.bold}
                  italic={settings.design.fontStyles?.holderBackYear?.italic}
                  underline={settings.design.fontStyles?.holderBackYear?.underline}
                  onBoldChange={(e) => updateFontStyle('holderBackYear', 'bold', e.target.checked)}
                  onItalicChange={(e) => updateFontStyle('holderBackYear', 'italic', e.target.checked)}
                  onUnderlineChange={(e) => updateFontStyle('holderBackYear', 'underline', e.target.checked)}
                  label="Font Style"
                  showGlobalLabel={true}
                />
              </div>
              
              {/* Row 2: Font Size + Line Height + Letter Spacing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Font Size: <strong>{customization.yearFontSize}pt</strong>
                  </label>
                  <input
                    type="range"
                    min="6"
                    max="14"
                    step="0.5"
                    value={customization.yearFontSize}
                    onChange={(e) => handleChange('yearFontSize', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Line Height: <strong>{settings.design.lineHeights?.holderBackYear}</strong> <span className="text-xs opacity-60">(global)</span>
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="2"
                    step="0.1"
                    value={settings.design.lineHeights?.holderBackYear || 1.2}
                    onChange={(e) => updateLineHeight('holderBackYear', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Letter Spacing: <strong>{settings.design.letterSpacing?.holderBackYear}</strong> <span className="text-xs opacity-60">(global)</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.2"
                    step="0.01"
                    value={settings.design.letterSpacing?.holderBackYear || 0}
                    onChange={(e) => updateLetterSpacing('holderBackYear', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* 4. Track List (Track Names) */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400">4.</span> Track List (Track Names)
            </h4>
            
            <div className="space-y-3">
              {/* Row 1: Font Family + Font Style */}
              <div className="grid grid-cols-2 gap-3">
                <FontFamilySelect
                  value={settings.design.fontFamilies?.trackList}
                  onChange={(e) => updateFontFamily('trackList', e.target.value)}
                  label="Font Family"
                  showGlobalLabel={true}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-xs"
                />
                
                <FontStyleCheckboxes
                  bold={settings.design.fontStyles?.trackList?.bold}
                  italic={settings.design.fontStyles?.trackList?.italic}
                  underline={settings.design.fontStyles?.trackList?.underline}
                  onBoldChange={(e) => updateFontStyle('trackList', 'bold', e.target.checked)}
                  onItalicChange={(e) => updateFontStyle('trackList', 'italic', e.target.checked)}
                  onUnderlineChange={(e) => updateFontStyle('trackList', 'underline', e.target.checked)}
                  label="Font Style"
                  showGlobalLabel={true}
                />
              </div>
              
              {/* Row 2: Font Size + Line Height + Letter Spacing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Font Size: <strong>{customization.trackListFontSize}pt</strong>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="0.5"
                    value={customization.trackListFontSize}
                    onChange={(e) => handleChange('trackListFontSize', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Line Height: <strong>{customization.lineHeight}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.1"
                    value={customization.lineHeight}
                    onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Letter Spacing: <strong>{customization.letterSpacing}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.15"
                    step="0.01"
                    value={customization.letterSpacing}
                    onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Track List Style Options */}
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-300 dark:border-yellow-700">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                  🎵 Track Prefix Style <span className="text-xs opacity-60">(global)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center cursor-pointer text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border">
                    <input
                      type="radio"
                      name="trackListStyle"
                      value="numbers"
                      checked={settings.design.trackListStyle === 'numbers'}
                      onChange={(e) => updateTrackListStyle(e.target.value)}
                      className="mr-1"
                    />
                    <span>Numbers (1. 2.)</span>
                  </label>
                  <label className="flex items-center cursor-pointer text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border">
                    <input
                      type="radio"
                      name="trackListStyle"
                      value="dashes"
                      checked={settings.design.trackListStyle === 'dashes'}
                      onChange={(e) => updateTrackListStyle(e.target.value)}
                      className="mr-1"
                    />
                    <span>Dashes (- -)</span>
                  </label>
                  <label className="flex items-center cursor-pointer text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border">
                    <input
                      type="radio"
                      name="trackListStyle"
                      value="bullets"
                      checked={settings.design.trackListStyle === 'bullets'}
                      onChange={(e) => updateTrackListStyle(e.target.value)}
                      className="mr-1"
                    />
                    <span>Bullets (• •)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* 5. Track Duration */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <span className="text-purple-600 dark:text-purple-400">5.</span> Track Duration
            </h4>
            
            <div className="space-y-3">
              {/* Row 1: Font Family + Font Style */}
              <div className="grid grid-cols-2 gap-3">
                <FontFamilySelect
                  value={settings.design.fontFamilies?.trackDuration}
                  onChange={(e) => updateFontFamily('trackDuration', e.target.value)}
                  label="Font Family"
                  showGlobalLabel={true}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-xs"
                />
                
                <FontStyleCheckboxes
                  bold={settings.design.fontStyles?.trackDuration?.bold}
                  italic={settings.design.fontStyles?.trackDuration?.italic}
                  underline={settings.design.fontStyles?.trackDuration?.underline}
                  onBoldChange={(e) => updateFontStyle('trackDuration', 'bold', e.target.checked)}
                  onItalicChange={(e) => updateFontStyle('trackDuration', 'italic', e.target.checked)}
                  onUnderlineChange={(e) => updateFontStyle('trackDuration', 'underline', e.target.checked)}
                  label="Font Style"
                  showGlobalLabel={true}
                />
              </div>
              
              {/* Row 2: Font Size + Line Height + Letter Spacing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Font Size: <strong>{customization.trackDurationFontSize || 6}pt</strong>
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="10"
                    step="0.5"
                    value={customization.trackDurationFontSize || 6}
                    onChange={(e) => handleChange('trackDurationFontSize', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Line Height: <strong>{settings.design.lineHeights?.trackDuration}</strong> <span className="text-xs opacity-60">(global)</span>
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="2"
                    step="0.1"
                    value={settings.design.lineHeights?.trackDuration || 1.2}
                    onChange={(e) => updateLineHeight('trackDuration', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Letter Spacing: <strong>{settings.design.letterSpacing?.trackDuration}</strong> <span className="text-xs opacity-60">(global)</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.2"
                    step="0.01"
                    value={settings.design.letterSpacing?.trackDuration || 0}
                    onChange={(e) => updateLetterSpacing('trackDuration', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Success Summary */}
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-300 dark:border-green-700">
            <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
              ✅ Complete Typography Control!
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              All 5 back cover elements have Font Size (per-album), Font Family, Font Style (Bold/Italic/Underline), Line Height & Letter Spacing (global). Plus Track List prefix options!
            </p>
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

const stickerTitles = {
  spine: 'Spine Sticker',
  face: 'Face Sticker',
  front: 'Front Sticker',
  back: 'Back Sticker',
};

return (
  <div
    ref={panelRef}
    className="fixed bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden z-50"
    style={{
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.08)',
    }}
    onMouseEnter={() => onPanelHover?.(true)}
    onMouseLeave={() => onPanelHover?.(false)}
    onMouseDown={(e) => e.stopPropagation()}  // Stop mousedown from reaching document listener
  >
    {/* Header - Draggable */}
    <div
      className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 cursor-move flex justify-between items-center select-none border-b dark:border-gray-600"
      onMouseDown={handleDragStart}
    >
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
        <h3 className="font-semibold">{stickerTitles[stickerType]}</h3>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-2 py-1 transition-colors"
          title="Reset to defaults"
        >
          <FontAwesomeIcon icon={faRotateRight} className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-2 py-1 transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>
      </div>
    </div>
    
    {/* Content - Scrollable */}
    <div className="p-4 overflow-y-auto bg-white dark:bg-gray-800" style={{ height: 'calc(100% - 60px)' }}>
      {renderFields()}
    </div>
    
    {/* Resize Handle */}
    <div
      className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
      onMouseDown={handleResizeStart}
      style={{
        background: 'linear-gradient(135deg, transparent 0%, transparent 50%, #9ca3af 50%, #9ca3af 100%)',
      }}
    />
  </div>
);
};

export default StickerCustomizationPanel;
