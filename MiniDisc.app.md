# MiniDisc Sticker Printer - Project Requirements

## Project Overview
A web application to design and print custom stickers for Sony MiniDisc albums, optimizing layout on A4 sticky paper. The application will run locally on your laptop.

## Hardware Context
- **Device**: Sony MiniDisc player
- **Media**: Multiple MiniDiscs
- **Printing**: Regular A4 sticker paper (no pre-cuts) on standard printer

---

## Sticker Requirements per MiniDisc

Each MiniDisc requires **4 different stickers**:

### 1. Edge Sticker (Spine)
- **Location**: Thin edge of the MiniDisc
- **Content**: 
  - Album name
  - Artist name
  - Background colors extracted from album cover (3 main colors + main font color)
- **Dimensions**: Configurable in settings (default: ~68mm × ~4mm)

### 2. MiniDisc Face Sticker
- **Location**: On the MiniDisc itself
- **Content**: Album cover image
- **Dimensions**: Configurable in settings (default: ~60mm × ~60mm)

### 3. MiniDisc Holder Front Sticker (90° Folded)
- **Location**: MiniDisc holder case
- **Structure**: Two-part 90-degree folded sticker
  - **Part A (Large)**: Album cover image
  - **Part B (Thin)**: Album name + Artist name with album cover colors
- **Dimensions**: Configurable in settings
  - Default Part A: ~68mm × ~68mm
  - Default Part B: ~68mm × ~15mm
  - Fold line: 90 degrees

### 4. MiniDisc Holder Back Sticker
- **Location**: Back of MiniDisc holder
- **Size**: Same dimensions as Part A of Sticker #3
- **Content**:
  - Album name
  - Artist name
  - Release year
  - Numbered track list with durations

---

## Core Features

### 1. Layout Optimization Engine
- Calculate optimal sticker placement on A4 paper (210mm × 297mm)
- Respect printer margins (standard Word-like margins: ~6.35mm / 0.25")
- **Complete set integrity**: Never split a MiniDisc's 4 stickers across pages
- Maximize paper usage while maintaining set integrity
- **One page at a time printing**: Users print pages individually, not batch
- Target: Fit maximum number of complete sticker sets on single A4 sheet
- **Placement priorities**:
  - Set orientation support (portrait/landscape)
  - Individual sticker rotation allowed (90°, 180°, 270°)
  - Minimum spacing between elements (default: 2mm, configurable)
  - Priority order: complete sets > orientation > spacing optimization

### 2. Album Management Interface
- List view with placeholders for each MiniDisc
- Add/remove MiniDisc entries
- Edit individual sticker designs and text after auto-population
- Maximum MiniDiscs per session: As many as can fit on a single A4 page
- **Drag-and-drop** positioning on page preview
- **Undo/Redo** functionality (Ctrl+Z / Ctrl+Y)
- **Keyboard shortcuts**:
  - Ctrl+S: Save project
  - Ctrl+Z: Undo
  - Ctrl+Y: Redo
  - Ctrl+P: Print preview
  - Delete: Remove selected MiniDisc
- **Auto-save**: User settings and preferences to localStorage

### 3. Spotify Integration
- Search albums via Spotify API
- Authenticate with user's Spotify credentials (personal paid subscription)
- Auto-fetch:
  - Album artwork (highest resolution available)
  - Album name
  - Artist name
  - Release year
  - Track list with durations

### 4. Design Customization
- Edit all auto-populated content
- Modify individual sticker designs
- **Color extraction**: Extract 3 main colors + main font color from album covers
- Manual color picker override
- **Font selection**: 
  - **Default**: Common, nice, readable font (e.g., Inter, Roboto, Open Sans)
  - **Manual selection**: Choose from font library
  - Font upload capability (optional)
- Preview before printing
- Text size/alignment adjustments

### 5. Print Generation
- Generate print-ready files (one page at a time)
- A4 layout (210mm × 297mm) with **cut lines** for precise cutting
- Standard print resolution: **300 DPI** (configurable)
- **Output format**: PDF (primary), PNG (secondary option)
- Cut line styles: Solid, dashed, dotted (configurable)
- Bleed marks and alignment guides (optional)

### 6. Print Preview Feature ✓
- **Full visual preview** showing:
  - Exact layout on A4 paper
  - Cut lines visualization
  - **How stickers will look when cut out** (individual preview)
  - Zoom/detail view for each sticker
- Toggle cut lines on/off in preview
- Print simulation mode
- Before/after cutting visualization

### 7. Settings Page
All dimensions and specifications are configurable:

#### Sticker Dimensions
- Edge sticker (spine): width × height (default: 68mm × 4mm)
- MiniDisc face sticker: width × height (default: 60mm × 60mm)
- Holder front Part A: width × height (default: 68mm × 68mm)
- Holder front Part B: width × height (default: 68mm × 15mm)
- Holder back: width × height (auto-matches Part A)

#### Print Settings
- **Printer Margins**: Top, Bottom, Left, Right (default: 6.35mm each)
- **Print Resolution**: DPI (default: 300 DPI = 2480 × 3508 pixels for A4)
- **Color Space**: sRGB (default for web/screen), CMYK (optional for professional printing)
- **Cut Lines**: Toggle, color, style (solid/dashed/dotted), width
- **Bleed/Safe Zone**: Optional margins
- **Browser Support**: Chrome (primary), Edge, Safari (Firefox optional)

#### Design Settings
- **Color Extraction**: Number of colors (default: 3 + font color)
- **Default Font**: Selection dropdown (default: Inter/Roboto/Open Sans)
- **Font Size Range**: Min/max limits
- **Text Alignment**: Options for each sticker type

#### Layout Settings
- **Element Spacing**: Minimum gap between stickers (default: 2mm)
- **Rotation Options**: Allow 90°/180°/270° rotation of individual stickers
- **Set Orientation**: Prefer portrait or landscape for sticker sets
- **Optimization Priority**: Balance between density and visual organization

#### Paper Settings
- **Paper Size**: A4 (210mm × 297mm) - no pre-cuts
- Future: Support for other sizes

### 8. Project Management
- **Save projects**: Export to **JSON file format** ✓
- **Load projects**: Upload previously saved `.json` project files
- **Auto-save**: Optional local storage backup
- Work offline after initial load
- Session persistence (recover unsaved work)
- Project metadata: name, date created, last modified
- Export/import functionality

### 9. Error Handling

Comprehensive error handling for common failure scenarios:

#### Spotify API Errors
- **Connection Failed**: 
  - Display user-friendly error message
  - Offer retry option with exponential backoff
  - Allow manual data entry as fallback
  - Show offline mode indicator
- **Authentication Errors**:
  - Clear authentication state
  - Redirect to re-authentication flow
  - Preserve unsaved work during re-auth
- **Rate Limiting**:
  - Display waiting period to user
  - Queue requests automatically
  - Show progress indicator

#### Album Data Errors
- **Album Cover Not Found**:
  - Display placeholder image
  - Allow manual image upload (JPG, PNG, WebP)
  - Show warning indicator on affected sticker
  - Suggest alternative search terms
- **Missing Track Data**:
  - Allow manual track entry
  - Show warning for incomplete data
  - Proceed with available information

#### Layout Errors
- **Sticker Set Overflow**:
  - Calculate and display maximum sets for current page
  - Show warning when adding beyond capacity
  - Suggest removing sets or adjusting dimensions
  - Offer multi-page mode (future feature)
- **Invalid Dimensions**:
  - Validate input in real-time
  - Show error message with acceptable ranges
  - Prevent saving invalid configurations
  - Revert to last valid values

#### Print/Export Errors
- **PDF Generation Failed**:
  - Log detailed error information
  - Offer PNG export as alternative
  - Check browser compatibility
  - Suggest trying different browser
- **Browser Compatibility Issues**:
  - Detect unsupported features on load
  - Display browser requirements clearly
  - Recommend supported browsers (Chrome/Edge/Safari)

#### General Error Handling
- **Network Errors**: Graceful degradation to offline mode
- **Local Storage Full**: Clear old auto-saves, warn user
- **Invalid JSON Import**: Validate schema, show specific error
- **Unexpected Errors**: Log to console, show generic user message, offer bug report

---

## Technical Stack

### Frontend
- **Framework**: React (latest stable version)
- **UI Design**: **Modern, compact, slick, not too fancy** ✓
  - Clean minimalist interface
  - Efficient use of space
  - Smooth interactions
  - Consider: TailwindCSS, shadcn/ui, or custom CSS
- **Runtime**: Browser-based, runs locally
- **Offline capability**: Progressive Web App (PWA) features
- **State Management**: React Context API or Zustand

### Backend (Optional/Minimal)
- **Server**: Node.js + Express
- **Purpose**: 
  - Local development server
  - Spotify OAuth callback handling
  - File system operations (if needed)

### APIs & Libraries
- **Spotify Web API**: 
  - Album search endpoint
  - Track details endpoint
  - High-res artwork retrieval
  - OAuth 2.0 authentication flow
  - User authentication with personal paid subscription

- **Color Extraction**:
  - `node-vibrant` or `color-thief`
  - Extract 3 main colors + font color

- **PDF Generation**:
  - `jsPDF` or `pdfkit`
  - High-quality export at 300 DPI

- **Font Handling**:
  - Google Fonts API integration
  - Default: Inter, Roboto, or Open Sans
  - Custom font upload support

- **Layout Calculation**:
  - Custom bin-packing algorithm
  - Optimize A4 space usage
  - Maintain complete set integrity

---

## UI/UX Design Principles

### Visual Style
- **Modern**: Contemporary design patterns
- **Compact**: Efficient space utilization
- **Slick**: Smooth animations and transitions
- **Not too fancy**: Functional over decorative
- **Accessible**: Clear contrast, readable fonts

### Color Scheme
- Neutral base colors
- Accent colors from album artwork
- High contrast for readability
- Dark mode support (optional)

### Layout
- Clean navigation
- Contextual toolbars
- Minimal chrome
- Focus on content (album artwork and stickers)

---

## User Flow

1. **Setup**: Configure settings (or use defaults)
2. **Add MiniDiscs**: Create placeholders for albums
3. **Search & Import**: Use Spotify to find albums and auto-populate
4. **Customize**: Edit designs, text, fonts, and colors
5. **Preview**: Review all stickers with cut-out visualization
6. **Export**: Generate one A4 page at a time as PDF/PNG
7. **Print**: Print on regular A4 sticky paper
8. **Save**: Export project as JSON for later use
9. **Cut**: Use cut lines to precisely cut stickers

---

## Standard Reference Dimensions

Based on Sony MiniDisc specifications:
- **MiniDisc case dimensions**: Approximately 72mm × 68mm × 5mm (w/h/d)
- **MiniDisc disc diameter**: Approximately 64mm
- **Case spine**: Approximately 68mm × 5mm

*(All dimensions are configurable in the Settings page)*

---

## File Structure (Suggested)

minidisc-sticker-printer/├── README.md├── REQUIREMENTS.md (this file)├── package.json├── public/│   └── index.html├── src/│   ├── components/│   │   ├── AlbumList.jsx│   │   ├── StickerDesigner.jsx│   │   ├── LayoutPreview.jsx│   │   ├── PrintPreview.jsx│   │   ├── Settings.jsx│   │   └── SpotifySearch.jsx│   ├── utils/│   │   ├── colorExtraction.js│   │   ├── layoutOptimizer.js│   │   ├── pdfGenerator.js│   │   └── spotifyAPI.js│   ├── hooks/│   │   ├── useSpotify.js│   │   └── useProject.js│   ├── App.jsx│   └── index.jsx└── server/ (optional)└── index.js

---

## Development Phases

### Phase 1: Foundation
- [ ] Set up React project structure
- [ ] Create Settings page with all configurable options
- [ ] Implement default dimensions and values
- [ ] Build basic UI layout (modern, compact, slick)

### Phase 2: Core Features
- [ ] Implement layout optimization algorithm
- [ ] Create sticker design templates
- [ ] Build album management interface
- [ ] Add/remove MiniDisc functionality

### Phase 3: Spotify Integration
- [ ] Set up Spotify OAuth flow
- [ ] Implement album search
- [ ] Fetch album metadata and artwork
- [ ] Auto-populate sticker data

### Phase 4: Design Tools
- [ ] Color extraction from album covers
- [ ] Font selection system (default: Inter/Roboto/Open Sans)
- [ ] Manual customization tools
- [ ] Text editing and formatting

### Phase 5: Print Features
- [ ] Print preview with cut-out visualization
- [ ] PDF generation at 300 DPI
- [ ] Cut lines rendering
- [ ] A4 layout optimization

### Phase 6: Project Management
- [ ] Save to JSON functionality
- [ ] Load from JSON functionality
- [ ] Auto-save to local storage
- [ ] Session recovery

### Phase 7: Polish & Testing
- [ ] UI refinements
- [ ] Cross-browser testing
- [ ] Print quality testing
- [ ] User documentation

---

## Open Questions & Future Enhancements

### Potential Features
- Batch processing multiple albums
- Template library for different MiniDisc brands
- Custom sticker shapes/sizes
- Integration with other music services (Apple Music, Discogs)
- Web-based collaboration
- Printing service integration

### Testing Needs
- Print quality verification on actual A4 sticker paper
- Cut line accuracy testing
- Color reproduction accuracy
- Different printer compatibility

---

## Success Criteria

✓ App runs locally on laptop  
✓ Works offline after initial setup  
✓ Regular A4 sticker paper support (no pre-cuts)  
✓ Complete sticker sets never split across pages  
✓ Print preview shows cut-out appearance  
✓ JSON project save/load  
✓ Spotify integration working  
✓ 300 DPI output quality  
✓ Manual font selection with nice default  
✓ Modern, compact, slick UI (not too fancy)  
✓ All dimensions configurable  
✓ Color extraction (3 colors + font color)  
✓ One page at a time printing  

---

## Deployment & Hosting

### Initial Deployment
- **Local only**: Runs on user's laptop via `npm start`
- Simple installation process
- Cross-platform support (Windows, macOS, Linux)

### Future Options
- GitHub Pages (static hosting)
- Vercel/Netlify deployment
- Electron app (desktop application)
- Docker containerization

---

## Installation Instructions (Draft)

```bash
# Clone repository
git clone https://github.com/viatchesla-p-max-co-il/minidisc-sticker-printer.git

# Navigate to project
cd minidisc-sticker-printer

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

Document Version: 2.0Last Updated: 2025-10-18Status: Final - Ready for DevelopmentAuthor: viatchesla-p-max-co-il


Notes

• All sticker dimensions based on standard Sony MiniDisc cases (~72mm × 68mm × 5mm)

• User will provide own Spotify API credentials (paid subscription)

• Font extraction from album covers is optional/experimental

• Primary focus: quality output for physical sticker printing

• Design philosophy: Functional, clean, efficient

---

**To save this file:**
1. Copy the entire content above (between the triple backticks)
2. Open a text editor (Notepad, VS Code, etc.)
3. Paste the content
4. Save as `REQUIREMENTS.md`

Would you also like me to create a GitHub repository with this file for you? I can push it to `viatchesla-p-max-co-il/minidisc-sticker-printer` right now!
