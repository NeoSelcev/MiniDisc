import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../store/useAppStore';
import StickerCustomizationPanel from './StickerCustomizationPanel';

function StickerPreview({ dimensions, position, sticker, showLabels = false, scale, showCutLines, settings }) {
  const { x, y, width, height, type: stickerType, data } = sticker;
  const [isHovered, setIsHovered] = useState(false);
  const [isPanelHovered, setIsPanelHovered] = useState(false);
  
  const activeCustomizationPanel = useAppStore((state) => state.activeCustomizationPanel);
  const openCustomizationPanel = useAppStore((state) => state.openCustomizationPanel);
  const closeCustomizationPanel = useAppStore((state) => state.closeCustomizationPanel);
  
  // Subscribe to albums array to trigger re-render when customization changes
  const albums = useAppStore((state) => state.albums);
  const getStickerCustomization = useAppStore((state) => state.getStickerCustomization);
  
  // Get current album with latest customization
  const currentAlbum = albums.find(a => a.id === data.id) || data;
  
  // Check if THIS sticker's customization panel is open
  const isThisPanelOpen = activeCustomizationPanel?.albumId === data.id && activeCustomizationPanel?.stickerType === stickerType;
  
  // Check if ANY panel is open (for dimming other stickers)
  const isAnyPanelOpen = activeCustomizationPanel !== null;
  
  // Reset isPanelHovered when panel closes
  useEffect(() => {
    if (!isThisPanelOpen) {
      setIsPanelHovered(false);
    }
  }, [isThisPanelOpen]);
  
  // Get customization for this specific album and sticker type
  const customization = getStickerCustomization(currentAlbum, stickerType);
  
  const pixelX = x * scale;
  const pixelY = y * scale;
  const pixelWidth = width * scale;
  const pixelHeight = height * scale;
  
  const renderSticker = () => {
    switch (stickerType) {
      case 'spine':
        return renderSpine();
      case 'face':
        return renderFace();
      case 'front':
        return renderFront();
      case 'back':
        return renderBack();
      // Legacy support for old layout
      case 'frontA':
        return renderFront();
      case 'frontB':
        return null; // No longer used (combined with frontA)
      case 'frontFolded':
        return renderFront();
      default:
        return null;
    }
  };
  
  const renderSpine = () => {
    const spineStyle = settings.design.fontStyles?.spine || {};
    const fontFamily = settings.design.fontFamilies?.spine || 'Arial';
    const lineHeight = customization.lineHeight || settings.design.lineHeights?.spine || 1.2;
    const fontSize = customization.fontSize || settings.design.fontSizes?.spine || 8;
    
    return (
      <div
        className="flex items-center justify-center text-xs overflow-hidden border-2 border-blue-500"
        style={{
          backgroundColor: data.colors?.dominant || '#e0e0e0',
          color: data.colors?.fontColor || '#000',
          padding: '1px',
          fontSize: `${fontSize}pt`,
          fontFamily: fontFamily,
          lineHeight: lineHeight,
          fontWeight: spineStyle.bold ? 'bold' : 'normal',
          fontStyle: spineStyle.italic ? 'italic' : 'normal',
          textDecoration: spineStyle.underline ? 'underline' : 'none',
        }}
      >
        <span className="truncate">{data.albumName}</span>
      </div>
    );
  };
  
  const renderFace = () => {
    // Restore: Only show the album cover image, no text
    if (!data.coverImage) {
      return (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
          Disc Cover
        </div>
      );
    }
    
    const zoom = customization.imageZoom || 100;
    const offsetX = customization.imageOffsetX || 0;
    const offsetY = customization.imageOffsetY || 0;
    
    return (
      <div className="w-full h-full overflow-hidden" style={{ backgroundColor: data.colors?.dominant || '#e0e0e0' }}>
        <img
          src={data.coverImage}
          alt={data.albumName}
          style={{
            width: `${zoom}%`,
            height: `${zoom}%`,
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            margin: 0,
            padding: 0,
            minWidth: `${zoom}%`,
            minHeight: `${zoom}%`,
            transform: `translate(${offsetX}px, ${offsetY}px)`,
          }}
        />
      </div>
    );
  };
  
  const renderFront = () => {
    // Combined front cover with fold line
    // Part A (main cover) is at top, Part B (fold strip) is at bottom
    const partAHeight = sticker.parts?.partA?.height || (height - 3); // 65mm
    const partBHeight = sticker.parts?.partB?.height || 3; // 3mm fold
    const partAHeightPercent = (partAHeight / height) * 100;
    const partBHeightPercent = (partBHeight / height) * 100;
    
    const zoom = customization.imageZoom || 100;
    const offsetX = customization.imageOffsetX || 0;
    const offsetY = customization.imageOffsetY || 0;
    const titleSize = customization.titleFontSize || settings.design.fontSizes?.spine || 8;
    
    return (
      <div className="w-full h-full flex flex-col">
        {/* Part A - Main cover image */}
        <div className="w-full overflow-hidden" style={{ height: `${partAHeightPercent}%`, backgroundColor: data.colors?.dominant || '#e0e0e0' }}>
          {data.coverImage ? (
            <img
              src={data.coverImage}
              alt={data.albumName}
              style={{ 
                width: `${zoom}%`,
                height: `${zoom}%`,
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                transform: `translate(${offsetX}px, ${offsetY}px)`,
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
              Cover
            </div>
          )}
        </div>
        
        {/* Fold line */}
        <div className="w-full border-t-2 border-dashed border-gray-400" style={{ height: '1px' }}></div>
        
        {/* Part B - Fold strip with album info */}
        <div
          className="w-full flex items-center justify-center text-xs font-medium overflow-hidden"
          style={{
            height: `${partBHeightPercent}%`,
            backgroundColor: data.colors?.dominant || '#e0e0e0',
            color: data.colors?.fontColor || '#000',
            padding: '1px',
            fontSize: `${titleSize}pt`,
          }}
        >
          <span className="truncate">
            {data.albumName} - {data.artistName}
          </span>
        </div>
      </div>
    );
  };
  
  const renderBack = () => {
    const fontSize = customization.trackListFontSize || settings.design.fontSizes?.trackList || 8;
    const titleSize = customization.titleFontSize || settings.design.fontSizes?.holderBackTitle || 14;
    const artistSize = customization.artistFontSize || settings.design.fontSizes?.holderBackArtist || 10;
    const yearSize = customization.yearFontSize || settings.design.fontSizes?.holderBackYear || 9;
    const lineHeight = customization.lineHeight || settings.design.lineHeights?.trackList || 1.2;
    
    const titleStyle = settings.design.fontStyles?.holderBackTitle || {};
    const artistStyle = settings.design.fontStyles?.holderBackArtist || {};
    const yearStyle = settings.design.fontStyles?.holderBackYear || {};
    const trackStyle = settings.design.fontStyles?.trackList || {};
    
    const titleFont = settings.design.fontFamilies?.holderBackTitle || 'Arial';
    const artistFont = settings.design.fontFamilies?.holderBackArtist || 'Arial';
    const yearFont = settings.design.fontFamilies?.holderBackYear || 'Arial';
    const trackFont = settings.design.fontFamilies?.trackList || 'Arial';
    
    const titleLineHeight = settings.design.lineHeights?.holderBackTitle || 1.2;
    const artistLineHeight = settings.design.lineHeights?.holderBackArtist || 1.2;
    const yearLineHeight = settings.design.lineHeights?.holderBackYear || 1.2;
    
    const getFontStyleCSS = (style) => ({
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
    });
    
    return (
      <div className="w-full h-full bg-white p-1 overflow-hidden" style={{ fontSize: `${fontSize}pt` }}>
        {/* Album info */}
        <div 
          className="truncate" 
          style={{ 
            fontSize: `${titleSize}pt`,
            fontFamily: titleFont,
            lineHeight: titleLineHeight,
            ...getFontStyleCSS(titleStyle),
          }}
        >
          {data.albumName}
        </div>
        <div 
          className="flex justify-between items-baseline"
          style={{ 
            fontSize: `${artistSize}pt`,
          }}
        >
          <span 
            className="text-gray-700 truncate flex-1" 
            style={{
              fontFamily: artistFont,
              lineHeight: artistLineHeight,
              ...getFontStyleCSS(artistStyle)
            }}
          >
            {data.artistName}
          </span>
          <span 
            className="ml-2 text-gray-600" 
            style={{ 
              fontSize: `${yearSize}pt`,
              fontFamily: yearFont,
              lineHeight: yearLineHeight,
              ...getFontStyleCSS(yearStyle),
            }}
          >
            {data.year}
          </span>
        </div>
        
        {/* Track list */}
        <div className="space-y-0.5 mt-1" style={{ lineHeight }}>
          {data.tracks?.slice(0, 15).map((track) => (
            <div 
              key={track.number} 
              className="flex justify-between truncate"
              style={{
                fontFamily: trackFont,
                ...getFontStyleCSS(trackStyle)
              }}
            >
              <span className="truncate flex-1">
                {track.number}. {track.name}
              </span>
              <span className="ml-2 text-gray-600">
                {formatDuration(track.duration)}
              </span>
            </div>
          ))}
          
          {data.tracks && data.tracks.length > 15 && (
            <div className="italic text-gray-500">
              ... and {data.tracks.length - 15} more
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Apply rotation transform if needed
  // For 90-degree rotation, the layout optimizer has already swapped width/height
  // We need to create a container with the ROTATED dimensions and rotate the content inside
  let transform = 'none';
  let transformOrigin = 'top left';
  let contentWidth = pixelWidth;
  let contentHeight = pixelHeight;
  
  if (sticker.rotation === 90) {
    // When rotated, the container has swapped dimensions (width/height already swapped by optimizer)
    // But the content inside needs to be rotated and positioned correctly
    // Use original dimensions for the rotated content
    contentWidth = pixelHeight;  // Content width is container height
    contentHeight = pixelWidth;   // Content height is container width
    transform = `rotate(90deg) translateY(-100%)`;
    transformOrigin = 'top left';
  } else if (sticker.rotation) {
    transform = `rotate(${sticker.rotation}deg)`;
  }
  
  return (
    <div
      className="absolute sticker-preview group"
      style={{
        left: `${pixelX}px`,
        top: `${pixelY}px`,
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
        border: showCutLines ? '1px dashed #999' : 'none',
        overflow: 'visible', // Changed from 'hidden' to 'visible' to allow rotated content to display
        opacity: isAnyPanelOpen ? (isThisPanelOpen ? 1 : 0.3) : 1,
        transition: 'opacity 0.2s ease',
        cursor: isHovered && !isPanelHovered && !isThisPanelOpen ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (isHovered && !isPanelHovered && !isThisPanelOpen) {
          e.stopPropagation();
          openCustomizationPanel(data.id, stickerType);
        }
      }}
    >
      <div
        style={{
          width: `${contentWidth}px`,
          height: `${contentHeight}px`,
          transform,
          transformOrigin,
          overflow: 'hidden', // Clip content within the inner rotated container
        }}
      >
        {renderSticker()}
      </div>
      
      {/* Settings icon overlay (centered, only show on hover, hide when panel is hovered or open, hide in print) */}
      <div
        className="absolute inset-0 flex items-center justify-center print:hidden z-50 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered && !isPanelHovered && !isThisPanelOpen ? 0.95 : 0,
        }}
      >
        <div
          className="w-20 h-20 text-white text-4xl rounded-full flex items-center justify-center transition-transform duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transform: isHovered && !isPanelHovered && !isThisPanelOpen ? 'scale(1)' : 'scale(0.8)',
          }}
        >
          <FontAwesomeIcon icon={faCog} />
        </div>
      </div>
      
      {/* Customization Panel */}
      {isThisPanelOpen && (
        <StickerCustomizationPanel
          album={currentAlbum}
          stickerType={stickerType}
          onClose={closeCustomizationPanel}
          onPanelHover={(hovered) => setIsPanelHovered(hovered)}
        />
      )}
      
      {/* Sticker type label (toggle with checkbox) */}
      {showLabels && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 pointer-events-none">
          {sticker.label || type}
        </div>
      )}
    </div>
  );
}

export default StickerPreview;
