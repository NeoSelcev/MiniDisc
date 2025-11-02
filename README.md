# 📀 MiniDisc Sticker Printer

A modern web application for designing and printing custom stickers for Sony MiniDisc albums. Features Spotify integration, smart layout optimization, and professional print output on A4 sticky paper.

---

## 📑 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Spotify Setup](#-spotify-setup)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Technical Details](#-technical-details)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Troubleshooting](#-troubleshooting)
- [Development](#-development)

---

## ✨ Features

### Core Features
- **📀 4 Sticker Types per MiniDisc**:
  - **Spine Sticker** - Edge label with gradient background
  - **Face Sticker** - Disc surface with album cover
  - **Front Sticker** - Holder front (90° folded L-shape) with cover art
  - **Back Sticker** - Holder back with formatted track list

### Spotify Integration
- 🎵 **OAuth 2.0 Authentication** - Secure Spotify login
- 🔍 **Album Search** - Find albums by name or artist
- 🎨 **Auto-fetch Metadata** - Album artwork, tracks, year, artist
- 🔄 **Token Management** - Automatic refresh and persistence
- 🌐 **Offline Mode** - Work without connection after initial setup

### Smart Layout
- 🧩 **Bin-Packing Algorithm** - Advanced skyline algorithm with rotation
- 📏 **Optimal Space Usage** - 70-90% efficiency, fits 6-8+ album sets on A4
- 🔄 **Auto-Rotation** - Stickers rotate 90° for better fit
- 📊 **Real-time Statistics** - Efficiency %, placed vs. total stickers
- ⚠️ **Overflow Detection** - Clear indicators when stickers don't fit

### Design Tools
- 🎨 **Color Extraction** - Dominant + 2 secondary colors from covers
- 🖼️ **Image Upload** - Custom artwork support
- ✏️ **Manual Editing** - All fields editable (title, artist, year)
- 🎵 **Track List Editor** - Add/remove/reorder tracks with durations (mm:ss)
- ⏱️ **Auto Duration Calculation** - Total album duration computed automatically
- 🎯 **Typography Control** - 6 font size settings for different sticker parts
- 📐 **Dimension Customization** - All sticker sizes configurable

### Print Features
- 🖨️ **Browser Print** - Native print dialog with PDF save option
- 📄 **A4 Layout** - Portrait orientation, 210×297mm
- ✂️ **Cut Lines** - Solid/dashed/dotted guides (toggleable)
- 📏 **Margin Guides** - Visual non-printable areas
- 🎨 **Color Preservation** - Exact colors in print output
- 🖼️ **High Quality** - Preserves image quality

### Project Management
- 💾 **Auto-save** - Persistent storage with localStorage
- 📦 **JSON Export/Import** - Save and load complete projects
- ↩️ **Undo/Redo** - 10-level action history (Ctrl+Z / Ctrl+Y)
- 🗑️ **FIFO Storage** - Automatic cleanup of old projects (keeps 10 most recent)
- 📝 **Project Metadata** - Name, creation date, modification tracking

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20.19+ or v22.12+ (required for Vite 5.4+)
- **npm** or **yarn**
- **Spotify Developer Account** (free, for API credentials)

### 5-Minute Setup

```bash
# 1. Clone repository
git clone https://github.com/NeoSelcev/MiniDisc.git
cd MiniDisc

# 2. Install dependencies
npm install

# 3. Configure environment (see Spotify Setup below)
cp .env.example .env
# Edit .env and add your Spotify credentials

# 4. Start application
npm run dev:all

# 5. Open browser
# Navigate to http://localhost:5173
```

---

## 📦 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/NeoSelcev/MiniDisc.git
cd MiniDisc
```

### Step 2: Install Dependencies

```bash
npm install
```

**Installed packages:**
- **React 19** - UI framework
- **Vite 5.4** - Fast build tool
- **TailwindCSS 3.4** - Styling
- **Zustand 5.0** - State management
- **Axios 1.12** - HTTP client
- **Express 5.1** - Backend server for OAuth
- **ColorThief 2.6** - Color extraction
- **Concurrently 9.2** - Run multiple servers

### Step 3: Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
# Spotify API Credentials
# Get these from https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:5173/callback

# Vite Frontend Variables (must start with VITE_)
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback

# Server Port
PORT=3001
```

---

## 🎵 Spotify Setup

### Why Spotify Setup is Needed

The app integrates with Spotify to:
- Search for albums
- Fetch album artwork automatically
- Get track lists and metadata
- Save time on manual data entry

### Step-by-Step Guide

#### 1. Create Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (free account works)
3. Click **"Create app"**
4. Fill in the form:
   - **App name**: `MiniDisc Sticker Printer`
   - **App description**: `Personal app for creating MiniDisc stickers`
   - **Redirect URI**: `http://localhost:5173/callback` ⚠️ **EXACT MATCH REQUIRED**
   - Check the agreement box
5. Click **"Save"**

#### 2. Get Credentials

1. On your app's dashboard, find:
   - **Client ID** - A long alphanumeric string
   - **Client Secret** - Click "Show Client Secret" to reveal
2. Copy both values

#### 3. Add to .env File

Edit `.env` and paste your credentials:

```env
SPOTIFY_CLIENT_ID=paste_your_client_id_here
SPOTIFY_CLIENT_SECRET=paste_your_client_secret_here
VITE_SPOTIFY_CLIENT_ID=paste_your_client_id_here
```

⚠️ **IMPORTANT**: The redirect URI must **EXACTLY MATCH** in both Spotify Dashboard and `.env` file.

#### 4. About the "Not Secure" Warning

When adding `http://localhost:5173/callback` to Spotify Dashboard, you'll see:

> ⚠️ "This redirect URI is not secure"

**This is NORMAL and SAFE to ignore!**

- ✅ Spotify officially supports `http://localhost` for development
- ✅ Traffic never leaves your computer - no security risk
- ✅ For production, you'd use `https://yourdomain.com/callback`
- ✅ Just click "Save" and proceed

#### 5. Start the Application

```bash
npm run dev:all
```

This starts:
- **Frontend** (Vite) on http://localhost:5173
- **Backend** (Express) on http://localhost:3001

#### 6. Connect in the App

1. Open http://localhost:5173
2. Click **"🔍 Spotify"** button
3. Click **"Connect Spotify"**
4. Authorize on Spotify's page
5. You'll be redirected back
6. **Token is automatically generated and saved!**

---

## 📖 Usage Guide

### Adding Albums

#### Method 1: Spotify Search

1. Click **"🔍 Spotify"** button in left sidebar
2. If first time: Click **"Connect Spotify"** and authorize
3. Search for album or artist name
4. Click on an album card to add it
5. Album data (cover, tracks, year) is automatically populated

#### Method 2: Manual Entry

1. Click **"➕ Manual"** button in left sidebar
2. Enter album information:
   - Album name (required)
   - Artist name (required)
   - Year (optional)
   - Upload custom cover image (optional)
3. Click **"Add"**
4. **Double-click the album** in the list to open edit modal
5. Add tracks using the **Track List Editor**:
   - Click **"➕ Add Track"**
   - Enter track name and duration (mm:ss format)
   - Use ⬆️⬇️ buttons to reorder tracks
   - Use 🗑️ button to remove tracks
   - Total duration is calculated automatically

### Editing Albums

- **Single-click** on album in sidebar to **select** it
- **Double-click** on album to open **Edit Modal**
- In Edit Modal you can modify:
  - **Album name** - Text field
  - **Artist name** - Text field
  - **Year** - Number field
  - **Track List**:
    - Add tracks with **"➕ Add Track"** button
    - Edit track names (text input)
    - Edit track durations in **mm:ss** format (e.g., "3:45")
    - Reorder tracks with ⬆️ and ⬇️ buttons
    - Remove tracks with 🗑️ button
    - View auto-calculated total duration
- **Save** - Click "Save Changes"
- **Cancel** - Click "Cancel" or close modal
- **Delete album** - Click trash icon in album list
- All changes save automatically after closing modal

### Layout Preview

- **Main canvas** shows A4 paper with all stickers
- **Gray areas** = non-printable margins
- **Real-time updates** as you add/remove albums
- **Statistics panel** (bottom-left):
  - Number of albums placed
  - Sticker count (placed / total)
  - Space efficiency percentage
  - Fit status (✓ or ✗)

### Printing

1. Add albums to layout
2. Check that all stickers fit (look for green "✓ All stickers fit")
3. Click **"🖨️ Print"** button (bottom-right)
4. Browser print dialog opens
5. Choose:
   - **Destination**: Printer or "Save as PDF"
   - **Paper size**: A4
   - **Orientation**: Portrait
   - **Margins**: None
   - **Background graphics**: Enabled (for colors)
6. Print or save

### Settings

Press **Ctrl+,** or click **⚙️ Settings** to open settings modal.

#### Sticker Dimensions
Configure size for each sticker type:
- Spine sticker (width × height)
- MiniDisc face (diameter)
- Front sticker (width × height)
- Back sticker (width × height)

#### Typography
Set font sizes for:
- Spine text
- Disc face (title & artist)
- Cover front (title & artist)
- Track list

#### Print Settings
- Spacing between stickers
- Paper margins (top, bottom, left, right)
- Cut lines (style: solid/dashed/dotted)
- Labels (show/hide sticker type labels)
- Bleed marks (show/hide margin guides)

All changes apply **instantly** with live preview.

### Project Management

#### Save Project
- **Ctrl+S** or click **"💾 Save"** button
- Exports project as JSON file
- Contains all albums, settings, and metadata

#### Load Project
- Click **"📂 Load"** button
- Select previously saved JSON file
- All data is restored

#### New Project
- Click **"📄 New"** button
- Confirms before clearing current project
- Creates fresh workspace

#### Auto-save
- **Automatic** - saves to browser localStorage every change
- **10 project limit** - keeps 10 most recent (FIFO)
- **Survives refresh** - data persists across sessions

---

## 📁 Project Structure

```
MiniDisc/
├── src/
│   ├── components/
│   │   ├── Header.jsx                 # Top navigation bar
│   │   ├── AlbumList.jsx             # Left sidebar - album management
│   │   ├── AlbumEditModal.jsx        # Edit album details
│   │   ├── SpotifySearch.jsx         # Spotify album search
│   │   ├── SpotifyCallback.jsx       # OAuth redirect handler
│   │   ├── LayoutPreview.jsx         # Main canvas with A4 preview
│   │   ├── LayoutPreview.print.css   # Print-specific styles
│   │   ├── StickerPreview.jsx        # Individual sticker renderer
│   │   ├── Settings.jsx              # Settings panel (deprecated)
│   │   └── SettingsModal.jsx         # Settings modal with live preview
│   ├── store/
│   │   └── useAppStore.js            # Zustand state management
│   ├── utils/
│   │   ├── layoutOptimizer.js        # Bin-packing algorithm
│   │   ├── colorExtraction.js        # Dominant color extraction
│   │   ├── spotifyAPI.js             # Spotify API integration
│   │   └── pdfGenerator.js           # PDF export (deprecated)
│   ├── App.jsx                       # Main application component
│   ├── main.jsx                      # React entry point
│   └── index.css                     # Global styles + TailwindCSS
├── server/
│   └── index.js                      # Express OAuth server
├── public/                           # Static assets
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Environment template
├── .gitignore                        # Git exclusions
├── package.json                      # Dependencies & scripts
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # TailwindCSS configuration
├── postcss.config.js                 # PostCSS configuration
├── eslint.config.js                  # ESLint rules
└── README.md                         # This file
```

---

## 🔧 Technical Details

### Architecture

- **Frontend**: React 19 + Vite 5.4
- **Styling**: TailwindCSS 3.4
- **State**: Zustand 5.0 (simple, performant state management)
- **Backend**: Express 5.1 (minimal server for OAuth)
- **Build**: Vite (fast HMR, optimized production builds)

### State Management

**Zustand Store** (`useAppStore.js`):
```javascript
{
  albums: [],                    // Array of album objects
  settings: {                    // Configuration
    paper: { width, height },
    print: { margins, spacing, cutLines, ... },
    design: { fontSizes, lineHeights, ... }
  },
  spotifyAuth: {                 // OAuth tokens
    accessToken, refreshToken, expiresAt
  },
  projectMetadata: {             // Project info
    name, createdAt, modifiedAt
  },
  history: {                     // Undo/redo
    past: [], future: []
  }
}
```

### Layout Algorithm

**Skyline Bin-Packing** (`layoutOptimizer.js`):

1. **Calculate printable area** - Subtract margins from A4 dimensions
2. **Sort stickers** - Largest area first
3. **Find placement** - For each sticker:
   - Try normal orientation
   - Try 90° rotation
   - Choose best fit (tightest space)
4. **Place sticker** - Update free rectangles
5. **Prune overlaps** - Remove redundant spaces
6. **Repeat** until all stickers placed or space exhausted

**Result**: 70-90% space efficiency, fits 6-8+ albums on A4

### Print System

**Browser Native Print** (replaced jsPDF):
- Uses `window.print()` API
- CSS `@media print` rules hide UI, show only layout
- Separate `.print-only` container with 2x scale
- Preserves exact colors with `print-color-adjust: exact`
- User chooses printer or "Save as PDF"

**Benefits**:
- No library dependencies
- Perfect WYSIWYG
- Native PDF generation
- Better color accuracy
- User-controlled settings

### Color Extraction

**ColorThief Library**:
1. Load album cover image
2. Extract dominant color (spine background)
3. Extract color palette (2 additional colors)
4. Store RGB values in album data
5. Use for gradient backgrounds

### Spotify Integration

**OAuth 2.0 Flow**:
1. User clicks "Connect Spotify"
2. Redirect to Spotify authorization page
3. User approves
4. Spotify redirects to `/callback?code=...`
5. Express server exchanges code for tokens
6. Tokens stored in browser localStorage
7. Auto-refresh when expired

**API Calls**:
- `/v1/search` - Search albums and artists
- `/v1/albums/{id}` - Get album details
- `/v1/tracks` - Get track information

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+S** | Save project as JSON |
| **Ctrl+Z** | Undo last action |
| **Ctrl+Y** | Redo action |
| **Ctrl+Shift+Z** | Redo action (alternative) |
| **Ctrl+,** | Open settings modal |
| **Ctrl+P** | Open print dialog |
| **Escape** | Close modal/dialog |
| **Delete** | Remove selected item |

---

## 🐛 Troubleshooting

### Spotify Connection Issues

#### "Redirect URI not secure" warning in Spotify Dashboard
✅ **Normal!** Click "Save" anyway. Spotify allows `http://localhost` for development.

#### "Invalid redirect URI" error
❌ Check that redirect URI matches **EXACTLY** in:
1. Spotify Dashboard: `http://localhost:5173/callback`
2. `.env` file: `VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback`

**No spaces, no trailing slash, same port number.**

#### "Invalid client" error
❌ Solutions:
1. Double-check Client ID and Secret in `.env`
2. Copy-paste carefully (no extra spaces)
3. Restart servers: `npm run dev:all`

#### "Application not found"
❌ Verify Client ID is correct in `.env`

### Installation Issues

#### Node version error
❌ This app requires Node.js v20.19+ or v22.12+
- Check version: `node --version`
- Update Node.js or use `nvm`

#### Port already in use (5173 or 3001)
❌ Solutions:
1. Stop other processes using the port
2. Change port in `.env`: `PORT=3002`
3. Change Vite port in `vite.config.js`

#### Dependencies won't install
❌ Try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Layout Issues

#### Stickers don't fit on A4
✅ Solutions:
1. Remove some albums
2. Reduce sticker dimensions in Settings
3. Increase spacing between stickers
4. Check efficiency % - aim for <90%

#### Layout looks wrong
✅ Check:
1. Settings → Sticker dimensions (mm, not pixels)
2. Settings → Margins (top/bottom/left/right)
3. Settings → Spacing between stickers

### Print Issues

#### Print preview is blank/black
❌ Solutions:
1. Refresh the page
2. Check browser console for errors (F12)
3. Try different browser (Chrome/Firefox/Edge)

#### Colors don't print correctly
✅ Enable "Background graphics" in print dialog

#### Stickers print too small/large
✅ In print dialog:
- Set paper size to **A4**
- Set margins to **None**
- Set scale to **100%**

---

## 💻 Development

### Available Scripts

```bash
# Start frontend only (port 5173)
npm run dev

# Start backend only (port 3001)
npm run server

# Start both servers concurrently
npm run dev:all

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Development Workflow

1. **Make changes** to source files
2. **Hot reload** updates automatically (Vite HMR)
3. **Check browser** console for errors
4. **Test changes** with real albums
5. **Commit** when feature works

### Adding New Features

#### Add New Sticker Type
1. Update `settings` structure in `useAppStore.js`
2. Add dimensions in Settings UI
3. Create render function in `StickerPreview.jsx`
4. Update layout algorithm in `layoutOptimizer.js`

#### Add New Setting
1. Add to `settings` object in `useAppStore.js`
2. Add input field in `SettingsModal.jsx`
3. Use setting in relevant component
4. Test with undo/redo

#### Modify Algorithm
1. Edit `utils/layoutOptimizer.js`
2. Test with various album counts
3. Check efficiency statistics
4. Verify rotation works correctly

### Testing

**Manual Testing Checklist**:
- [ ] Add 10 albums via Spotify
- [ ] Edit album details
- [ ] Delete album
- [ ] Undo/redo actions
- [ ] Change settings (live preview works?)
- [ ] Save project
- [ ] Load project
- [ ] Print layout
- [ ] Check PDF output quality

### Deployment

**For production deployment**:

1. **Get domain** and **HTTPS certificate**
2. **Update `.env`**:
   ```env
   SPOTIFY_REDIRECT_URI=https://yourdomain.com/callback
   VITE_SPOTIFY_REDIRECT_URI=https://yourdomain.com/callback
   ```
3. **Update Spotify Dashboard** with new redirect URI
4. **Build**:
   ```bash
   npm run build
   ```
5. **Deploy** `dist/` folder to hosting service
6. **Deploy backend** to Node.js server
7. **Test** OAuth flow in production

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Credits

- **Spotify API** - Album metadata and artwork
- **ColorThief** - Dominant color extraction
- **React Team** - UI framework
- **Vite Team** - Build tool
- **TailwindCSS** - Styling framework

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation files
- Review troubleshooting section above

---

**Made with ❤️ for MiniDisc enthusiasts! 📀✨**
