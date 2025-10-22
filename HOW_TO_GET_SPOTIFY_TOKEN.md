# 🎵 How to Get Your Spotify Token - Simple Guide

## Quick Answer: You Don't Manually Get a Token!

**The app will automatically get your Spotify token when you connect.** You just need to set up your Spotify App credentials first.

## Step-by-Step Setup (5 Minutes)

### Step 1: Create a Spotify Developer App

1. **Go to Spotify Dashboard**
   - Visit: https://developer.spotify.com/dashboard
   - Log in with your Spotify account (you need Spotify Premium)

2. **Create Your App**
   - Click the green **"Create app"** button
   - Fill in the form:
     - **App name**: `MiniDisc Sticker Printer` (or any name)
     - **App description**: `Personal app for creating MiniDisc stickers`
     - **Website**: Leave blank or use `http://localhost`
     - **Redirect URI**: `http://localhost:5173/callback` ⚠️ **MUST BE EXACT**
   - Check the agreement checkbox
   - Click **"Save"**

### Step 2: Get Your Credentials

1. On your new app's page, you'll see:
   - **Client ID** - A long string like `abc123def456...`
   - **Client Secret** - Click "Show Client Secret" to reveal it

2. **Copy both values** - you'll need them in the next step

### Step 3: Add Them to Your .env File

1. Open the `.env` file in your project folder
2. Replace the placeholder values:

```env
VITE_SPOTIFY_CLIENT_ID=paste_your_client_id_here
SPOTIFY_CLIENT_SECRET=paste_your_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
PORT=3001
```

3. Save the file

### Step 4: Restart the App

```bash
# Stop the current servers (Ctrl+C)
# Then restart:
npm run dev:all
```

### Step 5: Connect Spotify in the App

1. Open http://localhost:5173 in your browser
2. Click **"Connect Spotify"** button
3. You'll be redirected to Spotify's login page
4. Click **"Agree"** to authorize the app
5. You'll be redirected back to your app
6. **The token is automatically generated and stored!**

## 🔐 Where Is My Token Stored?

Your Spotify token is automatically:
- ✅ Generated when you click "Connect Spotify"
- ✅ Stored in your browser's localStorage
- ✅ Refreshed automatically when it expires
- ✅ Never exposed in the code

**You never need to manually handle the token!**

## ⚠️ Common Issues

### Issue: "Redirect URI not secure" warning
**Solution**: This is normal! Spotify allows `http://localhost` for development. Just click "Save" anyway.

### Issue: "Invalid redirect URI" error
**Solution**: Make sure the redirect URI in:
1. Spotify Dashboard: `http://localhost:5173/callback`
2. .env file: `VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback`

**Both must be EXACTLY the same** (no spaces, no trailing slash).

### Issue: "Invalid client" error
**Solution**: 
1. Double-check your Client ID and Secret in `.env`
2. Make sure you copied them correctly (no extra spaces)
3. Restart the app: `npm run dev:all`

### Issue: App says "Connect Spotify" but nothing happens
**Solution**: 
1. Make sure the backend server is running (you should see both servers in terminal)
2. Check the browser console for errors (F12 → Console tab)
3. Verify your .env file has both Client ID and Secret

## 🎯 Testing the Connection

After connecting Spotify:

1. Click **"Add Album"** in the app
2. Search for an album name (e.g., "Thriller")
3. Results should appear from Spotify
4. Click an album to auto-populate all data

If this works, **you're all set!**

## 🔄 Token Lifecycle

1. **First time**: You click "Connect Spotify" → App redirects to Spotify → You authorize → Token generated
2. **Using the app**: Token is used for all Spotify API calls
3. **After 1 hour**: Token expires → App automatically refreshes it
4. **If refresh fails**: You'll see a message to reconnect

## 🚫 Don't Want to Use Spotify?

You can skip the Spotify integration entirely!

- Click "Add Album" → "Manual Entry"
- Fill in album details manually
- Upload your own album cover image
- Add tracks manually

The app works 100% without Spotify!

## 📖 More Help

- See `SPOTIFY_SETUP.md` for detailed troubleshooting
- See `REDIRECT_URI_WARNING.md` for security explanation
- Check the browser console (F12) for detailed error messages

## Summary: The 3 Things You Need

1. ✅ **Client ID** (from Spotify Dashboard)
2. ✅ **Client Secret** (from Spotify Dashboard)  
3. ✅ **Redirect URI** set to `http://localhost:5173/callback` (in both places)

**That's it! The app handles everything else automatically.** 🎉
