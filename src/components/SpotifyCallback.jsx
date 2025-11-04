import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../store/useAppStore';
import { exchangeCodeForToken } from '../utils/spotifyAPI';

function SpotifyCallback() {
  const { setSpotifyAuth } = useAppStore();
  const [status, setStatus] = useState('processing');
  const hasRun = useRef(false); // Prevent double execution in StrictMode
  
  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;
    
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      
      // Check for error
      if (error) {
        setStatus('error');
        console.error('Spotify auth error:', error);
        return;
      }
      
      // Validate state
      const savedState = localStorage.getItem('spotify_auth_state');
      if (state !== savedState) {
        setStatus('error');
        console.error('State mismatch');
        return;
      }
      
      if (!code) {
        setStatus('error');
        return;
      }
      
      try {
        // Exchange code for token
        const authData = await exchangeCodeForToken(code);
        
        console.log('✅ Token exchange successful:', {
          hasAccessToken: !!authData.access_token,
          hasRefreshToken: !!authData.refresh_token,
          expiresIn: authData.expires_in
        });
        
        // Save to store
        const authToSave = {
          accessToken: authData.access_token,
          refreshToken: authData.refresh_token,
          expiresAt: Date.now() + authData.expires_in * 1000,
        };
        
        console.log('💾 Saving auth to store:', {
          hasAccessToken: !!authToSave.accessToken,
          expiresAt: new Date(authToSave.expiresAt).toLocaleString()
        });
        
        setSpotifyAuth(authToSave);
        
        // Verify it was saved
        setTimeout(() => {
          const currentAuth = useAppStore.getState().spotifyAuth;
          console.log('✔️ Auth verification after save:', {
            hasAccessToken: !!currentAuth?.accessToken,
            expiresAt: currentAuth?.expiresAt ? new Date(currentAuth.expiresAt).toLocaleString() : 'none'
          });
        }, 100);
        
        setStatus('success');
        
        // Redirect back to main app - use href to ensure clean navigation
        setTimeout(() => {
          window.location.href = '/#main';
        }, 1500);
      } catch (err) {
        console.error('Token exchange failed:', err);
        setStatus('error');
      }
    };
    
    handleCallback();
  }, [setSpotifyAuth]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Connecting to Spotify...</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we authenticate</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-600 dark:text-green-400 text-6xl mb-4">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Connected!</h2>
            <p className="text-gray-600 dark:text-gray-400">Redirecting back to the app...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-600 dark:text-red-400 text-6xl mb-4">
              <FontAwesomeIcon icon={faXmark} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Connection Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to connect to Spotify</p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition cursor-pointer"
            >
              Back to App
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SpotifyCallback;
