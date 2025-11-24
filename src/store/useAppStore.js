import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Migration function to upgrade old settings to new structure
function migrateSettings(settings) {
  if (!settings) return DEFAULT_SETTINGS;
  
  // Check if new structure exists (with fontStyles and renamed keys)
  if (settings.design?.fontStyles && settings.design?.fontSizes?.holderBackTitle) {
    if (!settings.integrations) {
      settings.integrations = { spotify: { token: '' } };
    } else if (!settings.integrations.spotify) {
      settings.integrations.spotify = { token: '' };
    } else if (typeof settings.integrations.spotify.token !== 'string') {
      settings.integrations.spotify.token = settings.integrations.spotify.token || '';
    }
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
      integrations: settings.integrations || { spotify: { token: '' } },
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
  integrations: {
    spotify: {
      token: '',
    },
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
        set((state) => {
          const state_get = get();
          
          return {
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
                
                // Get current defaults to compare
                const defaults = state_get.getStickerCustomization({ id: album.id, stickerCustomization: null }, stickerType);
                
                // Check if customization differs from defaults
                const hasDifferences = Object.keys(customization).some(key => {
                  const customValue = customization[key];
                  const defaultValue = defaults[key];
                  
                  // Handle boolean values explicitly
                  if (typeof customValue === 'boolean' || typeof defaultValue === 'boolean') {
                    return customValue !== defaultValue;
                  }
                  
                  // Handle numeric values
                  if (typeof customValue === 'number' || typeof defaultValue === 'number') {
                    return customValue !== defaultValue;
                  }
                  
                  // Handle string values
                  return customValue !== defaultValue;
                });
                
                // If no differences, remove customization (keep in default state)
                if (!hasDifferences) {
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
          };
        });
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
            fontSize: settings.design.fontSizes.spine,
            spineFontFamily: settings.design.fontFamilies.spine,
            spineFontBold: settings.design.fontStyles.spine.bold,
            spineFontItalic: settings.design.fontStyles.spine.italic,
            spineFontUnderline: settings.design.fontStyles.spine.underline,
            letterSpacing: settings.design.letterSpacing.spine || 0,
            lineHeight: settings.design.lineHeights.spine,
          },
          face: {
            // Face is image-only, no text settings
            // At 100% zoom, square image fits the height of the sticker
            imageZoom: 100,
            imageOffsetX: 0,
            imageOffsetY: 0,
          },
          front: {
            // Image Part: Image settings
            imageZoom: 100,
            imageOffsetX: 0,
            imageOffsetY: 0,
            // Edge Part (Spine): Fold text settings - uses spine settings
            titleFontSize: settings.design.fontSizes.spine,
            edgePartFontFamily: settings.design.fontFamilies.spine,
            edgePartFontBold: settings.design.fontStyles.spine.bold,
            edgePartFontItalic: settings.design.fontStyles.spine.italic,
            edgePartFontUnderline: settings.design.fontStyles.spine.underline,
            edgePartLetterSpacing: settings.design.letterSpacing.spine || 0,
            edgePartLineHeight: settings.design.lineHeights.spine,
            letterSpacing: settings.design.letterSpacing.spine || 0,
            lineHeight: settings.design.lineHeights.spine,
          },
          back: {
            // Album Title
            titleFontSize: settings.design.fontSizes.holderBackTitle,
            titleFontFamily: settings.design.fontFamilies.holderBackTitle,
            titleFontBold: settings.design.fontStyles.holderBackTitle.bold,
            titleFontItalic: settings.design.fontStyles.holderBackTitle.italic,
            titleFontUnderline: settings.design.fontStyles.holderBackTitle.underline,
            titleLineHeight: settings.design.lineHeights.holderBackTitle,
            titleLetterSpacing: settings.design.letterSpacing.holderBackTitle || 0,
            
            // Artist Name
            artistFontSize: settings.design.fontSizes.holderBackArtist,
            artistFontFamily: settings.design.fontFamilies.holderBackArtist,
            artistFontBold: settings.design.fontStyles.holderBackArtist.bold,
            artistFontItalic: settings.design.fontStyles.holderBackArtist.italic,
            artistFontUnderline: settings.design.fontStyles.holderBackArtist.underline,
            artistLineHeight: settings.design.lineHeights.holderBackArtist,
            artistLetterSpacing: settings.design.letterSpacing.holderBackArtist || 0,
            
            // Year of Production
            yearFontSize: settings.design.fontSizes.holderBackYear,
            yearFontFamily: settings.design.fontFamilies.holderBackYear,
            yearFontBold: settings.design.fontStyles.holderBackYear.bold,
            yearFontItalic: settings.design.fontStyles.holderBackYear.italic,
            yearFontUnderline: settings.design.fontStyles.holderBackYear.underline,
            yearLineHeight: settings.design.lineHeights.holderBackYear,
            yearLetterSpacing: settings.design.letterSpacing.holderBackYear || 0,
            
            // Track List
            trackListFontSize: settings.design.fontSizes.trackList,
            trackListFontFamily: settings.design.fontFamilies.trackList,
            trackListFontBold: settings.design.fontStyles.trackList.bold,
            trackListFontItalic: settings.design.fontStyles.trackList.italic,
            trackListFontUnderline: settings.design.fontStyles.trackList.underline,
            trackListLineHeight: settings.design.lineHeights.trackList,
            trackListLetterSpacing: settings.design.letterSpacing.trackList || 0,
            trackListStyle: settings.design.trackListStyle,
            
            // Track Duration
            trackDurationFontSize: settings.design.fontSizes.trackDuration,
            trackDurationFontFamily: settings.design.fontFamilies.trackDuration,
            trackDurationFontBold: settings.design.fontStyles.trackDuration.bold,
            trackDurationFontItalic: settings.design.fontStyles.trackDuration.italic,
            trackDurationFontUnderline: settings.design.fontStyles.trackDuration.underline,
            trackDurationLineHeight: settings.design.lineHeights.trackDuration,
            trackDurationLetterSpacing: settings.design.letterSpacing.trackDuration || 0,
          },
        };
        
        return defaults[stickerType] || {};
      },
      
      // Get default values for a specific typography section
      getTypographyDefaults: (stickerType, section) => {
        const state = get();
        const settings = state.settings;
        
        const defaults = {
          front: {
            edgePart: {
              fontFamily: settings.design.fontFamilies.spine,
              fontBold: settings.design.fontStyles.spine.bold,
              fontItalic: settings.design.fontStyles.spine.italic,
              fontUnderline: settings.design.fontStyles.spine.underline,
              fontSize: settings.design.fontSizes.spine,
              lineHeight: settings.design.lineHeights.spine,
              letterSpacing: settings.design.letterSpacing.spine || 0
            }
          },
          back: {
            title: {
              fontFamily: settings.design.fontFamilies.holderBackTitle,
              fontBold: settings.design.fontStyles.holderBackTitle.bold,
              fontItalic: settings.design.fontStyles.holderBackTitle.italic,
              fontUnderline: settings.design.fontStyles.holderBackTitle.underline,
              fontSize: settings.design.fontSizes.holderBackTitle,
              lineHeight: settings.design.lineHeights.holderBackTitle,
              letterSpacing: settings.design.letterSpacing.holderBackTitle || 0
            },
            artist: {
              fontFamily: settings.design.fontFamilies.holderBackArtist,
              fontBold: settings.design.fontStyles.holderBackArtist.bold,
              fontItalic: settings.design.fontStyles.holderBackArtist.italic,
              fontUnderline: settings.design.fontStyles.holderBackArtist.underline,
              fontSize: settings.design.fontSizes.holderBackArtist,
              lineHeight: settings.design.lineHeights.holderBackArtist,
              letterSpacing: settings.design.letterSpacing.holderBackArtist || 0
            },
            year: {
              fontFamily: settings.design.fontFamilies.holderBackYear,
              fontBold: settings.design.fontStyles.holderBackYear.bold,
              fontItalic: settings.design.fontStyles.holderBackYear.italic,
              fontUnderline: settings.design.fontStyles.holderBackYear.underline,
              fontSize: settings.design.fontSizes.holderBackYear,
              lineHeight: settings.design.lineHeights.holderBackYear,
              letterSpacing: settings.design.letterSpacing.holderBackYear || 0
            },
            trackList: {
              fontFamily: settings.design.fontFamilies.trackList,
              fontBold: settings.design.fontStyles.trackList.bold,
              fontItalic: settings.design.fontStyles.trackList.italic,
              fontUnderline: settings.design.fontStyles.trackList.underline,
              fontSize: settings.design.fontSizes.trackList,
              lineHeight: settings.design.lineHeights.trackList,
              letterSpacing: settings.design.letterSpacing.trackList || 0
            },
            trackDuration: {
              fontFamily: settings.design.fontFamilies.trackDuration,
              fontBold: settings.design.fontStyles.trackDuration.bold,
              fontItalic: settings.design.fontStyles.trackDuration.italic,
              fontUnderline: settings.design.fontStyles.trackDuration.underline,
              fontSize: settings.design.fontSizes.trackDuration,
              lineHeight: settings.design.lineHeights.trackDuration,
              letterSpacing: settings.design.letterSpacing.trackDuration || 0
            }
          },
          spine: {
            spine: {
              fontFamily: settings.design.fontFamilies.spine,
              fontBold: settings.design.fontStyles.spine.bold,
              fontItalic: settings.design.fontStyles.spine.italic,
              fontUnderline: settings.design.fontStyles.spine.underline,
              fontSize: settings.design.fontSizes.spine,
              lineHeight: settings.design.lineHeights.spine,
              letterSpacing: settings.design.letterSpacing.spine || 0
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
        set((state) => {
          const token = auth?.accessToken || '';
          const updatedSettings = {
            ...state.settings,
            integrations: {
              ...state.settings.integrations,
              spotify: {
                ...state.settings.integrations?.spotify,
                token,
              },
            },
          };
          return {
            spotifyAuth: auth,
            settings: updatedSettings,
            projectMetadata: {
              ...state.projectMetadata,
              modified: new Date().toISOString(),
            },
          };
        });
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
