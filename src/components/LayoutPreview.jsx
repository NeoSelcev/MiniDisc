import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../store/useAppStore';
import { calculateLayout, getLayoutStats } from '../utils/layoutOptimizer';
import StickerPreview from './StickerPreview';
import './LayoutPreview.print.css';

function LayoutPreview() {
  const { albums, settings } = useAppStore();
  const [layout, setLayout] = useState(null);
  const [stats, setStats] = useState(null);
  const [isHydrated, setIsHydrated] = useState(() => useAppStore.persist?.hasHydrated?.() ?? false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasStableLayout, setHasStableLayout] = useState(false);

  useEffect(() => {
    if (useAppStore.persist?.hasHydrated?.()) {
      setIsHydrated(true);
    }
    const unsub = useAppStore.persist?.onFinishHydration?.(() => setIsHydrated(true));
    return () => unsub?.();
  }, []);
  
  useEffect(() => {
    if (!isHydrated) return;
    setHasStableLayout(false);
    setIsCalculating(true);
    if (albums.length > 0) {
      const newLayout = calculateLayout(albums, settings);
      const newStats = getLayoutStats(albums, settings);
      setLayout(newLayout);
      setStats(newStats);
    } else {
      setLayout(null);
      setStats(null);
    }
    const animation = requestAnimationFrame(() => setIsCalculating(false));
    return () => cancelAnimationFrame(animation);
  }, [albums, settings, isHydrated]);

  useEffect(() => {
    if (!isHydrated || isCalculating) {
      setHasStableLayout(false);
      return;
    }
    if (!layout) {
      setHasStableLayout(false);
      return;
    }
    const timer = setTimeout(() => setHasStableLayout(true), 180);
    return () => clearTimeout(timer);
  }, [layout, isCalculating, isHydrated]);
  
  const handlePrint = () => {
    if (!layout || !layout.fits) {
      alert('Cannot print - layout does not fit on page');
      return;
    }
    window.print();
  };
  
  const previewScale = 2;
  const a4Width = settings.paper.width * previewScale;
  const a4Height = settings.paper.height * previewScale;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full flex flex-col relative">
      {!isHydrated ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 animate-pulse">
            <p className="text-lg font-medium">Loading layout…</p>
            <p className="text-sm">Please wait while your project data loads.</p>
          </div>
        </div>
      ) : albums.length === 0 ? (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">No albums to preview</p>
            <p className="text-sm">Add albums from the left sidebar to see the layout</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative flex-1 overflow-auto bg-gray-100 p-8 rounded no-print">
            <div className="bg-white shadow-lg mx-auto relative" style={{ width: `${a4Width}px`, height: `${a4Height}px` }}>
              <div className="absolute top-0 left-0 right-0 bg-gray-400 bg-opacity-30 pointer-events-none z-10" style={{ height: `${settings.print.margins.top * previewScale}px` }} />
              <div className="absolute bottom-0 left-0 right-0 bg-gray-400 bg-opacity-30 pointer-events-none z-10" style={{ height: `${settings.print.margins.bottom * previewScale}px` }} />
              <div className="absolute top-0 bottom-0 left-0 bg-gray-400 bg-opacity-30 pointer-events-none z-10" style={{ width: `${settings.print.margins.left * previewScale}px` }} />
              <div className="absolute top-0 bottom-0 right-0 bg-gray-400 bg-opacity-30 pointer-events-none z-10" style={{ width: `${settings.print.margins.right * previewScale}px` }} />
              
              {settings.print.bleedMarks && (
                <div className="absolute border-2 border-dashed border-red-300 pointer-events-none z-20" style={{ left: `${settings.print.margins.left * previewScale}px`, top: `${settings.print.margins.top * previewScale}px`, right: `${settings.print.margins.right * previewScale}px`, bottom: `${settings.print.margins.bottom * previewScale}px` }} />
              )}
              
              {layout?.stickers.map((sticker) => (
                <StickerPreview key={sticker.id} sticker={sticker} scale={previewScale} showCutLines={settings.print.cutLines.enabled} showLabels={settings.print.showLabels} settings={settings} />
              ))}
              
              {!layout?.fits && hasStableLayout && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-20">
                  <div className="bg-red-600 text-white px-4 py-2 rounded shadow-lg">
                    Layout overflow - reduce albums or adjust dimensions
                  </div>
                </div>
              )}
            </div>
            
            {stats && (
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 max-w-xs z-20">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Layout Preview</h2>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center"><span className="font-medium mr-2">Albums:</span><span>{stats.currentSets}</span></div>
                  <div className="flex items-center"><span className="font-medium mr-2">Stickers:</span><span>{stats.placedStickers}/{stats.totalStickers}</span></div>
                  <div className="flex items-center"><span className="font-medium mr-2">Efficiency:</span><span>{stats.efficiency.toFixed(1)}%</span></div>
                  <div className={`flex items-center font-medium ${stats.fitsOnPage ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{stats.fitsOnPage ? 'All stickers fit' : `${stats.failedStickers} dont fit`}</div>
                </div>
              </div>
            )}
            
            <button onClick={handlePrint} disabled={!layout || !layout.fits} className="absolute bottom-4 right-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2 z-30" title="Print layout">
              <FontAwesomeIcon icon={faPrint} className="h-5 w-5" />
              <span>Print</span>
            </button>
          </div>
          
          <div className="print-only" style={{ display: 'none' }}>
            <div style={{ width: '210mm', height: '297mm', position: 'relative', background: 'white' }}>
              {layout?.stickers.map((sticker) => (
                <StickerPreview key={`print-${sticker.id}`} sticker={sticker} scale={previewScale} showCutLines={settings.print.cutLines.enabled} showLabels={false} settings={settings} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LayoutPreview;
