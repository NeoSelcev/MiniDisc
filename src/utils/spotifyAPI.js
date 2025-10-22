/**
 * Spotify API Integration
 * Handles authentication and album data fetching
 */

import axios from 'axios';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// These should be set in environment variables
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback';

/**
 * Generate Spotify authorization URL
 */
export function getAuthUrl() {
  const scopes = ['user-read-private', 'user-read-email'];
  const state = generateRandomString(16);
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(' '),
    state: state,
  });
  
  // Store state for validation
  localStorage.setItem('spotify_auth_state', state);
  
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * This should be called from the server to keep client secret secure
 */
export async function exchangeCodeForToken(code) {
  try {
    // In production, this should call your backend
    // For now, we'll return a mock response
    const response = await axios.post('/api/spotify/token', { code });
    return response.data;
  } catch (error) {
    console.error('Token exchange failed:', error);
    throw new Error('Failed to authenticate with Spotify');
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const response = await axios.post('/api/spotify/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh Spotify token');
  }
}

/**
 * Search for albums on Spotify
 */
export async function searchAlbums(query, accessToken) {
  try {
    const response = await axios.get(`${SPOTIFY_API_BASE}/search`, {
      params: {
        q: query,
        type: 'album',
        limit: 20,
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    return response.data.albums.items.map(album => ({
      id: album.id,
      name: album.name,
      artist: album.artists[0]?.name || 'Unknown Artist',
      year: album.release_date ? new Date(album.release_date).getFullYear() : null,
      imageUrl: album.images[0]?.url || null,
      spotifyUrl: album.external_urls.spotify,
    }));
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('SPOTIFY_AUTH_EXPIRED');
    }
    console.error('Album search failed:', error);
    throw new Error('Failed to search albums');
  }
}

/**
 * Get album details including tracks
 */
export async function getAlbumDetails(albumId, accessToken) {
  try {
    const response = await axios.get(`${SPOTIFY_API_BASE}/albums/${albumId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const album = response.data;
    
    return {
      id: album.id,
      name: album.name,
      artist: album.artists[0]?.name || 'Unknown Artist',
      year: album.release_date ? new Date(album.release_date).getFullYear() : null,
      imageUrl: album.images[0]?.url || null, // Highest resolution
      tracks: album.tracks.items.map((track, index) => ({
        number: index + 1,
        name: track.name,
        duration: track.duration_ms / 1000, // Convert to seconds
      })),
    };
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('SPOTIFY_AUTH_EXPIRED');
    }
    console.error('Failed to get album details:', error);
    throw new Error('Failed to fetch album details');
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt) {
  if (!expiresAt) return true;
  return new Date(expiresAt) <= new Date();
}

/**
 * Handle API errors with token refresh
 */
export async function makeSpotifyRequest(requestFn, spotifyAuth, onAuthUpdate) {
  try {
    return await requestFn(spotifyAuth.accessToken);
  } catch (error) {
    if (error.message === 'SPOTIFY_AUTH_EXPIRED') {
      // Try to refresh token
      try {
        const newAuth = await refreshAccessToken(spotifyAuth.refreshToken);
        onAuthUpdate(newAuth);
        // Retry request with new token
        return await requestFn(newAuth.accessToken);
      } catch (refreshError) {
        // Refresh failed, user needs to re-authenticate
        throw new Error('SPOTIFY_REAUTH_REQUIRED');
      }
    }
    throw error;
  }
}

/**
 * Generate random string for OAuth state
 */
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length },
    () => possible.charAt(Math.floor(Math.random() * possible.length))
  ).join('');
}

/**
 * Download image as base64 (for offline storage)
 */
export async function downloadImageAsBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    
    const base64 = btoa(
      new Uint8Array(response.data)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    const contentType = response.headers['content-type'] || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Failed to download image:', error);
    return null;
  }
}

export default {
  getAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  searchAlbums,
  getAlbumDetails,
  isTokenExpired,
  makeSpotifyRequest,
  downloadImageAsBase64,
};
