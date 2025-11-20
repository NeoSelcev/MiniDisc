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
  LineHeightLetterSpacingGrid,
  TypographySection,
  ResetButton,
  TrackPrefixStyleSelector,
  TypographySectionWithHeader,
  ImageSettingsSection
} from './TypographyControls';

const StickerCustomizationPanel = ({ album, stickerType, onClose, position: initialPosition, onPanelHover }) => {
  const { getStickerCustomization, updateStickerCustomization, getTypographyDefaults } = useAppStore();
  
  // Get initial values (album-specific or defaults)
  const initialCustomization = getStickerCustomization(album, stickerType);
  
  // Local state for live preview
  const [customization, setCustomization] = useState(initialCustomization);
  
  // Draggable state
  const [position, setPosition] = useState(initialPosition || { x: 20, y: 100 });
  const [size, setSize] = useState({ width: 480, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const panelRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
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
  
  // Reset individual typography section to defaults
  const createSectionReset = (section, properties) => {
    return () => {
      const defaults = getTypographyDefaults(stickerType, section);
      const updated = { ...customization };
      
      // Apply default values for all properties in this section
      properties.forEach(prop => {
        const defaultKey = prop.replace(/^(title|artist|year|trackList|trackDuration)/, '');
        const key = defaultKey.charAt(0).toLowerCase() + defaultKey.slice(1);
        if (defaults[key] !== undefined) {
          updated[prop] = defaults[key];
        }
      });
      
      setCustomization(updated);
      updateStickerCustomization(album.id, stickerType, updated);
    };
  };
  
  // Individual section reset handlers
  const handleResetTitle = createSectionReset('title', [
    'titleFontFamily', 'titleFontBold', 'titleFontItalic', 'titleFontUnderline',
    'titleFontSize', 'titleLineHeight', 'titleLetterSpacing'
  ]);
  
  const handleResetArtist = createSectionReset('artist', [
    'artistFontFamily', 'artistFontBold', 'artistFontItalic', 'artistFontUnderline',
    'artistFontSize', 'artistLineHeight', 'artistLetterSpacing'
  ]);
  
  const handleResetYear = createSectionReset('year', [
    'yearFontFamily', 'yearFontBold', 'yearFontItalic', 'yearFontUnderline',
    'yearFontSize', 'yearLineHeight', 'yearLetterSpacing'
  ]);
  
  const handleResetTrackList = createSectionReset('trackList', [
    'trackListFontFamily', 'trackListFontBold', 'trackListFontItalic', 'trackListFontUnderline',
    'trackListFontSize', 'trackListLineHeight', 'trackListLetterSpacing'
  ]);
  
  // Reset track prefix style to default
  const handleResetTrackPrefix = () => {
    // Ensure the trackListStyle is explicitly set to 'numbers' in the state
    const updated = { ...customization, trackListStyle: 'numbers' };
    setCustomization(updated);
    updateStickerCustomization(album.id, stickerType, updated);
  };
  
  const handleResetDuration = createSectionReset('trackDuration', [
    'trackDurationFontFamily', 'trackDurationFontBold', 'trackDurationFontItalic', 'trackDurationFontUnderline',
    'trackDurationFontSize', 'trackDurationLineHeight', 'trackDurationLetterSpacing'
  ]);
  
  // Reset handlers for spine and front edge part
  const handleResetSpine = createSectionReset('spine', [
    'spineFontFamily', 'spineFontBold', 'spineFontItalic', 'spineFontUnderline',
    'fontSize', 'lineHeight', 'letterSpacing'
  ]);
  
  const handleResetEdgePart = createSectionReset('edgePart', [
    'edgePartFontFamily', 'edgePartFontBold', 'edgePartFontItalic', 'edgePartFontUnderline',
    'titleFontSize', 'lineHeight', 'letterSpacing'
  ]);
  
  // Reset handlers for image settings
  const handleResetImageSettings = () => {
    const defaults = getTypographyDefaults(stickerType);
    const updated = { 
      ...customization, 
      imageZoom: defaults.imageZoom || 100,
      imageOffsetX: defaults.imageOffsetX || 0,
      imageOffsetY: defaults.imageOffsetY || 0
    };
    setCustomization(updated);
    updateStickerCustomization(album.id, stickerType, updated);
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
            <div className="text-sm text-gray-800 dark:text-gray-200">
              <div className="font-semibold">{album.albumName}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{album.artistName} • {album.year}</div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                Sticker Dimensions
              </p>
              <ul className="text-xs text-gray-700 dark:text-gray-400 space-y-0.5">
                <li>• Vertical text on disc edge</li>
                <li>• <strong>58×3 mm</strong></li>
              </ul>
            </div>
            
            <TypographySectionWithHeader
              sectionNumber="🅰️"
              title="Text Settings"
              values={{
                fontFamily: customization.spineFontFamily,
                fontBold: customization.spineFontBold,
                fontItalic: customization.spineFontItalic,
                fontUnderline: customization.spineFontUnderline,
                fontSize: customization.fontSize,
                lineHeight: customization.lineHeight,
                letterSpacing: customization.letterSpacing
              }}
              handlers={{
                onFontFamilyChange: (e) => handleChange('spineFontFamily', e.target.value),
                onBoldChange: (e) => handleChange('spineFontBold', e.target.checked),
                onItalicChange: (e) => handleChange('spineFontItalic', e.target.checked),
                onUnderlineChange: (e) => handleChange('spineFontUnderline', e.target.checked),
                onFontSizeChange: (e) => handleChange('fontSize', parseFloat(e.target.value)),
                onLineHeightChange: (e) => handleChange('lineHeight', parseFloat(e.target.value)),
                onLetterSpacingChange: (e) => handleChange('letterSpacing', parseFloat(e.target.value))
              }}
              onReset={handleResetSpine}
              config={{
                fontSizeMin: 6,
                fontSizeMax: 12,
                fontSizeStep: 0.5
              }}
            />
          </div>
        );
      
      case 'face':
        // Face sticker shows only the disc cover image
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-800 dark:text-gray-200">
              <div className="font-semibold">{album.albumName}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{album.artistName} • {album.year}</div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">
                Sticker Dimensions
              </p>
              <ul className="text-xs text-gray-700 dark:text-gray-400 space-y-0.5">
                <li>• Album cover image on disc surface</li>
                <li>• <strong>36×53 mm</strong></li>
              </ul>
            </div>
            
            <ImageSettingsSection
              sectionNumber="🔍"
              title="Image Settings"
              values={{
                imageZoom: customization.imageZoom,
                imageOffsetX: customization.imageOffsetX,
                imageOffsetY: customization.imageOffsetY
              }}
              handlers={{
                onZoomChange: (e) => handleChange('imageZoom', parseInt(e.target.value)),
                onOffsetXChange: (e) => handleChange('imageOffsetX', parseInt(e.target.value)),
                onOffsetYChange: (e) => handleChange('imageOffsetY', parseInt(e.target.value))
              }}
              onReset={handleResetImageSettings}
              config={{
                zoomMin: 50,
                zoomMax: 300,
                zoomStep: 5,
                offsetMin: -50,
                offsetMax: 50,
                offsetStep: 1
              }}
            />
          </div>
        );
      
      case 'front':
        // Front sticker has Image Part (cover image) and Edge Part (folded spine text)
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-800 dark:text-gray-200">
              <div className="font-semibold">{album.albumName}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{album.artistName} • {album.year}</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
              <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">
                Sticker Dimensions
              </p>
              <ul className="text-xs text-gray-700 dark:text-gray-400 space-y-0.5">
                <li>• <strong>Image Part:</strong> Cover image — <strong>68×65 mm</strong></li>
                <li>• <strong>Edge Part:</strong> Folded spine text — <strong>68×3 mm</strong></li>
              </ul>
            </div>
            
            {/* Image Part - Image Settings */}
            <ImageSettingsSection
              sectionNumber="🖼️"
              title="Image Part - Image Settings"
              values={{
                imageZoom: customization.imageZoom,
                imageOffsetX: customization.imageOffsetX,
                imageOffsetY: customization.imageOffsetY
              }}
              handlers={{
                onZoomChange: (e) => handleChange('imageZoom', parseInt(e.target.value)),
                onOffsetXChange: (e) => handleChange('imageOffsetX', parseInt(e.target.value)),
                onOffsetYChange: (e) => handleChange('imageOffsetY', parseInt(e.target.value))
              }}
              onReset={handleResetImageSettings}
              config={{
                zoomMin: 50,
                zoomMax: 300,
                zoomStep: 5,
                offsetMin: -50,
                offsetMax: 50,
                offsetStep: 1
              }}
            />
            
            {/* Edge Part - Text Settings for Folded Spine */}
            <div className="pt-3 border-t dark:border-gray-600">
              <TypographySectionWithHeader
                sectionNumber="🅰️"
                title="Edge Part (Spine) - Text Settings"
                values={{
                  fontFamily: customization.edgePartFontFamily,
                  fontBold: customization.edgePartFontBold,
                  fontItalic: customization.edgePartFontItalic,
                  fontUnderline: customization.edgePartFontUnderline,
                  fontSize: customization.titleFontSize,
                  lineHeight: customization.lineHeight,
                  letterSpacing: customization.letterSpacing
                }}
                handlers={{
                  onFontFamilyChange: (e) => handleChange('edgePartFontFamily', e.target.value),
                  onBoldChange: (e) => handleChange('edgePartFontBold', e.target.checked),
                  onItalicChange: (e) => handleChange('edgePartFontItalic', e.target.checked),
                  onUnderlineChange: (e) => handleChange('edgePartFontUnderline', e.target.checked),
                  onFontSizeChange: (e) => handleChange('titleFontSize', parseFloat(e.target.value)),
                  onLineHeightChange: (e) => handleChange('lineHeight', parseFloat(e.target.value)),
                  onLetterSpacingChange: (e) => handleChange('letterSpacing', parseFloat(e.target.value))
                }}
                onReset={handleResetEdgePart}
                config={{
                  fontSizeMin: 4,
                  fontSizeMax: 8,
                  fontSizeStep: 0.5
                }}
              />
            </div>
          </div>
        );
    
    case 'back':
      // Back sticker shows album title, artist, year, and track list
      return (
        <div className="space-y-4">
          <div className="text-sm text-gray-800 dark:text-gray-200">
            <div className="font-semibold">{album.albumName}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{album.artistName} • {album.year}</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded border-2 border-purple-300 dark:border-purple-700">
            <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">
              Sticker Dimensions
            </p>
            <ul className="text-xs text-gray-700 dark:text-gray-400 space-y-0.5">
              <li>• Track list with album info</li>
              <li>• <strong>68×58 mm</strong></li>
            </ul>
          </div>
          
          {/* 1. Album Title */}
          <TypographySectionWithHeader
            sectionNumber="1"
            title="Album Title"
            values={{
              fontFamily: customization.titleFontFamily,
              fontBold: customization.titleFontBold,
              fontItalic: customization.titleFontItalic,
              fontUnderline: customization.titleFontUnderline,
              fontSize: customization.titleFontSize,
              lineHeight: customization.titleLineHeight,
              letterSpacing: customization.titleLetterSpacing
            }}
            handlers={{
              onFontFamilyChange: (e) => handleChange('titleFontFamily', e.target.value),
              onBoldChange: (e) => handleChange('titleFontBold', e.target.checked),
              onItalicChange: (e) => handleChange('titleFontItalic', e.target.checked),
              onUnderlineChange: (e) => handleChange('titleFontUnderline', e.target.checked),
              onFontSizeChange: (e) => handleChange('titleFontSize', parseFloat(e.target.value)),
              onLineHeightChange: (e) => handleChange('titleLineHeight', parseFloat(e.target.value)),
              onLetterSpacingChange: (e) => handleChange('titleLetterSpacing', parseFloat(e.target.value))
            }}
            onReset={handleResetTitle}
            config={{
              fontSizeMin: 8,
              fontSizeMax: 20,
              fontSizeStep: 0.5
            }}
          />
          
          {/* 2. Artist Name */}
          <TypographySectionWithHeader
            sectionNumber="2"
            title="Artist Name"
            values={{
              fontFamily: customization.artistFontFamily,
              fontBold: customization.artistFontBold,
              fontItalic: customization.artistFontItalic,
              fontUnderline: customization.artistFontUnderline,
              fontSize: customization.artistFontSize,
              lineHeight: customization.artistLineHeight,
              letterSpacing: customization.artistLetterSpacing
            }}
            handlers={{
              onFontFamilyChange: (e) => handleChange('artistFontFamily', e.target.value),
              onBoldChange: (e) => handleChange('artistFontBold', e.target.checked),
              onItalicChange: (e) => handleChange('artistFontItalic', e.target.checked),
              onUnderlineChange: (e) => handleChange('artistFontUnderline', e.target.checked),
              onFontSizeChange: (e) => handleChange('artistFontSize', parseFloat(e.target.value)),
              onLineHeightChange: (e) => handleChange('artistLineHeight', parseFloat(e.target.value)),
              onLetterSpacingChange: (e) => handleChange('artistLetterSpacing', parseFloat(e.target.value))
            }}
            onReset={handleResetArtist}
            config={{
              fontSizeMin: 6,
              fontSizeMax: 16,
              fontSizeStep: 0.5
            }}
          />
          
          {/* 3. Year of Production */}
          <TypographySectionWithHeader
            sectionNumber="3"
            title="Year of Production"
            values={{
              fontFamily: customization.yearFontFamily,
              fontBold: customization.yearFontBold,
              fontItalic: customization.yearFontItalic,
              fontUnderline: customization.yearFontUnderline,
              fontSize: customization.yearFontSize,
              lineHeight: customization.yearLineHeight,
              letterSpacing: customization.yearLetterSpacing
            }}
            handlers={{
              onFontFamilyChange: (e) => handleChange('yearFontFamily', e.target.value),
              onBoldChange: (e) => handleChange('yearFontBold', e.target.checked),
              onItalicChange: (e) => handleChange('yearFontItalic', e.target.checked),
              onUnderlineChange: (e) => handleChange('yearFontUnderline', e.target.checked),
              onFontSizeChange: (e) => handleChange('yearFontSize', parseFloat(e.target.value)),
              onLineHeightChange: (e) => handleChange('yearLineHeight', parseFloat(e.target.value)),
              onLetterSpacingChange: (e) => handleChange('yearLetterSpacing', parseFloat(e.target.value))
            }}
            onReset={handleResetYear}
            config={{
              fontSizeMin: 6,
              fontSizeMax: 14,
              fontSizeStep: 0.5
            }}
          />
          
          {/* 4. Track Prefix Style */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-purple-600 dark:text-purple-400">4.</span> Track Prefix Style
              </div>
              <ResetButton onReset={handleResetTrackPrefix} title="Reset Track Prefix style" />
            </h4>
            
            <TrackPrefixStyleSelector
              value={customization.trackListStyle || 'numbers'}
              onChange={(value) => handleChange('trackListStyle', value)}
              name={`trackListStyle-${album.id}`}
            />
          </div>
          
          {/* 5. Track List (Track Names) */}
          <TypographySectionWithHeader
            sectionNumber="5"
            title="Track List (Track Names)"
            values={{
              fontFamily: customization.trackListFontFamily,
              fontBold: customization.trackListFontBold,
              fontItalic: customization.trackListFontItalic,
              fontUnderline: customization.trackListFontUnderline,
              fontSize: customization.trackListFontSize,
              lineHeight: customization.trackListLineHeight,
              letterSpacing: customization.trackListLetterSpacing
            }}
            handlers={{
              onFontFamilyChange: (e) => handleChange('trackListFontFamily', e.target.value),
              onBoldChange: (e) => handleChange('trackListFontBold', e.target.checked),
              onItalicChange: (e) => handleChange('trackListFontItalic', e.target.checked),
              onUnderlineChange: (e) => handleChange('trackListFontUnderline', e.target.checked),
              onFontSizeChange: (e) => handleChange('trackListFontSize', parseFloat(e.target.value)),
              onLineHeightChange: (e) => handleChange('trackListLineHeight', parseFloat(e.target.value)),
              onLetterSpacingChange: (e) => handleChange('trackListLetterSpacing', parseFloat(e.target.value))
            }}
            onReset={handleResetTrackList}
            config={{
              fontSizeMin: 3,
              fontSizeMax: 10,
              fontSizeStep: 0.5
            }}
          />
          
          {/* 6. Track Duration */}
          <TypographySectionWithHeader
            sectionNumber="6"
            title="Track Duration"
            values={{
              fontFamily: customization.trackDurationFontFamily,
              fontBold: customization.trackDurationFontBold,
              fontItalic: customization.trackDurationFontItalic,
              fontUnderline: customization.trackDurationFontUnderline,
              fontSize: customization.trackDurationFontSize || 6,
              lineHeight: customization.trackDurationLineHeight,
              letterSpacing: customization.trackDurationLetterSpacing
            }}
            handlers={{
              onFontFamilyChange: (e) => handleChange('trackDurationFontFamily', e.target.value),
              onBoldChange: (e) => handleChange('trackDurationFontBold', e.target.checked),
              onItalicChange: (e) => handleChange('trackDurationFontItalic', e.target.checked),
              onUnderlineChange: (e) => handleChange('trackDurationFontUnderline', e.target.checked),
              onFontSizeChange: (e) => handleChange('trackDurationFontSize', parseFloat(e.target.value)),
              onLineHeightChange: (e) => handleChange('trackDurationLineHeight', parseFloat(e.target.value)),
              onLetterSpacingChange: (e) => handleChange('trackDurationLetterSpacing', parseFloat(e.target.value))
            }}
            onReset={handleResetDuration}
            config={{
              fontSizeMin: 4,
              fontSizeMax: 10,
              fontSizeStep: 0.5
            }}
          />
        </div>
      );
    
    default:
      return null;
  }
};

const stickerTitles = {
  spine: 'Disc Edge (Spine) Sticker',
  face: 'Disc Face Sticker',
  front: 'Holder Front Cover Sticker',
  back: 'Holder Back Cover Sticker',
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
    <div ref={scrollContainerRef} className="p-4 overflow-y-auto bg-white dark:bg-gray-800" style={{ height: 'calc(100% - 60px)' }}>
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
