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
    const fontFamily = customization.spineFontFamily || settings.design.fontFamilies.spine;
    const spineStyle = {
      bold: customization.spineFontBold !== undefined ? customization.spineFontBold : settings.design.fontStyles.spine.bold,
      italic: customization.spineFontItalic !== undefined ? customization.spineFontItalic : settings.design.fontStyles.spine.italic,
      underline: customization.spineFontUnderline !== undefined ? customization.spineFontUnderline : settings.design.fontStyles.spine.underline,
    };
    const lineHeight = customization.lineHeight || settings.design.lineHeights.spine;
    const fontSize = customization.fontSize || settings.design.fontSizes.spine;
    const letterSpacing = customization.letterSpacing !== undefined ? customization.letterSpacing : (settings.design.letterSpacing.spine || 0);
    
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
    const titleSize = customization.titleFontSize || settings.design.fontSizes.spine;
    
    // Get font family and styles for Edge Part (uses per-album settings)
    const fontFamily = customization.edgePartFontFamily || settings.design.fontFamilies.spine;
    const edgePartLineHeight = customization.edgePartLineHeight || settings.design.lineHeights.spine;
    const edgePartLetterSpacing = customization.edgePartLetterSpacing !== undefined ? customization.edgePartLetterSpacing : (settings.design.letterSpacing.spine || 0);
    const spineStyle = {
      bold: customization.edgePartFontBold !== undefined ? customization.edgePartFontBold : settings.design.fontStyles.spine.bold,
      italic: customization.edgePartFontItalic !== undefined ? customization.edgePartFontItalic : settings.design.fontStyles.spine.italic,
      underline: customization.edgePartFontUnderline !== undefined ? customization.edgePartFontUnderline : settings.design.fontStyles.spine.underline,
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
    const fontSize = customization.trackListFontSize || settings.design.fontSizes?.trackList;
    const trackFont = customization.trackListFontFamily || settings.design.fontFamilies.trackList;
    const trackStyle = {
      bold: customization.trackListFontBold !== undefined ? customization.trackListFontBold : settings.design.fontStyles.trackList.bold,
      italic: customization.trackListFontItalic !== undefined ? customization.trackListFontItalic : settings.design.fontStyles.trackList.italic,
      underline: customization.trackListFontUnderline !== undefined ? customization.trackListFontUnderline : settings.design.fontStyles.trackList.underline,
    };
    const lineHeight = customization.trackListLineHeight || settings.design.lineHeights.trackList;
    const letterSpacing = customization.trackListLetterSpacing !== undefined ? customization.trackListLetterSpacing : (settings.design.letterSpacing.trackList || 0);
    const trackListStyle = customization.trackListStyle || settings.design.trackListStyle;
    
    // Album Title
    const titleSize = customization.titleFontSize || settings.design.fontSizes?.holderBackTitle;
    const titleFont = customization.titleFontFamily || settings.design.fontFamilies.holderBackTitle;
    const titleStyle = {
      bold: customization.titleFontBold !== undefined ? customization.titleFontBold : settings.design.fontStyles.holderBackTitle.bold,
      italic: customization.titleFontItalic !== undefined ? customization.titleFontItalic : settings.design.fontStyles.holderBackTitle.italic,
      underline: customization.titleFontUnderline !== undefined ? customization.titleFontUnderline : settings.design.fontStyles.holderBackTitle.underline,
    };
    const titleLineHeight = customization.titleLineHeight || settings.design.lineHeights.holderBackTitle;
    const titleLetterSpacing = customization.titleLetterSpacing !== undefined ? customization.titleLetterSpacing : (settings.design.letterSpacing.holderBackTitle || 0);
    
    // Artist Name
    const artistSize = customization.artistFontSize || settings.design.fontSizes?.holderBackArtist;
    const artistFont = customization.artistFontFamily || settings.design.fontFamilies.holderBackArtist;
    const artistStyle = {
      bold: customization.artistFontBold !== undefined ? customization.artistFontBold : settings.design.fontStyles.holderBackArtist.bold,
      italic: customization.artistFontItalic !== undefined ? customization.artistFontItalic : settings.design.fontStyles.holderBackArtist.italic,
      underline: customization.artistFontUnderline !== undefined ? customization.artistFontUnderline : settings.design.fontStyles.holderBackArtist.underline,
    };
    const artistLineHeight = customization.artistLineHeight || settings.design.lineHeights.holderBackArtist;
    const artistLetterSpacing = customization.artistLetterSpacing !== undefined ? customization.artistLetterSpacing : (settings.design.letterSpacing.holderBackArtist || 0);
    
    // Year of Production
    const yearSize = customization.yearFontSize || settings.design.fontSizes?.holderBackYear;
    const yearFont = customization.yearFontFamily || settings.design.fontFamilies.holderBackYear;
    const yearStyle = {
      bold: customization.yearFontBold !== undefined ? customization.yearFontBold : settings.design.fontStyles.holderBackYear.bold,
      italic: customization.yearFontItalic !== undefined ? customization.yearFontItalic : settings.design.fontStyles.holderBackYear.italic,
      underline: customization.yearFontUnderline !== undefined ? customization.yearFontUnderline : settings.design.fontStyles.holderBackYear.underline,
    };
    const yearLineHeight = customization.yearLineHeight || settings.design.lineHeights.holderBackYear;
    const yearLetterSpacing = customization.yearLetterSpacing !== undefined ? customization.yearLetterSpacing : (settings.design.letterSpacing.holderBackYear || 0);
    
    // Track Duration
    const durationSize = customization.trackDurationFontSize || settings.design.fontSizes?.trackDuration;
    const durationFont = customization.trackDurationFontFamily || settings.design.fontFamilies.trackDuration;
    const durationStyle = {
      bold: customization.trackDurationFontBold !== undefined ? customization.trackDurationFontBold : settings.design.fontStyles.trackDuration.bold,
      italic: customization.trackDurationFontItalic !== undefined ? customization.trackDurationFontItalic : settings.design.fontStyles.trackDuration.italic,
      underline: customization.trackDurationFontUnderline !== undefined ? customization.trackDurationFontUnderline : settings.design.fontStyles.trackDuration.underline,
    };
    const durationLineHeight = customization.trackDurationLineHeight || settings.design.lineHeights.trackDuration;
    const durationLetterSpacing = customization.trackDurationLetterSpacing !== undefined ? customization.trackDurationLetterSpacing : (settings.design.letterSpacing.trackDuration || 0);
    
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
