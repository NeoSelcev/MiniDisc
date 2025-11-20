import { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../store/useAppStore';
import StickerCustomizationPanel from './StickerCustomizationPanel';

function StickerPreview({ dimensions, position, sticker, showLabels = false, scale, showCutLines, settings }) {
  const { x, y, width, height, type: stickerType, data } = sticker;
  const [isHovered, setIsHovered] = useState(false);
  const [isPanelHovered, setIsPanelHovered] = useState(false);
  const [panelPosition, setPanelPosition] = useState(null);
  const wrapperRef = useRef(null);
  
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
  
  const calculatePanelPosition = useCallback(() => {
    if (!wrapperRef.current || typeof window === 'undefined') {
      return null;
    }
    const rect = wrapperRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;
    const panelWidth = 480;
    const panelHeight = 600;

    const albumListEl = document.getElementById('album-list-panel-anchor');
    if (albumListEl) {
      // Prefer docking the panel to the album list column when the anchor exists
      const listRect = albumListEl.getBoundingClientRect();
      let xPosition = listRect.left + scrollX;
      let yPosition = listRect.top + scrollY - padding;

      if (xPosition + panelWidth > scrollX + viewportWidth - padding) {
        xPosition = scrollX + viewportWidth - padding - panelWidth;
      }

      xPosition = Math.max(scrollX + padding, xPosition);

      const maxY = scrollY + viewportHeight - panelHeight - padding;
      yPosition = Math.min(maxY, Math.max(scrollY + padding, yPosition));

      return { x: xPosition, y: yPosition };
    }

    let xPosition = rect.left + scrollX - panelWidth - padding;
    let yPosition = rect.top + scrollY;

    if (xPosition < scrollX + padding) {
      xPosition = rect.right + scrollX + padding;
    }

    xPosition = Math.min(xPosition, scrollX + viewportWidth - padding - panelWidth);

    const maxY = scrollY + viewportHeight - panelHeight - padding;
    yPosition = Math.max(scrollY + padding, Math.min(yPosition, maxY));

    return { x: xPosition, y: yPosition };
  }, []);

  const handleOpenPanel = () => {
    const position = calculatePanelPosition();
    setPanelPosition(position);
    openCustomizationPanel(data.id, stickerType);
  };

  const handleClosePanel = () => {
    setPanelPosition(null);
    closeCustomizationPanel();
  };

  useEffect(() => {
    if (isThisPanelOpen) {
      setPanelPosition(calculatePanelPosition());
    } else {
      setPanelPosition(null);
    }
  }, [isThisPanelOpen, calculatePanelPosition]);

  const renderSpine = () => {
    const fontFamily = customization.spineFontFamily || 'Arial';
    const spineStyle = {
      bold: customization.spineFontBold || false,
      italic: customization.spineFontItalic || false,
      underline: customization.spineFontUnderline || false,
    };
    const lineHeight = customization.lineHeight || 1.2;
    const fontSize = customization.fontSize || 8;
    const letterSpacing = customization.letterSpacing !== undefined ? customization.letterSpacing : 0;
    
    return (
      <div
        className={`flex items-center justify-center text-xs overflow-hidden ${showCutLines ? 'border border-dashed border-gray-400' : 'border border-transparent'}`}
        style={{
          backgroundColor: data.colors?.dominant || '#e0e0e0',
          color: data.colors?.fontColor || '#000',
          padding: '1px',
          fontSize: `${fontSize}pt`,
          fontFamily: fontFamily,
          lineHeight: lineHeight,
          letterSpacing: `${letterSpacing}em`,
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
      <div className="w-full h-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: data.colors?.dominant || '#e0e0e0' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={data.coverImage}
            alt={data.albumName}
            style={{
              width: 'auto',
              height: '100%',
              maxWidth: 'none',
              objectFit: 'contain',
              display: 'block',
              transform: `scale(${zoom / 100}) translate(${offsetX}px, ${offsetY}px)`,
            }}
          />
        </div>
      </div>
    );
  };
  
  const renderFront = () => {
    // Combined front cover with fold line
    // Image Part (main cover) is at top, Edge Part (fold strip) is at bottom
    const partAHeight = sticker.parts?.partA?.height || (height - 3); // 65mm
    const partBHeight = sticker.parts?.partB?.height || 3; // 3mm fold
    const partAHeightPercent = (partAHeight / height) * 100;
    const partBHeightPercent = (partBHeight / height) * 100;
    
    const zoom = customization.imageZoom || 100;
    const offsetX = customization.imageOffsetX || 0;
    const offsetY = customization.imageOffsetY || 0;
    const titleSize = customization.titleFontSize || 8;
    
    // Get font family and styles for Edge Part (uses per-album settings)
    const fontFamily = customization.edgePartFontFamily || 'Arial';
    const edgePartLineHeight = customization.edgePartLineHeight || 1.2;
    const edgePartLetterSpacing = customization.edgePartLetterSpacing !== undefined ? customization.edgePartLetterSpacing : 0;
    const spineStyle = {
      bold: customization.edgePartFontBold || false,
      italic: customization.edgePartFontItalic || false,
      underline: customization.edgePartFontUnderline || false,
    };
    
    return (
      <div className="w-full h-full flex flex-col">
        {/* Image Part - Main cover image */}
        <div className="w-full overflow-hidden flex items-center justify-center" style={{ height: `${partAHeightPercent}%`, backgroundColor: data.colors?.dominant || '#e0e0e0' }}>
          {data.coverImage ? (
            <img
              src={data.coverImage}
              alt={data.albumName}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                transform: `scale(${zoom / 100}) translate(${offsetX}px, ${offsetY}px)`,
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
        
        {/* Edge Part (Spine) - Fold strip with album info */}
        <div
          className="w-full flex items-center justify-center text-xs font-medium overflow-hidden"
          style={{
            height: `${partBHeightPercent}%`,
            backgroundColor: data.colors?.dominant || '#e0e0e0',
            color: data.colors?.fontColor || '#000',
            padding: '1px',
            fontSize: `${titleSize}pt`,
            fontFamily: fontFamily,
            lineHeight: edgePartLineHeight,
            letterSpacing: `${edgePartLetterSpacing}em`,
            fontWeight: spineStyle.bold ? 'bold' : 'normal',
            fontStyle: spineStyle.italic ? 'italic' : 'normal',
            textDecoration: spineStyle.underline ? 'underline' : 'none',
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
    // Track List
    const fontSize = customization.trackListFontSize || settings.design.fontSizes?.trackList || 8;
    const trackFont = customization.trackListFontFamily || 'Arial';
    const trackStyle = {
      bold: customization.trackListFontBold || false,
      italic: customization.trackListFontItalic || false,
      underline: customization.trackListFontUnderline || false,
    };
    const lineHeight = customization.trackListLineHeight || 1.2;
    const letterSpacing = customization.trackListLetterSpacing !== undefined ? customization.trackListLetterSpacing : 0;
    const trackListStyle = customization.trackListStyle || 'numbers';
    
    // Album Title
    const titleSize = customization.titleFontSize || settings.design.fontSizes?.holderBackTitle || 14;
    const titleFont = customization.titleFontFamily || 'Arial';
    const titleStyle = {
      bold: customization.titleFontBold || false,
      italic: customization.titleFontItalic || false,
      underline: customization.titleFontUnderline || false,
    };
    const titleLineHeight = customization.titleLineHeight || 1.2;
    const titleLetterSpacing = customization.titleLetterSpacing !== undefined ? customization.titleLetterSpacing : 0;
    
    // Artist Name
    const artistSize = customization.artistFontSize || settings.design.fontSizes?.holderBackArtist || 10;
    const artistFont = customization.artistFontFamily || 'Arial';
    const artistStyle = {
      bold: customization.artistFontBold || false,
      italic: customization.artistFontItalic || false,
      underline: customization.artistFontUnderline || false,
    };
    const artistLineHeight = customization.artistLineHeight || 1.2;
    const artistLetterSpacing = customization.artistLetterSpacing !== undefined ? customization.artistLetterSpacing : 0;
    
    // Year of Production
    const yearSize = customization.yearFontSize || settings.design.fontSizes?.holderBackYear || 9;
    const yearFont = customization.yearFontFamily || 'Arial';
    const yearStyle = {
      bold: customization.yearFontBold || false,
      italic: customization.yearFontItalic || false,
      underline: customization.yearFontUnderline || false,
    };
    const yearLineHeight = customization.yearLineHeight || 1.2;
    const yearLetterSpacing = customization.yearLetterSpacing !== undefined ? customization.yearLetterSpacing : 0;
    
    // Track Duration
    const durationSize = customization.trackDurationFontSize || settings.design.fontSizes?.trackDuration || 4.5;
    const durationFont = customization.trackDurationFontFamily || 'Arial';
    const durationStyle = {
      bold: customization.trackDurationFontBold || false,
      italic: customization.trackDurationFontItalic || false,
      underline: customization.trackDurationFontUnderline || false,
    };
    const durationLineHeight = customization.trackDurationLineHeight || 1.2;
    const durationLetterSpacing = customization.trackDurationLetterSpacing !== undefined ? customization.trackDurationLetterSpacing : 0;
    
    const getFontStyleCSS = (style) => ({
      fontWeight: style.bold ? 'bold' : 'normal',
      fontStyle: style.italic ? 'italic' : 'normal',
      textDecoration: style.underline ? 'underline' : 'none',
    });
    
    const getTrackPrefix = (trackNumber) => {
      switch (trackListStyle) {
        case 'dashes':
          return '- ';
        case 'bullets':
          return '• ';
        case 'numbers':
        default:
          return `${trackNumber}. `;
      }
    };
    
    return (
      <div className="w-full h-full bg-white p-1 overflow-hidden" style={{ fontSize: `${fontSize}pt` }}>
        {/* Album info */}
        <div 
          className="truncate" 
          style={{ 
            fontSize: `${titleSize}pt`,
            fontFamily: titleFont,
            lineHeight: titleLineHeight,
            letterSpacing: `${titleLetterSpacing}em`,
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
              letterSpacing: `${artistLetterSpacing}em`,
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
              letterSpacing: `${yearLetterSpacing}em`,
              ...getFontStyleCSS(yearStyle),
            }}
          >
            {data.year}
          </span>
        </div>
        
        {/* Track list */}
        <div className="space-y-0.5 mt-1" style={{ lineHeight, letterSpacing: `${letterSpacing}em` }}>
          {data.tracks?.slice(0, 15).map((track) => (
            <div 
              key={track.number} 
              className="flex justify-between truncate"
              style={{
                fontFamily: trackFont,
                fontSize: `${fontSize}pt`,
                ...getFontStyleCSS(trackStyle)
              }}
            >
              <span className="truncate flex-1">
                {getTrackPrefix(track.number)}{track.name}
              </span>
              <span 
                className="ml-2 text-gray-600"
                style={{
                  fontSize: `${durationSize}pt`,
                  fontFamily: durationFont,
                  letterSpacing: `${durationLetterSpacing}em`,
                  ...getFontStyleCSS(durationStyle),
                }}
              >
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
      ref={wrapperRef}
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
        if (!isPanelHovered && !isThisPanelOpen) {
          e.stopPropagation();
          handleOpenPanel();
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
          position={panelPosition || undefined}
          onClose={handleClosePanel}
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
