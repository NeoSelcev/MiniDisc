import { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import useAppStore from '../store/useAppStore';
import { searchAlbums, getAlbumDetails, makeSpotifyRequest, getAuthUrl, downloadImageAsBase64 } from '../utils/spotifyAPI';
import { extractColors } from '../utils/colorExtraction';

function SpotifySearch({ onClose }) {
  const { spotifyAuth, setSpotifyAuth, addAlbum } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);
  
  const isAuthenticated = spotifyAuth.accessToken && spotifyAuth.expiresAt > Date.now();
  
  // Debug logging
  console.log('🔍 SpotifySearch render:', {
    hasAccessToken: !!spotifyAuth?.accessToken,
    expiresAt: spotifyAuth?.expiresAt ? new Date(spotifyAuth.expiresAt).toLocaleString() : 'none',
    isExpired: spotifyAuth?.expiresAt ? spotifyAuth.expiresAt <= Date.now() : 'no expiry',
    isAuthenticated
  });
  
  // Define handleSearch before using it in useEffect
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    if (!isAuthenticated) {
      setError('Please connect to Spotify first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await makeSpotifyRequest(
        (token) => searchAlbums(searchQuery, token),
        spotifyAuth,
        setSpotifyAuth
      );
      setSearchResults(results);
    } catch (err) {
      if (err.message === 'SPOTIFY_REAUTH_REQUIRED') {
        setError('Session expired. Please reconnect to Spotify.');
        setSpotifyAuth({ accessToken: null, refreshToken: null, expiresAt: null });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, isAuthenticated, spotifyAuth, setSpotifyAuth]);
  
  // Auto-search as user types (debounced)
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only search if query has 2+ characters
    if (searchQuery.trim().length >= 2 && isAuthenticated) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch();
      }, 500); // 500ms debounce
    } else if (searchQuery.trim().length === 0) {
      // Clear results if query is empty
      setSearchResults([]);
    }
    
    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, isAuthenticated, handleSearch]);
  
  const handleSelectAlbum = async (spotifyAlbum) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get full album details with tracks
      const albumDetails = await makeSpotifyRequest(
        (token) => getAlbumDetails(spotifyAlbum.id, token),
        spotifyAuth,
        setSpotifyAuth
      );
      
      // Download cover image as base64
      const coverBase64 = await downloadImageAsBase64(albumDetails.imageUrl);
      
      // Extract colors from cover
      let colors = {
        dominant: '#000000',
        secondary: ['#666666', '#999999'],
      };
      
      if (coverBase64) {
        try {
          const extractedColors = await extractColors(coverBase64);
          colors = extractedColors;
        } catch (colorError) {
          console.warn('Failed to extract colors:', colorError);
        }
      }
      
      // Add album to store
      addAlbum({
        spotifyId: albumDetails.id,
        albumName: albumDetails.name,
        artistName: albumDetails.artist,
        year: albumDetails.year,
        coverImage: coverBase64,
        tracks: albumDetails.tracks,
        colors: colors,
      });
      
      // Don't clear results or close modal - allow multiple selections
      // setSearchResults([]);
      // setSearchQuery('');
      // onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnect = () => {
    window.location.href = getAuthUrl();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Spotify Search</h3>
        <button
          onClick={onClose}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>
      </div>
      
      {!isAuthenticated ? (
        <div className="text-center py-6">
          <p className="mb-4 text-gray-600 dark:text-gray-400">Connect to Spotify to search albums</p>
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FontAwesomeIcon icon={faSpotify} className="mr-1 w-4 h-4" /> Connect Spotify
          </button>
        </div>
      ) : (
        <>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for album or artist..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>
          
          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          
          <div className="max-h-96 overflow-y-auto space-y-2">
            {searchResults.map((album) => (
              <div
                key={album.id}
                onClick={() => handleSelectAlbum(album)}
                className="flex items-center space-x-3 p-2 border border-gray-200 dark:border-gray-700 rounded hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer transition"
              >
                {album.imageUrl && (
                  <img
                    src={album.imageUrl}
                    alt={album.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {album.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {album.artist}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{album.year}</p>
                </div>
              </div>
            ))}
            
            {searchResults.length === 0 && !loading && searchQuery && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No results found</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SpotifySearch;
