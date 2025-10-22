# 🚀 Quick Start Guide

## The "Redirect URI Not Secure" Warning

**TL;DR: IGNORE IT! It's completely normal and safe for local development.**

See [REDIRECT_URI_WARNING.md](REDIRECT_URI_WARNING.md) for full explanation.

## Setup in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Spotify API

1. Go to: https://developer.spotify.com/dashboard
2. Click "Create an App"
3. Fill in:
   - **App Name**: MiniDisc Sticker Printer
   - **Redirect URI**: `http://localhost:5173/callback` ⚠️ You'll see a "not secure" warning - **IGNORE IT**
4. Click Save
5. Copy your **Client ID** and **Client Secret**

📖 Detailed guide: [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md)

### 3. Configure Environment

Edit the `.env` file and paste your credentials:

```env
VITE_SPOTIFY_CLIENT_ID=paste_your_client_id_here
SPOTIFY_CLIENT_SECRET=paste_your_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
PORT=3001
```

### 4. Start the App

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### 5. Start Creating!

1. Click "Connect Spotify" (or skip and add albums manually)
2. Search for albums
3. Customize stickers
4. Generate PDF
5. Print on A4 sticky paper
6. Cut along the lines
7. Enjoy your custom MiniDisc stickers! 🎵

## Keyboard Shortcuts

- **Ctrl+S** - Save project
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo
- **Ctrl+P** - Print preview
- **Delete** - Remove selected item

## Troubleshooting

### "Redirect URI not secure" warning in Spotify Dashboard
✅ **This is normal!** Spotify allows `http://localhost` for development. Ignore and save.

### Can't connect to Spotify
1. Check that Client ID and Secret are correct in `.env`
2. Verify redirect URI is exactly `http://localhost:5173/callback`
3. Restart the app with `npm run dev`

### Node version error
- This app requires Node.js v20.19+ or v22.12+
- Update Node.js or use a version manager like `nvm`

### Port already in use
- Change `PORT=3001` in `.env` to another port (e.g., 3002)
- Restart the app

## Need Help?

- 📖 Full setup guide: [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md)
- ⚠️ Redirect URI explanation: [REDIRECT_URI_WARNING.md](REDIRECT_URI_WARNING.md)
- 📋 Complete documentation: [README.md](README.md)
- 📝 Project requirements: [MiniDisc.app.md](MiniDisc.app.md)

## Tips

- **Auto-save is enabled** - Your work is automatically saved
- **Works offline** - After connecting Spotify once, you can work offline
- **Manual entry** - You don't need Spotify - can enter all data manually
- **Customizable** - All dimensions are configurable in Settings
- **Save projects** - Export as JSON to share or backup

**Enjoy making beautiful MiniDisc stickers! 📀✨**
