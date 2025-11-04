import { useState, useEffect, useRef } from 'react';
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
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">🅰️ Typography</h3>
            
            <div>
              <label className="text-sm text-gray-600">Font Size: {customization.fontSize}pt</label>
              <input
                type="range"
                min="6"
                max="12"
                step="0.5"
                value={customization.fontSize}
                onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Letter Spacing: {customization.letterSpacing}</label>
              <input
                type="range"
                min="0"
                max="0.2"
                step="0.01"
                value={customization.letterSpacing}
                onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Line Height: {customization.lineHeight}</label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={customization.lineHeight}
                onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );
      
      case 'face':
        return (
          <>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">📸 Image</h3>
              
              <div>
                <label className="text-sm text-gray-600">🔍 Zoom: {customization.imageZoom}%</label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={customization.imageZoom}
                  onChange={(e) => handleChange('imageZoom', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">↔️ Position X: {customization.imageOffsetX}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={customization.imageOffsetX}
                  onChange={(e) => handleChange('imageOffsetX', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">↕️ Position Y: {customization.imageOffsetY}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={customization.imageOffsetY}
                  onChange={(e) => handleChange('imageOffsetY', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              <h3 className="font-semibold text-gray-700">🅰️ Typography</h3>
              
              <div>
                <label className="text-sm text-gray-600">Title Font Size: {customization.titleFontSize}pt</label>
                <input
                  type="range"
                  min="4"
                  max="8"
                  step="0.5"
                  value={customization.titleFontSize}
                  onChange={(e) => handleChange('titleFontSize', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Artist Font Size: {customization.artistFontSize}pt</label>
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="0.5"
                  value={customization.artistFontSize}
                  onChange={(e) => handleChange('artistFontSize', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Year Font Size: {customization.yearFontSize}pt</label>
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="0.5"
                  value={customization.yearFontSize}
                  onChange={(e) => handleChange('yearFontSize', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Letter Spacing: {customization.letterSpacing}</label>
                <input
                  type="range"
                  min="0"
                  max="0.1"
                  step="0.01"
                  value={customization.letterSpacing}
                  onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Line Height: {customization.lineHeight}</label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={customization.lineHeight}
                  onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </>
        );
      
      case 'front':
        return (
          <>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">📸 Image</h3>
              
              <div>
                <label className="text-sm text-gray-600">🔍 Zoom: {customization.imageZoom}%</label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={customization.imageZoom}
                  onChange={(e) => handleChange('imageZoom', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">↔️ Position X: {customization.imageOffsetX}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={customization.imageOffsetX}
                  onChange={(e) => handleChange('imageOffsetX', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">↕️ Position Y: {customization.imageOffsetY}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={customization.imageOffsetY}
                  onChange={(e) => handleChange('imageOffsetY', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              <h3 className="font-semibold text-gray-700">🅰️ Typography</h3>
              
              <div>
                <label className="text-sm text-gray-600">Title Font Size: {customization.titleFontSize}pt</label>
                <input
                  type="range"
                  min="4"
                  max="8"
                  step="0.5"
                  value={customization.titleFontSize}
                  onChange={(e) => handleChange('titleFontSize', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Artist Font Size: {customization.artistFontSize}pt</label>
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="0.5"
                  value={customization.artistFontSize}
                  onChange={(e) => handleChange('artistFontSize', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Year Font Size: {customization.yearFontSize}pt</label>
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="0.5"
                  value={customization.yearFontSize}
                  onChange={(e) => handleChange('yearFontSize', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Letter Spacing: {customization.letterSpacing}</label>
                <input
                  type="range"
                  min="0"
                  max="0.1"
                  step="0.01"
                  value={customization.letterSpacing}
                  onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            
            <div>
              <label className="text-sm text-gray-600">Line Height: {customization.lineHeight}</label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={customization.lineHeight}
                onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </>
      );
    
    case 'back':
      return (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">🅰️ Typography</h3>
          
          <div>
            <label className="text-sm text-gray-600">Track Font Size: {customization.trackFontSize}pt</label>
            <input
              type="range"
              min="3"
              max="6"
              step="0.5"
              value={customization.trackFontSize}
              onChange={(e) => handleChange('trackFontSize', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-600">Letter Spacing: {customization.letterSpacing}</label>
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.01"
              value={customization.letterSpacing}
              onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-600">Line Height: {customization.lineHeight}</label>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={customization.lineHeight}
              onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
              className="w-full"
            />
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
    className="fixed bg-white rounded-lg border-2 border-gray-300 overflow-hidden z-50"
    style={{
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.2)',
    }}
    onMouseEnter={() => onPanelHover?.(true)}
    onMouseLeave={() => onPanelHover?.(false)}
    onMouseDown={(e) => e.stopPropagation()}  // Stop mousedown from reaching document listener
  >
    {/* Header - Draggable */}
    <div
      className="bg-gray-100 text-gray-800 px-4 py-3 cursor-move flex justify-between items-center select-none border-b"
      onMouseDown={handleDragStart}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">⚙️</span>
        <h3 className="font-semibold">{stickerTitles[stickerType]}</h3>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          className="hover:bg-gray-200 rounded px-2 py-1 transition-colors text-lg"
          title="Reset to defaults"
        >
          🔄
        </button>
        <button
          onClick={onClose}
          className="hover:bg-gray-200 rounded px-2 py-1 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
    
    {/* Content - Scrollable */}
    <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
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
