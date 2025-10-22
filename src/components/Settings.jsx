import { useEffect } from 'react';
import useAppStore from '../store/useAppStore';

function Settings({ isOpen, onClose }) {
  const { settings, updateSettings } = useAppStore();
  
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
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
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
  
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Settings</h2>
        
        {/* Spotify Setup Help */}
        <section className="mb-6 sm:mb-8 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center">
            <span className="mr-2">🎵</span>
            Spotify Integration Setup
          </h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-800">
            <p>
              <strong>How to get your Spotify token:</strong> You don't need to manually get a token! 
              The app will automatically generate one when you click "Connect Spotify".
            </p>
            <div className="bg-white rounded p-2 sm:p-3 space-y-2">
              <p className="font-medium text-blue-900">Quick Setup (3 steps):</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-xs sm:text-sm">
                <li>Create a Spotify app at <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">developer.spotify.com/dashboard</a></li>
                <li>Set redirect URI to: <code className="bg-gray-100 px-1 sm:px-2 py-0.5 rounded text-xs break-all">http://127.0.0.1:5173/callback</code></li>
                <li>Copy Client ID & Secret to the <code className="bg-gray-100 px-1 sm:px-2 py-0.5 rounded text-xs">.env</code> file</li>
              </ol>
            </div>
            <div className="flex items-start space-x-2 bg-yellow-50 border border-yellow-200 rounded p-2">
              <span className="text-yellow-600 flex-shrink-0">⚠️</span>
              <p className="text-yellow-800 text-xs">
                You'll see a "Redirect URI not secure" warning in Spotify Dashboard - this is normal for localhost development. Just click Save anyway!
              </p>
            </div>
            <p className="text-xs">
              📖 <strong>Detailed guide:</strong> See <code className="text-xs">HOW_TO_GET_SPOTIFY_TOKEN.md</code> in the project folder
            </p>
          </div>
        </section>
        
        {/* Sticker Dimensions */}
        <section className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Sticker Dimensions (mm)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Edge Sticker */}
            <div className="border border-gray-200 rounded p-3 sm:p-4">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Edge Sticker (Spine)</h4>
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm">
                  Width (mm)
                  <input
                    type="number"
                    value={localSettings.dimensions.edgeSticker.width}
                    onChange={(e) => updateDimension('edgeSticker', 'width', e.target.value)}
                    className="mt-1 input-field w-full text-sm"
                    min="5"
                    max="200"
                  />
                </label>
                <label className="block text-xs sm:text-sm">
                  Height (mm)
                  <input
                    type="number"
                    value={localSettings.dimensions.edgeSticker.height}
                    onChange={(e) => updateDimension('edgeSticker', 'height', e.target.value)}
                    className="mt-1 input-field w-full text-sm"
                    min="5"
                    max="200"
                  />
                </label>
              </div>
            </div>
            
            {/* Disc Face */}
            <div className="border border-gray-200 rounded p-3 sm:p-4">
              <h4 className="font-medium mb-2 text-sm sm:text-base">MiniDisc Face</h4>
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm">
                  Width (mm)
                  <input
                    type="number"
                    value={localSettings.dimensions.discFace.width}
                    onChange={(e) => updateDimension('discFace', 'width', e.target.value)}
                    className="mt-1 input-field w-full text-sm"
                    min="5"
                    max="200"
                  />
                </label>
                <label className="block text-xs sm:text-sm">
                  Height (mm)
                  <input
                    type="number"
                    value={localSettings.dimensions.discFace.height}
                    onChange={(e) => updateDimension('discFace', 'height', e.target.value)}
                    className="mt-1 input-field w-full text-sm"
                    min="5"
                    max="200"
                  />
                </label>
              </div>
            </div>
            
            {/* Holder Front Part A */}
            <div className="border border-gray-200 rounded p-3 sm:p-4">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Holder Front - Part A</h4>
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm">
                  Width (mm)
                  <input
                    type="number"
                    value={localSettings.dimensions.holderFrontPartA.width}
                    onChange={(e) => updateDimension('holderFrontPartA', 'width', e.target.value)}
                    className="mt-1 input-field w-full text-sm"
                    min="5"
                    max="200"
                  />
                </label>
                <label className="block text-xs sm:text-sm">
                  Height (mm)
                  <input
                    type="number"
                    value={localSettings.dimensions.holderFrontPartA.height}
                    onChange={(e) => updateDimension('holderFrontPartA', 'height', e.target.value)}
                    className="mt-1 input-field w-full text-sm"
                    min="5"
                    max="200"
                  />
                </label>
              </div>
            </div>
            
            {/* Holder Front Part B */}
            <div className="border border-gray-200 rounded p-3 sm:p-4">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Holder Front - Part B (Spine)</h4>
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm">
                  Width (mm)
                  <input
                    type="number"
                    value={localSettings.dimensions.holderFrontPartB.width}
                    onChange={(e) => updateDimension('holderFrontPartB', 'width', e.target.value)}
                    className="mt-1 input-field w-full text-sm"
                    min="5"
                    max="200"
                  />
                </label>
                <label className="block text-xs sm:text-sm">
                  Height (mm)
                  <input
                    type="number"
                    value={localSettings.dimensions.holderFrontPartB.height}
                    onChange={(e) => updateDimension('holderFrontPartB', 'height', e.target.value)}
                    className="mt-1 input-field w-full text-sm"
                    min="5"
                    max="200"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
        
        {/* Typography Settings */}
        <section className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Typography Settings</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <label className="block text-xs sm:text-sm">
              Spine Font Size (pt)
              <input
                type="number"
                value={localSettings.design.fontSizes.spine}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  design: {
                    ...localSettings.design,
                    fontSizes: {
                      ...localSettings.design.fontSizes,
                      spine: parseFloat(e.target.value) || 6,
                    },
                  },
                })}
                className="mt-1 input-field w-full text-sm"
                min="6"
                max="12"
                step="0.5"
              />
            </label>
            
            <label className="block text-xs sm:text-sm">
              Disc Face Title (pt)
              <input
                type="number"
                value={localSettings.design.fontSizes.discFace}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  design: {
                    ...localSettings.design,
                    fontSizes: {
                      ...localSettings.design.fontSizes,
                      discFace: parseFloat(e.target.value) || 6,
                    },
                  },
                })}
                className="mt-1 input-field w-full text-sm"
                min="6"
                max="16"
                step="0.5"
              />
            </label>
            
            <label className="block text-xs sm:text-sm">
              Disc Face Artist (pt)
              <input
                type="number"
                value={localSettings.design.fontSizes.discFaceArtist}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  design: {
                    ...localSettings.design,
                    fontSizes: {
                      ...localSettings.design.fontSizes,
                      discFaceArtist: parseFloat(e.target.value) || 6,
                    },
                  },
                })}
                className="mt-1 input-field w-full text-sm"
                min="6"
                max="14"
                step="0.5"
              />
            </label>
            
            <label className="block text-xs sm:text-sm">
              Cover Title (pt)
              <input
                type="number"
                value={localSettings.design.fontSizes.coverTitle}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  design: {
                    ...localSettings.design,
                    fontSizes: {
                      ...localSettings.design.fontSizes,
                      coverTitle: parseFloat(e.target.value) || 6,
                    },
                  },
                })}
                className="mt-1 input-field w-full text-sm"
                min="8"
                max="24"
                step="0.5"
              />
            </label>
            
            <label className="block text-xs sm:text-sm">
              Cover Artist (pt)
              <input
                type="number"
                value={localSettings.design.fontSizes.coverArtist}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  design: {
                    ...localSettings.design,
                    fontSizes: {
                      ...localSettings.design.fontSizes,
                      coverArtist: parseFloat(e.target.value) || 6,
                    },
                  },
                })}
                className="mt-1 input-field w-full text-sm"
                min="6"
                max="18"
                step="0.5"
              />
            </label>
            
            <label className="block text-xs sm:text-sm">
              Track List (pt)
              <input
                type="number"
                value={localSettings.design.fontSizes.trackList}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  design: {
                    ...localSettings.design,
                    fontSizes: {
                      ...localSettings.design.fontSizes,
                      trackList: parseFloat(e.target.value) || 6,
                    },
                  },
                })}
                className="mt-1 input-field w-full text-sm"
                min="6"
                max="12"
                step="0.5"
              />
            </label>
          </div>
          
          <div className="mt-4">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Typography Guidelines:</strong> Spine and track list text should be 6-8pt to fit within 3mm height. 
              Disc face text 8-12pt. Cover text can be larger (10-24pt).
            </p>
          </div>
        </section>
        
        {/* Print Settings */}
        <section className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Print Settings</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <label className="block text-xs sm:text-sm">
              DPI (Print Resolution)
              <input
                type="number"
                value={localSettings.print.dpi}
                onChange={(e) => updatePrintSetting('dpi', parseInt(e.target.value))}
                className="mt-1 input-field w-full text-sm"
                min="72"
                max="600"
              />
            </label>
            
            <label className="block text-xs sm:text-sm">
              Element Spacing (mm)
              <input
                type="number"
                value={localSettings.layout.elementSpacing}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  layout: {
                    ...localSettings.layout,
                    elementSpacing: parseFloat(e.target.value) || 0,
                  },
                })}
                className="mt-1 input-field w-full text-sm"
                min="0"
                max="10"
                step="0.5"
              />
            </label>
          </div>
          
          <div className="mt-3 sm:mt-4">
            <h4 className="font-medium mb-2 text-sm sm:text-base">Printer Margins (mm)</h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {['top', 'bottom', 'left', 'right'].map((side) => (
                <label key={side} className="block text-xs sm:text-sm capitalize">
                  {side}
                  <input
                    type="number"
                    value={localSettings.print.margins[side]}
                    onChange={(e) => updatePrintSetting(`margins.${side}`, parseFloat(e.target.value))}
                    className="mt-1 input-field w-full text-sm"
                    min="0"
                    max="20"
                    step="0.5"
                  />
                </label>
              ))}
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localSettings.print.cutLines.enabled}
                onChange={(e) => updatePrintSetting('cutLines.enabled', e.target.checked)}
                className="mr-2"
              />
              <span className="text-xs sm:text-sm">Enable cut lines</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localSettings.print.bleedMarks}
                onChange={(e) => updatePrintSetting('bleedMarks', e.target.checked)}
                className="mr-2"
              />
              <span className="text-xs sm:text-sm">Show margin guides</span>
            </label>
          </div>
        </section>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-red-600 border border-red-600 rounded hover:bg-red-50 transition"
          >
            Reset to Defaults
          </button>
          
          <div className="flex space-x-2">
            <a
              href="#main"
              className="flex-1 sm:flex-none text-center px-4 py-2 text-sm sm:text-base text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Cancel
            </a>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded hover:bg-primary-700 transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
