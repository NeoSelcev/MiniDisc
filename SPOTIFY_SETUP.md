# Spotify API Setup Guide

## Important: Redirect URI Configuration

Spotify requires HTTPS for redirect URIs in production, but **allows HTTP for localhost during development**.

## Step-by-Step Setup

### 1. Create a Spotify Application

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Log in with your Spotify account (requires Spotify Premium for full API access)
3. Click **"Create an App"**
4. Fill in the details:
   - **App name**: MiniDisc Sticker Printer (or any name you prefer)
   - **App description**: Local app to create custom MiniDisc stickers
   - **Redirect URIs**: `http://localhost:5173/callback` ⚠️ **EXACT MATCH REQUIRED**
   - Check the agreement box
5. Click **"Save"**

### 2. Get Your Credentials

1. On your app's dashboard, you'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "Show Client Secret" and copy it
2. Keep these safe - you'll need them in the next step

### 3. Configure the Application

1. Open the `.env` file in the project root
2. Paste your credentials:

```env
VITE_SPOTIFY_CLIENT_ID=your_actual_client_id_here
SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
PORT=3001
```

⚠️ **IMPORTANT**: The `VITE_SPOTIFY_REDIRECT_URI` in `.env` **MUST EXACTLY MATCH** the Redirect URI you added in the Spotify Dashboard.

### 4. Redirect URI Settings in Spotify Dashboard

In your Spotify App settings, under **Redirect URIs**, add:

```
http://localhost:5173/callback
```

**Notes:**
- ✅ Spotify **DOES allow** `http://localhost` for development
- ✅ The port number (5173) is Vite's default development port
- ❌ Do NOT use `http://127.0.0.1` - use `localhost`
- ❌ Do NOT add trailing slashes
- ❌ Do NOT use HTTPS for localhost (not needed)

### 5. If You See "Redirect URI Not Secure" Warning

This warning appears in the Spotify Dashboard but is **safe to ignore for localhost development**. 

Spotify's documentation states:
> "For local development, you can use http://localhost with any port number."

**For production deployment**, you would need:
- A proper domain with HTTPS (e.g., `https://yourdomain.com/callback`)
- Update both the Spotify Dashboard and `.env` file

### 6. Troubleshooting

#### Error: "INVALID_CLIENT: Invalid redirect URI"
- ✅ Check that the URI in `.env` **exactly matches** what's in Spotify Dashboard
- ✅ Ensure no extra spaces or trailing slashes
- ✅ Restart the dev server after changing `.env`

#### Error: "Application not found"
- ✅ Verify your Client ID is correct in `.env`
- ✅ Make sure you're using your own app's credentials, not example values

#### Error: "Invalid client secret"
- ✅ Copy the client secret again from Spotify Dashboard
- ✅ Ensure no spaces were accidentally added when pasting

### 7. Testing the Setup

1. Start the application:
   ```bash
   npm run dev
   ```

2. Click "Connect Spotify" in the app

3. You should be redirected to Spotify's login page

4. After authorizing, you'll be redirected back to `http://localhost:5173/callback`

5. The app will exchange the code for an access token

6. You can now search for albums!

## Security Notes

- ✅ `.env` is in `.gitignore` - your secrets won't be committed
- ✅ Never share your Client Secret publicly
- ✅ For local development only - deploy with proper HTTPS in production
- ✅ The app uses OAuth 2.0 Authorization Code Flow (secure)

## Alternative: Skip Spotify Integration

If you don't want to use Spotify integration:
1. You can manually enter album data
2. Upload album cover images directly
3. Add track lists manually

The app works fully offline after initial setup!

## Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Spotify Authorization Guide](https://developer.spotify.com/documentation/general/guides/authorization/)
- [Redirect URI Best Practices](https://developer.spotify.com/documentation/general/guides/authorization/app-settings/)
