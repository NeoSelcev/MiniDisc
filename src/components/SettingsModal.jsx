import { useEffect, useState, useRef } from 'react';
import useAppStore from '../store/useAppStore';

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
  
  const updateLineHeight = (field, value) => {
    updateSettings({
      ...settings,
      design: {
        ...settings.design,
        lineHeights: {
          ...settings.design.lineHeights,
          [field]: parseFloat(value) || 2,
        },
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
        className="absolute bg-white rounded-lg shadow-2xl overflow-hidden pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          minWidth: '400px',
          minHeight: '300px',
          maxWidth: '90vw',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Draggable */}
        <div 
          className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between cursor-move select-none"
          onMouseDown={handleDragStart}
        >
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="modal-content overflow-y-auto px-6 py-4 space-y-8" style={{ height: 'calc(100% - 120px)' }}>
            {/* Spotify Setup Help */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <span className="mr-2">🎵</span>
                Spotify Integration Setup
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>
                  <strong>How to get your Spotify token:</strong> The app will automatically generate one when you click "Connect Spotify".
                </p>
                <div className="bg-white rounded p-3 space-y-2">
                  <p className="font-medium text-blue-900">Quick Setup (3 steps):</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Create a Spotify app at <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">developer.spotify.com/dashboard</a></li>
                    <li>Set redirect URI to: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs break-all">http://127.0.0.1:5173/callback</code></li>
                    <li>Copy Client ID & Secret to the <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">.env</code> file</li>
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
                  <h4 className="font-medium mb-2">Edge Sticker (Spine)</h4>
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
                
                {/* Holder Front Part A */}
                <div className="border border-gray-200 rounded p-4">
                  <h4 className="font-medium mb-2">Holder Front - Part A</h4>
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
                
                {/* Holder Front Part B */}
                <div className="border border-gray-200 rounded p-4">
                  <h4 className="font-medium mb-2">Holder Front - Part B (Spine)</h4>
                  <div className="space-y-2">
                    <label className="block text-sm">
                      Width (mm) <span className="text-gray-500 text-xs">(Auto: matches Part A)</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography Settings</h3>
              
              {/* Helper component for typography row */}
              {[
                { key: 'spine', label: 'Holder Front Edge (Spine)' },
                { key: 'face', label: 'Disc Face (On Disc Edge)' },
                { key: 'holderBackTitle', label: 'Holder Back - Album Title' },
                { key: 'holderBackArtist', label: 'Holder Back - Artist' },
                { key: 'holderBackYear', label: 'Holder Back - Year' },
                { key: 'trackList', label: 'Holder Back - Track List', hasLineHeight: true },
              ].map(({ key, label, hasLineHeight }) => (
                <div key={key} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">{label}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Font Size */}
                    <label className="block text-sm">
                      Font Size (pt)
                      <input
                        type="number"
                        value={settings.design.fontSizes?.[key] || 8}
                        onChange={(e) => updateFontSize(key, e.target.value)}
                        className="mt-1 input-field w-full"
                        step="0.5"
                      />
                    </label>
                    
                    {/* Line Height - Only for Track List */}
                    {hasLineHeight && (
                      <label className="block text-sm">
                        Line Height (mm)
                        <input
                          type="number"
                          value={settings.design.lineHeights?.[key] || 2.5}
                          onChange={(e) => updateLineHeight(key, e.target.value)}
                          className="mt-1 input-field w-full"
                          step="0.1"
                          min="0"
                        />
                      </label>
                    )}
                    
                    {/* Font Styles */}
                    <div className="block text-sm">
                      <div className="text-sm mb-1">Font Style</div>
                      <div className="flex items-center space-x-3 mt-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.design.fontStyles?.[key]?.bold || false}
                            onChange={(e) => updateFontStyle(key, 'bold', e.target.checked)}
                            className="mr-1"
                          />
                          <span className="font-bold">B</span>
                        </label>
                        
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.design.fontStyles?.[key]?.italic || false}
                            onChange={(e) => updateFontStyle(key, 'italic', e.target.checked)}
                            className="mr-1"
                          />
                          <span className="italic">I</span>
                        </label>
                        
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.design.fontStyles?.[key]?.underline || false}
                            onChange={(e) => updateFontStyle(key, 'underline', e.target.checked)}
                            className="mr-1"
                          />
                          <span className="underline">U</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <p className="text-xs text-gray-600 mt-4">
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
