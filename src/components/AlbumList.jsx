import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import SpotifySearch from './SpotifySearch';
import AlbumEditModal from './AlbumEditModal';
import { canAddAlbum } from '../utils/layoutOptimizer';

function AlbumList() {
  const { albums, settings, addAlbum, removeAlbum, selectAlbum, selectedAlbumId } = useAppStore();
  const [showSearch, setShowSearch] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  
  const canAdd = canAddAlbum(albums, settings);
  
  const handleManualAdd = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newAlbum = addAlbum({
      albumName: formData.get('albumName'),
      artistName: formData.get('artistName'),
      year: parseInt(formData.get('year')) || new Date().getFullYear(),
      tracks: [],
    });
    
    setShowManualAdd(false);
    e.target.reset();
    
    // Open edit modal immediately
    setEditingAlbum(newAlbum);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Albums ({albums.length})
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            disabled={!canAdd}
            className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title={canAdd ? 'Search Spotify' : 'Maximum capacity reached'}
          >
            🔍 Spotify
          </button>
          
          <button
            onClick={() => setShowManualAdd(!showManualAdd)}
            disabled={!canAdd}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title={canAdd ? 'Add manually' : 'Maximum capacity reached'}
          >
            ➕ Manual
          </button>
        </div>
      </div>
      
      {!canAdd && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          ⚠️ Maximum capacity reached - cannot add more albums
        </div>
      )}
      
      {/* Spotify Search */}
      {showSearch && (
        <div className="mb-4">
          <SpotifySearch onClose={() => setShowSearch(false)} />
        </div>
      )}
      
      {/* Manual Add Form */}
      {showManualAdd && (
        <form onSubmit={handleManualAdd} className="mb-4 p-3 bg-gray-50 rounded space-y-2">
          <input
            type="text"
            name="albumName"
            placeholder="Album name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            name="artistName"
            placeholder="Artist name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            name="year"
            placeholder="Year"
            min="1900"
            max="2100"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowManualAdd(false)}
              className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {/* Album List */}
      <div className="space-y-2">
        {albums.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No albums yet</p>
            <p className="text-sm">Add an album using Spotify search or manually</p>
          </div>
        ) : (
          albums.map((album) => (
            <div
              key={album.id}
              onClick={() => {
                setEditingAlbum(album);
              }}
              className="p-3 border border-gray-200 rounded cursor-pointer transition hover:border-primary-500 hover:bg-primary-50"
            >
              <div className="flex items-start space-x-3">
                {album.coverImage && (
                  <img
                    src={album.coverImage}
                    alt={album.albumName}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {album.albumName}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {album.artistName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {album.year} • {album.tracks.length} tracks
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Remove this album?')) {
                      removeAlbum(album.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Edit Album Modal */}
      {editingAlbum && (
        <AlbumEditModal
          album={editingAlbum}
          isOpen={true}
          onClose={() => setEditingAlbum(null)}
        />
      )}
    </div>
  );
}

export default AlbumList;
