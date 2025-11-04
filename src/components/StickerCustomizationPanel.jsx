import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCog, faXmark, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../store/useAppStore';

const StickerCustomizationPanel = ({ album, stickerType, onClose, position: initialPosition, onPanelHover }) => {
  const { getStickerCustomization, updateStickerCustomization } = useAppStore();
  
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
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                  Letter Spacing: <strong>{customization.letterSpacing}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.1"
                  step="0.01"
                  value={customization.letterSpacing}
                  onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>0</span>
                  <span>0.1</span>
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
    
    case 'back':
      // Back sticker shows album title, artist, year, and track list
      return (
        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-200 dark:border-orange-800">
            <p className="text-xs text-orange-800 dark:text-orange-300">
              <strong>Holder Back (Track List)</strong><br/>
              Displays album title, artist, year, and complete track listing
            </p>
          </div>
          
          {/* Album Info Text Settings */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 border-b pb-2 dark:border-gray-600">
              <span className="text-lg">📄</span> Album Info
            </h3>
            
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                Title Font Size: <strong>{customization.titleFontSize}pt</strong>
              </label>
              <input
                type="range"
                min="8"
                max="16"
                step="0.5"
                value={customization.titleFontSize}
                onChange={(e) => handleChange('titleFontSize', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                <span>8pt</span>
                <span>16pt</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                Artist Font Size: <strong>{customization.artistFontSize}pt</strong>
              </label>
              <input
                type="range"
                min="6"
                max="12"
                step="0.5"
                value={customization.artistFontSize}
                onChange={(e) => handleChange('artistFontSize', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                <span>6pt</span>
                <span>12pt</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                Year Font Size: <strong>{customization.yearFontSize}pt</strong>
              </label>
              <input
                type="range"
                min="6"
                max="12"
                step="0.5"
                value={customization.yearFontSize}
                onChange={(e) => handleChange('yearFontSize', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                <span>6pt</span>
                <span>12pt</span>
              </div>
            </div>
          </div>
          
          {/* Track List Settings */}
          <div className="space-y-3 pt-3 border-t dark:border-gray-600">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span className="text-lg">📃</span> Track List
            </h3>
            
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                Track Font Size: <strong>{customization.trackListFontSize}pt</strong>
              </label>
              <input
                type="range"
                min="3"
                max="8"
                step="0.5"
                value={customization.trackListFontSize}
                onChange={(e) => handleChange('trackListFontSize', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                <span>3pt</span>
                <span>8pt</span>
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
            
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                Letter Spacing: <strong>{customization.letterSpacing}</strong>
              </label>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.01"
                value={customization.letterSpacing}
                onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                <span>0</span>
                <span>0.1</span>
              </div>
            </div>
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
