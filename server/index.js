import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback';

/**
 * Exchange authorization code for access token
 */
app.post('/api/spotify/token', async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }
  
  console.log('🔑 Token exchange request:', {
    codeLength: code.length,
    redirectUri: SPOTIFY_REDIRECT_URI,
    hasClientId: !!SPOTIFY_CLIENT_ID,
    hasClientSecret: !!SPOTIFY_CLIENT_SECRET
  });
  
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    console.log('✅ Token exchange successful');
    res.json(response.data);
  } catch (error) {
    console.error('❌ Token exchange error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to exchange token',
      details: error.response?.data 
    });
  }
});

/**
 * Refresh access token
 */
app.post('/api/spotify/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token required' });
  }
  
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MiniDisc Sticker Printer API' });
});

app.listen(PORT, () => {
  console.log(`🎵 MiniDisc API server running on http://localhost:${PORT}`);
  console.log(`Make sure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are set in .env file`);
});
