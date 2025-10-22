import { useState } from 'react';
import useAppStore from '../store/useAppStore';

function AlbumEditModal({ album, isOpen, onClose }) {
  const { updateAlbum } = useAppStore();
  const [formData, setFormData] = useState({
    albumName: album?.albumName || '',
    artistName: album?.artistName || '',
    year: album?.year || new Date().getFullYear(),
  });
  
  if (!isOpen || !album) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    updateAlbum(album.id, formData);
    onClose();
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value,
    }));
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Album</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {album.coverImage && (
            <div className="flex justify-center mb-4">
              <img
                src={album.coverImage}
                alt={album.albumName}
                className="w-32 h-32 rounded object-cover shadow-md"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Album Name
            </label>
            <input
              type="text"
              name="albumName"
              value={formData.albumName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artist Name
            </label>
            <input
              type="text"
              name="artistName"
              value={formData.artistName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="1900"
              max="2100"
            />
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Tracks:</strong> {album.tracks?.length || 0} tracks</p>
            {album.spotifyId && (
              <p className="text-xs text-gray-500 mt-1">
                Spotify ID: {album.spotifyId}
              </p>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AlbumEditModal;
