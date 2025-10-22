# 📀 MiniDisc Sticker Printer

A modern web application to design and print custom stickers for Sony MiniDisc albums, optimizing layout on A4 sticky paper.

## ✨ Features

- **Spotify Integration** - Auto-fetch album artwork, track lists, and metadata
- **Smart Layout Optimization** - Bin-packing algorithm fits maximum sticker sets on A4 paper
- **4 Sticker Types per MiniDisc**:
  - Edge sticker (spine)
  - MiniDisc face sticker
  - Holder front sticker (90° folded L-shape)
  - Holder back sticker with track list
- **Color Extraction** - Automatically extract dominant colors from album covers
- **Print-Ready PDF Export** - 300 DPI output with cut lines
- **Configurable Settings** - All dimensions and margins are customizable
- **Project Save/Load** - Export/import projects as JSON
- **Auto-save** - Work is automatically saved to localStorage
- **Undo/Redo** - 10-level action history (Ctrl+Z / Ctrl+Y)

## 🚀 Quick Start

### Prerequisites

- Node.js v20.19+ or v22.12+ (required for Vite 7)
- npm or yarn
- Spotify Developer Account (for API credentials)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NeoSelcev/MiniDisc.git
   cd MiniDisc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Spotify API**
   
   📖 **See [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md) for detailed instructions**
   
   Quick version:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://localhost:5173/callback` to Redirect URIs
   - Copy Client ID and Client Secret
   - Note: The "Redirect URI not secure" warning is **normal for localhost** and can be ignored

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Spotify credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
   
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
   ```

5. **Start the application**
   ```bash
   # Start both frontend and backend servers
   npm run dev:all
   
   # Or start them separately:
   npm run dev      # Frontend (Vite) on port 5173
   npm run server   # Backend (Express) on port 3001
   ```

6. **Open in browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 📖 Usage

### Adding Albums

1. **Via Spotify Search**:
   - Click "🔍 Spotify" button
   - Connect to Spotify (first time only)
   - Search for album or artist
   - Click on an album to add it

2. **Manually**:
   - Click "➕ Manual" button
   - Enter album name, artist, and year
   - Add manually (tracks can be added later)

### Designing Stickers

- Albums are listed in the left sidebar
- Preview updates automatically in real-time
- Click on an album to select and edit
- Adjust settings via ⚙️ Settings page

### Exporting

1. Review layout in preview area
2. Toggle cut lines on/off
3. Click "📄 Export PDF" button
4. Save PDF file
5. Print on A4 sticky paper at 100% scale (no fit-to-page)

### Keyboard Shortcuts

- `Ctrl+S` - Save project
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Delete` - Remove selected album

## ⚙️ Settings

All dimensions and print settings are fully configurable:

- **Sticker Dimensions** - Width and height for each sticker type
- **Print Settings** - DPI, margins, element spacing
- **Cut Lines** - Style, color, visibility
- **Layout Options** - Spacing, orientation preferences

Default dimensions are based on standard Sony MiniDisc specifications.

## 🎨 Tech Stack

- **Frontend**: React 19 + Vite 7
- **Styling**: TailwindCSS 3
- **State Management**: Zustand with persist middleware
- **PDF Generation**: jsPDF
- **Color Extraction**: ColorThief
- **API Client**: Axios
- **Backend**: Node.js + Express
- **Authentication**: Spotify OAuth 2.0

## 📁 Project Structure

```
MiniDisc/
├── public/              # Static assets
├── server/              # Express backend
│   └── index.js         # API server for Spotify OAuth
├── src/
│   ├── components/      # React components
│   │   ├── Header.jsx
│   │   ├── AlbumList.jsx
│   │   ├── SpotifySearch.jsx
│   │   ├── SpotifyCallback.jsx
│   │   ├── LayoutPreview.jsx
│   │   ├── StickerPreview.jsx
│   │   └── Settings.jsx
│   ├── store/           # Zustand state management
│   │   └── useAppStore.js
│   ├── utils/           # Utility functions
│   │   ├── layoutOptimizer.js
│   │   ├── colorExtraction.js
│   │   ├── spotifyAPI.js
│   │   └── pdfGenerator.js
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── .env.example         # Environment template
├── package.json
└── README.md
```

## 🔧 Development

### Running Tests

```bash
# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Adding Features

The codebase is modular and well-commented. Key areas:

- **Layout Algorithm**: `src/utils/layoutOptimizer.js`
- **PDF Generation**: `src/utils/pdfGenerator.js`
- **State Management**: `src/store/useAppStore.js`
- **Components**: `src/components/`

## 📝 Notes

- Maximum albums per page depends on sticker dimensions and spacing
- App automatically calculates capacity and disables "Add" when full
- All changes are auto-saved to localStorage (FIFO when storage is full)
- Spotify authentication tokens are stored securely in localStorage
- Works offline after initial Spotify authentication

## 🐛 Troubleshooting

### Node.js Version Error

If you see engine warnings, upgrade Node.js:
```bash
# Check version
node --version

# Should be v20.19+ or v22.12+
```

### Spotify Connection Issues

- Ensure redirect URI matches exactly: `http://localhost:5173/callback`
- Check that both `.env` variables are set
- Verify API credentials in Spotify Dashboard

### Layout Overflow

- Reduce number of albums
- Decrease sticker dimensions in Settings
- Increase margins/spacing

## 📜 License

This project is for personal use. MiniDisc is a trademark of Sony Corporation.

## 👤 Author

**NeoSelcev**
- GitHub: [@NeoSelcev](https://github.com/NeoSelcev)

## 🙏 Acknowledgments

- Sony for the MiniDisc format
- Spotify for their excellent API
- The React and Vite communities

---

**Made with ❤️ for MiniDisc enthusiasts**


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
