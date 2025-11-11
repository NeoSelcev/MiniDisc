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
      spine: 8, // pt - MiniDisc edge sticker (spine) text
      face: 6, // pt - Disc face sticker text
      holderBackTitle: 5.5, // pt - Back cover (track list) album title
      holderBackArtist: 5, // pt - Back cover artist name
      holderBackYear: 5, // pt - Back cover year
      trackList: 4.5, // pt - Track names on back cover
      trackDuration: 4.5, // pt - Track duration on back cover
    },
    fontStyles: {
      spine: { bold: false, italic: false, underline: false },
      face: { bold: true, italic: false, underline: false },
      holderBackTitle: { bold: true, italic: false, underline: false },
      holderBackArtist: { bold: true, italic: false, underline: false },
      holderBackYear: { bold: false, italic: false, underline: false },
      trackList: { bold: true, italic: false, underline: false },
      trackDuration: { bold: false, italic: false, underline: false },
    },
    fontFamilies: {
      spine: 'Arial',
      face: 'Arial',
      holderBackTitle: 'Arial',
      holderBackArtist: 'Arial',
      holderBackYear: 'Arial',
      trackList: 'Arial',
      trackDuration: 'Arial',
    },
    lineHeights: {
      spine: 1.2, // Line height multiplier
      face: 1.2,
      holderBackTitle: 1.2,
      holderBackArtist: 1.2,
      holderBackYear: 1.2,
      trackList: 1.2,
      trackDuration: 1.2,
    },
    letterSpacing: {
      spine: 0,
      face: 0,
      holderBackTitle: 0,
      holderBackArtist: 0,
      holderBackYear: 0,
      trackList: 0,
      trackDuration: 0,
    },
    trackListStyle: 'numbers', // 'numbers', 'dashes', 'bullets'
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
      
      // Active customization panel (only one can be open at a time)
      activeCustomizationPanel: null, // Format: { albumId: string, stickerType: string } or null
      
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
          stickerCustomization: album.stickerCustomization || null,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          get().saveToUndoStack(state);
          
          return {
            albums: [...state.albums, newAlbum],
            projectMetadata: {
              ...state.projectMetadata,
              modified: new Date().toISOString(),
            },
          };
        });
        
        return newAlbum; // Return the new album
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
      
      // Customization panel management
      openCustomizationPanel: (albumId, stickerType) => {
        set({ activeCustomizationPanel: { albumId, stickerType } });
      },
      
      closeCustomizationPanel: () => {
        set({ activeCustomizationPanel: null });
      },
      
      // Undo/Redo functionality
      saveToUndoStack: (state) => {
        const undoStack = [...state.undoStack, state];
        if (undoStack.length > 50) {
          undoStack.shift();
        }
        set({ undoStack, redoStack: [] });
      },

      // NEW: Update sticker customization for specific album and sticker type
      updateStickerCustomization: (albumId, stickerType, customization) => {
        set((state) => ({
          albums: state.albums.map((album) => {
            if (album.id === albumId) {
              // If customization is null, we want to remove it (reset to defaults)
              if (customization === null) {
                const newStickerCustomization = { ...album.stickerCustomization };
                delete newStickerCustomization[stickerType];
                return {
                  ...album,
                  stickerCustomization: newStickerCustomization,
                };
              }
              
              // Otherwise, merge the new customization
              return {
                ...album,
                stickerCustomization: {
                  ...album.stickerCustomization,
                  [stickerType]: {
                    ...(album.stickerCustomization?.[stickerType] || {}),
                    ...customization,
                  },
                },
              };
            }
            return album;
          }),
        }));
      },

      // NEW: Get effective customization (album-specific or global defaults)
      getStickerCustomization: (album, stickerType) => {
        const state = get();
        const albumCustom = album?.stickerCustomization?.[stickerType];
        
        // If album has custom settings, use them
        if (albumCustom) return albumCustom;
        
        // Otherwise, return defaults from settings
        const settings = state.settings;
        
        const defaults = {
          spine: {
            fontSize: 8,
            spineFontFamily: 'Arial',
            spineFontBold: false,
            spineFontItalic: false,
            spineFontUnderline: false,
            letterSpacing: 0,
            lineHeight: 1.2,
          },
          face: {
            // Face is image-only, no text settings
            imageZoom: 100,
            imageOffsetX: 0,
            imageOffsetY: 0,
          },
          front: {
            // Image Part: Image settings
            imageZoom: 100,
            imageOffsetX: 0,
            imageOffsetY: 0,
            // Edge Part (Spine): Fold text settings
            titleFontSize: 8,
            edgePartFontFamily: 'Arial',
            edgePartFontBold: false,
            edgePartFontItalic: false,
            edgePartFontUnderline: false,
            letterSpacing: 0,
            lineHeight: 1.2,
          },
          back: {
            // Album Title
            titleFontSize: 14,
            titleFontFamily: 'Arial',
            titleFontBold: false,
            titleFontItalic: false,
            titleFontUnderline: false,
            titleLineHeight: 1.2,
            titleLetterSpacing: 0,
            
            // Artist Name
            artistFontSize: 10,
            artistFontFamily: 'Arial',
            artistFontBold: false,
            artistFontItalic: false,
            artistFontUnderline: false,
            artistLineHeight: 1.2,
            artistLetterSpacing: 0,
            
            // Year of Production
            yearFontSize: 9,
            yearFontFamily: 'Arial',
            yearFontBold: false,
            yearFontItalic: false,
            yearFontUnderline: false,
            yearLineHeight: 1.2,
            yearLetterSpacing: 0,
            
            // Track List
            trackListFontSize: 8,
            trackListFontFamily: 'Arial',
            trackListFontBold: false,
            trackListFontItalic: false,
            trackListFontUnderline: false,
            trackListLineHeight: 1.2,
            trackListLetterSpacing: 0,
            trackListStyle: 'numbers',
            
            // Track Duration
            trackDurationFontSize: 6,
            trackDurationFontFamily: 'Arial',
            trackDurationFontBold: false,
            trackDurationFontItalic: false,
            trackDurationFontUnderline: false,
            trackDurationLineHeight: 1.2,
            trackDurationLetterSpacing: 0,
          },
        };
        
        return defaults[stickerType] || {};
      },
      
      // Get default values for a specific typography section
      getTypographyDefaults: (stickerType, section) => {
        const defaults = {
          back: {
            title: {
              fontFamily: 'Arial',
              fontBold: false,
              fontItalic: false,
              fontUnderline: false,
              fontSize: 14,
              lineHeight: 1.2,
              letterSpacing: 0
            },
            artist: {
              fontFamily: 'Arial',
              fontBold: false,
              fontItalic: false,
              fontUnderline: false,
              fontSize: 10,
              lineHeight: 1.2,
              letterSpacing: 0
            },
            year: {
              fontFamily: 'Arial',
              fontBold: false,
              fontItalic: false,
              fontUnderline: false,
              fontSize: 9,
              lineHeight: 1.2,
              letterSpacing: 0
            },
            trackList: {
              fontFamily: 'Arial',
              fontBold: false,
              fontItalic: false,
              fontUnderline: false,
              fontSize: 8,
              lineHeight: 1.2,
              letterSpacing: 0
            },
            trackDuration: {
              fontFamily: 'Arial',
              fontBold: false,
              fontItalic: false,
              fontUnderline: false,
              fontSize: 6,
              lineHeight: 1.2,
              letterSpacing: 0
            }
          }
        };
        
        return defaults[stickerType]?.[section] || {};
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
