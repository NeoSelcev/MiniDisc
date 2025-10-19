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
- **Location**: MiniDisc holder case front
- **Structure**: Two-part 90-degree folded sticker (L-shaped when flat)
  - **Part A (Large, Top)**: Album cover image - this is the main face
  - **Part B (Thin, Bottom)**: Album name + Artist name with album cover colors - this is the spine
  - **Fold line**: Horizontal line between Part A and Part B
- **Application Process**: 
  1. Print as single L-shaped sticker on flat paper
  2. Apply entire sticker to case front (Part A on face, Part B extends down)
  3. Fold Part B 90° around the bottom edge to wrap onto the spine
- **Dimensions**: Configurable in settings
  - Default Part A: ~68mm × ~68mm (front face)
  - Default Part B: ~68mm × ~15mm (bottom spine section)
  - Total flat sticker height: ~83mm (68mm + 15mm)
  - Fold line: 90 degrees at the junction between parts

### 4. MiniDisc Holder Back Sticker
- **Location**: Back of MiniDisc holder
- **Size**: Same dimensions as Part A of Sticker #3 (default: ~68mm × ~68mm)
- **Content**:
  - Album name
  - Artist name
  - Release year
  - Numbered track list with durations
- **Track List Formatting Rules**:
  - **Format**: `1. Track Name 3:45` (one track per row)
  - **Numbering**: Sequential starting from 1 (e.g., `1.`, `2.`, `3.`)
  - **Duration format**: `M:SS` (e.g., `3:45`, `12:03`)
  - **Overflow handling**: If track name is too long, truncate with ellipsis (`...`)
  - **Capacity overflow**: If more tracks than available rows, last row shows: `... and X more tracks` (where X = remaining count)
  - **Typography**: 
    - Line spacing: Regular/standard (1.0 to 1.2 line-height)
    - Padding: Balanced spacing for professional appearance
    - Margins: Adequate whitespace around edges
    - Font size: Auto-calculated to fit content while maintaining readability

---

## Core Features

### 1. Layout Optimization Engine
- Calculate optimal sticker placement on A4 paper (210mm × 297mm)
- Respect printer margins (average standard margins: ~6.35mm / 0.25" on all sides)
- **Complete set integrity**: Never split a MiniDisc's 4 stickers across pages
- Maximize paper usage while maintaining set integrity
- **One page at a time printing**: Users print pages individually, not batch
- Target: Fit maximum number of complete sticker sets on single A4 sheet
- **Layout Algorithm**: Shelf-based bin packing algorithm
  - Place stickers on horizontal "shelves"
  - Optimize shelf height based on sticker dimensions
  - Minimize wasted vertical space
- **Placement priorities**:
  - Set orientation support (portrait/landscape)
  - **Individual sticker rotation**: Each sticker can be rotated independently (90°, 180°, 270°) to optimize space
  - Minimum spacing between elements (default: 2mm, configurable)
  - Priority order: complete sets > space optimization > visual organization
- **Auto-layout behavior**:
  - Initial layout is automatically calculated
  - Maximum sets that fit are calculated dynamically based on sticker dimensions + margins + spacing
  - **If a set doesn't fit**: Prevent adding beyond capacity, show warning message
  - **Manual override**: After auto-layout, users can drag individual stickers to reposition
  - **Snap to grid**: Stickers snap to alignment grid when dragging for neat arrangement

### 2. Album Management Interface
- List view with placeholders for each MiniDisc
- Add/remove MiniDisc entries
- Edit individual sticker designs and text after auto-population
- **Maximum MiniDiscs per session**: Dynamically calculated based on:
  - Sticker dimensions (including padding and margins)
  - Element spacing (gaps between stickers)
  - A4 printable area (210mm × 297mm minus margins)
  - **Add button disabled** when maximum capacity reached
- **Drag-and-drop** positioning: Drag **individual stickers** (not entire sets) on page preview
  - **Snap to grid**: Stickers align to invisible grid for neat layout
  - **Auto-layout first**: Initial placement is automatic
  - **Manual editing after**: Users can reposition any sticker manually
- **Undo/Redo** functionality (Ctrl+Z / Ctrl+Y)
  - **Stack depth**: 10 actions
  - **Undoable actions**: Layout changes, text edits, color changes, additions/deletions
- **Keyboard shortcuts**:
  - Ctrl+S: Save project
  - Ctrl+Z: Undo
  - Ctrl+Y: Redo
  - Ctrl+P: Print preview
  - Delete: Remove selected MiniDisc/sticker
- **Auto-save**: Triggered on every change
  - Saves to localStorage immediately
  - **FIFO policy**: When localStorage is full, remove oldest auto-saves first

### 3. Spotify Integration
- Search albums via Spotify Web API (standard public API endpoints)
- **Authentication**: OAuth 2.0 flow with user's personal Spotify credentials
  - **Hosting**: Application hosted locally, Spotify API accessed over internet
  - **Callback URL**: `http://localhost:3000/callback` (or configured port)
  - **Token storage**: Store access token and refresh token in **localStorage**
  - **Token refresh**: Implement automatic token refresh according to Spotify documentation
    - Use refresh token to obtain new access token when expired
    - Handle 401 Unauthorized responses with automatic refresh attempt
  - **Error handling**:
    - **Token expired & refresh fails**: Show popup message, stop operations, redirect to re-authentication
    - **Subscription expired/invalid**: Show appropriate error message, stop Spotify-dependent operations
    - **Network errors**: Allow fallback to manual data entry
- Auto-fetch:
  - **Album artwork**: Fetch highest resolution available (up to 10cm print size requirement)
  - Album name
  - Artist name
  - Release year
  - Track list with durations (in seconds, converted to M:SS format)

### 4. Design Customization
- Edit all auto-populated content
- Modify individual sticker designs
- **Color extraction**: Extract 3 main colors + **most dominant color** from album covers
  - **Algorithm**: Use dominant color extraction (most frequent/prominent color)
  - **Application**: Dominant color used as primary background/accent
  - **Additional colors**: 2 complementary colors for variety
- Manual color picker override
- **Font selection**: 
  - **Default**: Common, nice, readable web-safe fonts (Inter, Roboto, Open Sans, etc.)
  - **Font embedding**: Fonts embedded in PDF for print consistency
  - **Licensing**: Only free-for-personal-use fonts
  - **No custom upload**: Use pre-selected font library only
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
- **Printer Margins**: Top, Bottom, Left, Right (default: 6.35mm each - average standard printer)
- **Print Resolution**: DPI (default: 300 DPI = 2480 × 3508 pixels for A4)
- **Color Space**: sRGB (default for web/screen), CMYK (optional for professional printing)
- **Cut Lines**: Toggle, color, style (solid/dashed/dotted), width
- **Bleed/Safe Zone**: Optional margins
- **Browser Support**: 
  - **Primary**: Chrome (development and testing target)
  - **Secondary**: Edge, Safari, Firefox (best-effort compatibility)
  - **No fancy features**: Use standard Web APIs for broad compatibility
  - **Feature detection**: Basic detection for critical APIs (Canvas, Blob, File API)

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
- **Paper Size**: A4 (210mm × 297mm) only - no pre-cuts
- No other paper sizes supported

### 8. Project Management
- **Save projects**: Export to **JSON file format**
  - **Version support**: Current version only (no migration between versions)
  - **Format**: JSON structure containing all project data (albums, stickers, settings, layout)
  - **Schema**: Implementation-defined structure (developer choice for optimal data representation)
- **Load projects**: Upload previously saved `.json` project files
  - **Validation**: Basic JSON schema validation on import
  - **Version mismatch**: If version incompatible, show error and reject import
- **Auto-save**: Automatic localStorage backup
  - **Trigger**: On every change (immediate)
  - **Storage management**: When localStorage is full, use FIFO (First-In-First-Out) - remove oldest auto-saves
  - **Recovery**: Session persistence to recover unsaved work on browser crash/refresh
- Work offline after initial Spotify authentication
- Project metadata: name, date created, last modified
- Export/import functionality (download/upload JSON files)

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
  - **Image constraints**:
    - Maximum file size: **15MB**
    - Maximum dimension: Up to **10cm at 300 DPI** (approximately 1181 pixels)
    - Minimum resolution: Sufficient for readable sticker printing (warn if below 300x300px)
    - **Quality optimization**: Use highest resolution for professional appearance
  - Show warning indicator on affected sticker
  - Suggest alternative search terms
- **Missing Track Data**:
  - Allow manual track entry
  - Show warning for incomplete data
  - Proceed with available information

#### Layout Errors
- **Sticker Set Overflow**:
  - Calculate and display maximum sets for current page (based on dimensions + padding + margins + spacing)
  - **Disable "Add" button** when maximum capacity reached
  - Show warning message: "Cannot add more sets - A4 page capacity reached"
  - **No multi-page mode**: Single A4 page limit enforced
- **Invalid Dimensions**:
  - **Validation rules** (applied in real-time):
    - Minimum sticker size: 5mm × 5mm (practical cutting limit)
    - Maximum sticker size: 200mm × 280mm (less than A4 printable area)
    - Margins: 0mm to 20mm
    - Spacing: 0mm to 10mm
    - DPI: 72 to 600
  - Show error message with acceptable ranges
  - Prevent saving invalid configurations
  - Revert to last valid values on invalid input

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

### Backend (Minimal - Local Server)
- **Server**: Node.js + Express (or any local dev server)
- **Purpose**: 
  - Serve static files locally
  - **Spotify OAuth callback handling**: Receive OAuth redirect and exchange code for token
  - Optional file system operations if needed
- **Hosting**: Runs on `localhost` (e.g., `http://localhost:3000`)
- **Not for production deployment**: Personal use only, local hosting

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
- **Modern**: Contemporary design patterns (developer's choice - surprise with good design)
- **Compact**: Efficient space utilization
- **Slick**: Smooth animations and transitions
- **Not too fancy**: Functional over decorative
- **Clean and professional**: Prioritize usability
- **No accessibility requirements**: Standard web practices sufficient

### Color Scheme
- Neutral base colors
- Accent colors from album artwork
- High contrast for readability
- Dark mode support (optional - if it looks good)

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

## Future Enhancements (Out of Scope for Initial Version)

### Potential Future Features
- Batch processing multiple albums
- Template library for different MiniDisc brands
- Custom sticker shapes/sizes
- Integration with other music services (Apple Music, Discogs)
- Multi-page support
- Other paper sizes beyond A4

### Testing Recommendations
- Print quality verification on actual A4 sticker paper
- Cut line accuracy testing
- Color reproduction accuracy
- Different printer compatibility testing

---

## Success Criteria

✓ App runs locally on laptop (localhost)
✓ Works offline after Spotify authentication  
✓ Regular A4 sticker paper support (no pre-cuts)  
✓ Complete sticker sets never split across pages  
✓ Print preview shows cut-out appearance  
✓ JSON project save/load (current version only)  
✓ Spotify integration working (OAuth + API)  
✓ 300 DPI output quality  
✓ Embedded fonts in PDF for print consistency  
✓ Modern, compact, slick UI (developer's creative choice)  
✓ All dimensions configurable with validation  
✓ Color extraction (dominant color + 2 additional colors)  
✓ One page at a time printing (A4 only)  
✓ Auto-layout with manual editing (drag individual stickers)  
✓ Undo/Redo (10 actions)  
✓ Auto-save on every change (FIFO when storage full)  
✓ Track list with ellipsis overflow and "...and X more" handling  
✓ Individual sticker rotation for space optimization  
✓ Maximum capacity calculation and enforcement  
✓ Snap-to-grid for manual positioning  

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
git clone https://github.com/NeoSelcev/MiniDisc.git

# Navigate to project
cd MiniDisc

# Install dependencies
npm install

# Set up Spotify API credentials
# Create .env file with:
# SPOTIFY_CLIENT_ID=your_client_id
# SPOTIFY_CLIENT_SECRET=your_client_secret
# SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

# Start development server
npm start

# Build for production
npm run build
```

---

## Technical Implementation Notes

### Color Extraction Details
- **Primary method**: Extract dominant color using frequency analysis
- **Algorithm**: Analyze pixel color distribution in album cover
- **Secondary colors**: Extract 2 additional complementary/contrasting colors
- **Usage**: Apply colors to sticker backgrounds, text overlays, and accent elements

### Track List Rendering Logic
```
For each track:
  1. Format as: "{number}. {name} {duration}"
  2. If track name width > container width:
     - Truncate name and append "..."
  3. Render track row

If total tracks > available rows:
  - Calculate overflow count: X = total_tracks - (available_rows - 1)
  - Replace last row with: "... and X more tracks"
```

### Layout Algorithm Pseudocode
```
function calculateLayout(sets, paperSize, margins, spacing):
  printableArea = paperSize - margins
  currentShelf = new Shelf()
  shelves = []
  
  for each set in sets:
    stickers = [spine, face, frontFolded, back]
    
    // Try to fit set on current shelf
    if currentShelf.canFit(stickers, spacing):
      currentShelf.add(stickers)
    else:
      // Start new shelf
      if hasVerticalSpace(shelves, printableArea):
        shelves.push(currentShelf)
        currentShelf = new Shelf()
        currentShelf.add(stickers)
      else:
        // Cannot fit - return max capacity reached
        return capacity: sets.indexOf(set)
  
  return layout: shelves
```

### Maximum Capacity Calculation
```
maxSets = floor(printableArea / (avgStickerSetArea + spacing))

Where:
  avgStickerSetArea = sum(all 4 stickers' dimensions)
  printableArea = (210mm - 2*margin) × (297mm - 2*margin)
  spacing = configurable gap between elements (default 2mm)
```

### Spotify OAuth Flow
```
1. User clicks "Connect Spotify"
2. Redirect to Spotify authorization page
3. User grants permissions
4. Spotify redirects to http://localhost:3000/callback?code=AUTH_CODE
5. Exchange AUTH_CODE for access_token and refresh_token
6. Store both tokens in localStorage
7. Use access_token for API requests
8. If 401 response: refresh token automatically
9. If refresh fails: show popup, clear storage, redirect to step 1
```

### JSON Project Schema Example
```json
{
  "version": "1.0",
  "metadata": {
    "name": "My MiniDiscs Collection",
    "created": "2025-10-19T12:00:00Z",
    "modified": "2025-10-19T14:30:00Z"
  },
  "settings": {
    "dimensions": { /* sticker sizes */ },
    "margins": { /* print margins */ },
    "spacing": 2,
    "dpi": 300
  },
  "albums": [
    {
      "id": "uuid",
      "spotifyId": "album_id",
      "albumName": "Album Title",
      "artistName": "Artist Name",
      "year": 2023,
      "coverImage": "base64_or_url",
      "tracks": [
        { "number": 1, "name": "Track 1", "duration": 225 }
      ],
      "colors": {
        "dominant": "#FF5733",
        "secondary": ["#C70039", "#900C3F"]
      },
      "stickers": {
        "spine": { /* position, rotation, customText */ },
        "face": { /* position, rotation */ },
        "frontFolded": { /* position, rotation */ },
        "back": { /* position, rotation, customText */ }
      }
    }
  ]
}
```

### Performance Optimization Tips
- Debounce auto-save to avoid excessive localStorage writes
- Use Web Workers for layout calculations if needed
- Lazy load album cover images
- Implement virtual scrolling for large album lists
- Cache color extraction results

---

Document Version: 3.0
Last Updated: 2025-10-19
Status: Final - Comprehensive and Implementation-Ready
Author: NeoSelcev
