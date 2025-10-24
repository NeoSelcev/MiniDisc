import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Migration function to upgrade old settings to new structure
function migrateSettings(settings) {
  if (!settings) return DEFAULT_SETTINGS;
  
  // Check if new structure exists (with fontStyles and renamed keys)
  if (settings.design?.fontStyles && settings.design?.fontSizes?.holderBackTitle) {
    // Remove obsolete disc face font settings if they exist
    if (settings.design.fontSizes.discFaceTitle) {
      delete settings.design.fontSizes.discFaceTitle;
      delete settings.design.fontSizes.discFaceArtist;
      delete settings.design.fontStyles.discFaceTitle;
      delete settings.design.fontStyles.discFaceArtist;
      delete settings.design.lineHeights.discFaceTitle;
      delete settings.design.lineHeights.discFaceArtist;
    }
    return settings;
  }
  
  // Migrate from old to new structure
  const oldFontSizes = settings.design?.fontSizes || {};
  
  return {
    ...settings,
    design: {
      ...settings.design,
      fontSizes: {
        spine: oldFontSizes.spine || settings.design?.trackFontSize || 8,
        face: oldFontSizes.face || 6,
        holderBackTitle: oldFontSizes.coverTitle || 5.5,
        holderBackArtist: oldFontSizes.coverArtist || 5,
        holderBackYear: oldFontSizes.holderBackYear || 5,
        trackList: oldFontSizes.trackList || settings.design?.trackFontSize || 4.5,
      },
      fontStyles: {
        spine: { bold: false, italic: false, underline: false },
        face: { bold: true, italic: false, underline: false },
        holderBackTitle: { bold: true, italic: false, underline: false },
        holderBackArtist: { bold: true, italic: false, underline: false },
        holderBackYear: { bold: false, italic: false, underline: false },
        trackList: { bold: true, italic: false, underline: false },
      },
      fontFamilies: {
        spine: 'Arial',
        face: 'Arial',
        holderBackTitle: 'Arial',
        holderBackArtist: 'Arial',
        holderBackYear: 'Arial',
        trackList: 'Arial',
      },
      lineHeights: {
        spine: 1.2,
        face: 1.2,
        holderBackTitle: 1.2,
        holderBackArtist: 1.2,
        holderBackYear: 1.2,
        trackList: 1.2,
      },
      // Remove old properties
      trackFontSize: undefined,
      trackLineHeight: undefined,
    },
  };
}

// Default settings based on real MiniDisc measurements
const DEFAULT_SETTINGS = {
  dimensions: {
    edgeSticker: { width: 58, height: 3 }, // mm - Disc edge sticker
    discFace: { width: 36, height: 53 }, // mm - Big sticker on disc
    holderFrontPartA: { width: 68, height: 65 }, // mm - Cover sticker
    holderFrontPartB: { width: 68, height: 3 }, // mm - Cover folded part (bottom spine)
    holderBack: { width: 68, height: 58 }, // mm - Inner cover for track list
  },
  print: {
    margins: { top: 6.35, bottom: 6.35, left: 6.35, right: 6.35 }, // mm
    dpi: 300,
    colorSpace: 'sRGB',
    cutLines: {
      enabled: true,
      color: '#000000',
      style: 'dashed', // solid, dashed, dotted
      width: 0.5,
    },
    bleedMarks: false,
    showLabels: false, // Show sticker type labels in preview
  },
  design: {
    colorExtraction: {
      numberOfColors: 3, // + 1 dominant
    },
    defaultFont: 'Inter',
    fontSizes: {
      spine: 8, // pt - Holder front edge (spine) sticker text
      face: 6, // pt - Disc face sticker text
      holderBackTitle: 5.5, // pt - Back cover (track list) album title
      holderBackArtist: 5, // pt - Back cover artist name
      holderBackYear: 5, // pt - Back cover year
      trackList: 4.5, // pt - Track names on back cover
    },
    fontStyles: {
      spine: { bold: false, italic: false, underline: false },
      face: { bold: true, italic: false, underline: false },
      holderBackTitle: { bold: true, italic: false, underline: false },
      holderBackArtist: { bold: true, italic: false, underline: false },
      holderBackYear: { bold: false, italic: false, underline: false },
      trackList: { bold: true, italic: false, underline: false },
    },
    fontFamilies: {
      spine: 'Arial',
      face: 'Arial',
      holderBackTitle: 'Arial',
      holderBackArtist: 'Arial',
      holderBackYear: 'Arial',
      trackList: 'Arial',
    },
    lineHeights: {
      spine: 1.2, // Line height multiplier
      face: 1.2,
      holderBackTitle: 1.2,
      holderBackArtist: 1.2,
      holderBackYear: 1.2,
      trackList: 1.2,
    },
    fontSizeRange: { min: 6, max: 24 }, // Overall limits
  },
  layout: {
    elementSpacing: 2, // mm
    allowRotation: true,
    setOrientation: 'portrait',
  },
  paper: {
    size: 'A4',
    width: 210, // mm
    height: 297, // mm
  },
};

const useAppStore = create(
  persist(
    (set, get) => ({
      // Settings
      settings: DEFAULT_SETTINGS,
      
      // Albums (MiniDiscs)
      albums: [],
      
      // Selected album for editing
      selectedAlbumId: null,
      
      // Undo/Redo stacks (max 10 actions)
      undoStack: [],
      redoStack: [],
      
      // Spotify auth
      spotifyAuth: {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      },
      
      // Project metadata
      projectMetadata: {
        name: 'Untitled Project',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      },
      
      // Actions
      updateSettings: (newSettings) => {
        set((state) => {
          const updated = {
            settings: { ...state.settings, ...newSettings },
            projectMetadata: {
              ...state.projectMetadata,
              modified: new Date().toISOString(),
            },
          };
          get().saveToUndoStack(state);
          return updated;
        });
      },
      
      addAlbum: (album) => {
        set((state) => {
          const newAlbum = {
            id: crypto.randomUUID(),
            spotifyId: album.spotifyId || null,
            albumName: album.albumName || '',
            artistName: album.artistName || '',
            year: album.year || new Date().getFullYear(),
            coverImage: album.coverImage || null,
            tracks: album.tracks || [],
            colors: album.colors || {
              dominant: '#000000',
              secondary: ['#666666', '#999999'],
            },
            stickers: {
              spine: { position: null, rotation: 0, customText: null },
              face: { position: null, rotation: 0 },
              frontFolded: { position: null, rotation: 0 },
              back: { position: null, rotation: 0, customText: null },
            },
            createdAt: new Date().toISOString(),
          };
          
          get().saveToUndoStack(state);
          
          return {
            albums: [...state.albums, newAlbum],
            projectMetadata: {
              ...state.projectMetadata,
              modified: new Date().toISOString(),
            },
          };
        });
      },
      
      removeAlbum: (albumId) => {
        set((state) => {
          get().saveToUndoStack(state);
          return {
            albums: state.albums.filter((a) => a.id !== albumId),
            selectedAlbumId: state.selectedAlbumId === albumId ? null : state.selectedAlbumId,
            projectMetadata: {
              ...state.projectMetadata,
              modified: new Date().toISOString(),
            },
          };
        });
      },
      
      updateAlbum: (albumId, updates) => {
        set((state) => {
          get().saveToUndoStack(state);
          return {
            albums: state.albums.map((album) =>
              album.id === albumId
                ? { ...album, ...updates }
                : album
            ),
            projectMetadata: {
              ...state.projectMetadata,
              modified: new Date().toISOString(),
            },
          };
        });
      },
      
      selectAlbum: (albumId) => {
        set({ selectedAlbumId: albumId });
      },
      
      // Undo/Redo functionality
      saveToUndoStack: (state) => {
        const snapshot = {
          albums: state.albums,
          settings: state.settings,
        };
        
        set((current) => ({
          undoStack: [...current.undoStack.slice(-9), snapshot], // Keep max 10
          redoStack: [], // Clear redo on new action
        }));
      },
      
      undo: () => {
        set((state) => {
          if (state.undoStack.length === 0) return state;
          
          const previous = state.undoStack[state.undoStack.length - 1];
          const currentSnapshot = {
            albums: state.albums,
            settings: state.settings,
          };
          
          return {
            ...previous,
            undoStack: state.undoStack.slice(0, -1),
            redoStack: [...state.redoStack, currentSnapshot],
            projectMetadata: {
              ...state.projectMetadata,
              modified: new Date().toISOString(),
            },
          };
        });
      },
      
      redo: () => {
        set((state) => {
          if (state.redoStack.length === 0) return state;
          
          const next = state.redoStack[state.redoStack.length - 1];
          const currentSnapshot = {
            albums: state.albums,
            settings: state.settings,
          };
          
          return {
            ...next,
            redoStack: state.redoStack.slice(0, -1),
            undoStack: [...state.undoStack, currentSnapshot],
            projectMetadata: {
              ...state.projectMetadata,
              modified: new Date().toISOString(),
            },
          };
        });
      },
      
      // Spotify auth
      setSpotifyAuth: (auth) => {
        set({ spotifyAuth: auth });
      },
      
      // Project management
      updateProjectMetadata: (metadata) => {
        set((state) => ({
          projectMetadata: { ...state.projectMetadata, ...metadata },
        }));
      },
      
      exportProject: () => {
        const state = get();
        return {
          version: '1.0',
          metadata: state.projectMetadata,
          settings: state.settings,
          albums: state.albums,
        };
      },
      
      importProject: (projectData) => {
        if (projectData.version !== '1.0') {
          throw new Error('Incompatible project version');
        }
        
        set({
          projectMetadata: projectData.metadata,
          settings: projectData.settings,
          albums: projectData.albums,
          undoStack: [],
          redoStack: [],
        });
      },
      
      resetProject: () => {
        set({
          albums: [],
          selectedAlbumId: null,
          undoStack: [],
          redoStack: [],
          projectMetadata: {
            name: 'Untitled Project',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: 'minidisc-storage', // localStorage key
      version: 1, // Increment when settings structure changes
      migrate: (persistedState, version) => {
        // Migrate old settings structure to new
        if (version === 0 || !version) {
          return {
            ...persistedState,
            settings: migrateSettings(persistedState.settings),
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        // Only persist specific fields
        settings: state.settings,
        albums: state.albums,
        projectMetadata: state.projectMetadata,
        spotifyAuth: state.spotifyAuth,
      }),
    }
  )
);

export default useAppStore;
