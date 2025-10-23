function StickerPreview({ sticker, scale, showCutLines, showLabels, settings }) {
  const { x, y, width, height, type, data } = sticker;
  
  const pixelX = x * scale;
  const pixelY = y * scale;
  const pixelWidth = width * scale;
  const pixelHeight = height * scale;
  
  const renderSticker = () => {
    switch (type) {
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
    
    return (
      <div
        className="flex items-center justify-center text-xs overflow-hidden border-2 border-blue-500"
        style={{
          backgroundColor: data.colors?.dominant || '#e0e0e0',
          color: data.colors?.fontColor || '#000',
          padding: '1px',
          fontSize: `${settings.design.fontSizes?.spine || 8}pt`,
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
    if (!data.coverImage) {
      return (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
          Disc Cover
        </div>
      );
    }
    
    return (
      <div className="w-full h-full overflow-hidden" style={{ backgroundColor: data.colors?.dominant || '#e0e0e0' }}>
        <img
          src={data.coverImage}
          alt={data.albumName}
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            margin: 0,
            padding: 0,
            minWidth: '100%',
            minHeight: '100%'
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
    
    return (
      <div className="w-full h-full flex flex-col">
        {/* Part A - Main cover image */}
        <div className="w-full overflow-hidden" style={{ height: `${partAHeightPercent}%`, backgroundColor: data.colors?.dominant || '#e0e0e0' }}>
          {data.coverImage ? (
            <img
              src={data.coverImage}
              alt={data.albumName}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block'
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
            fontSize: `${settings.design.fontSizes?.spine || 8}pt`,
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
    const fontSize = settings.design.fontSizes?.trackList || 8;
    const titleSize = settings.design.fontSizes?.holderBackTitle || 14;
    const artistSize = settings.design.fontSizes?.holderBackArtist || 10;
    const yearSize = settings.design.fontSizes?.holderBackYear || 9;
    
    const titleStyle = settings.design.fontStyles?.holderBackTitle || {};
    const artistStyle = settings.design.fontStyles?.holderBackArtist || {};
    const yearStyle = settings.design.fontStyles?.holderBackYear || {};
    const trackStyle = settings.design.fontStyles?.trackList || {};
    
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
            style={{...getFontStyleCSS(artistStyle)}}
          >
            {data.artistName}
          </span>
          <span 
            className="ml-2 text-gray-600" 
            style={{ 
              fontSize: `${yearSize}pt`,
              ...getFontStyleCSS(yearStyle),
            }}
          >
            {data.year}
          </span>
        </div>
        
        {/* Track list */}
        <div className="space-y-0.5 mt-1">
          {data.tracks?.slice(0, 15).map((track) => (
            <div 
              key={track.number} 
              className="flex justify-between truncate"
              style={getFontStyleCSS(trackStyle)}
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
  const transform = sticker.rotation ? `rotate(${sticker.rotation}deg)` : 'none';
  const transformOrigin = 'top left';
  
  return (
    <div
      className="absolute"
      style={{
        left: `${pixelX}px`,
        top: `${pixelY}px`,
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
        border: showCutLines ? '1px dashed #999' : 'none',
        transform,
        transformOrigin,
      }}
    >
      {renderSticker()}
      
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
