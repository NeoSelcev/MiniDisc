import { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';

function AlbumEditModal({ album, isOpen, onClose }) {
  const { updateAlbum } = useAppStore();
  const [formData, setFormData] = useState({
    albumName: '',
    artistName: '',
    year: new Date().getFullYear(),
    tracks: [],
  });
  const [originalData, setOriginalData] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Sync formData with album prop when it changes
  useEffect(() => {
    if (album) {
      const data = {
        albumName: album.albumName || '',
        artistName: album.artistName || '',
        year: album.year || new Date().getFullYear(),
        tracks: album.tracks || [],
      };
      setFormData(data);
      setOriginalData(JSON.parse(JSON.stringify(data))); // Deep clone
    }
  }, [album]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, formData, originalData]);
  
  if (!isOpen || !album) return null;

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleClose = () => {
    if (hasChanges()) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleSaveAndClose = () => {
    updateAlbum(album.id, formData);
    setShowConfirmDialog(false);
    onClose();
  };

  const handleDiscardAndClose = () => {
    setShowConfirmDialog(false);
    onClose();
  };
  
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

  const handleTrackChange = (index, field, value) => {
    const newTracks = [...formData.tracks];
    newTracks[index] = {
      ...newTracks[index],
      [field]: value,
    };
    setFormData(prev => ({ ...prev, tracks: newTracks }));
  };

  const addTrack = () => {
    setFormData(prev => ({
      ...prev,
      tracks: [...prev.tracks, { name: '', duration: '' }],
    }));
  };

  const removeTrack = (index) => {
    setFormData(prev => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index),
    }));
  };

  const moveTrack = (index, direction) => {
    const newTracks = [...formData.tracks];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newTracks.length) return;
    [newTracks[index], newTracks[newIndex]] = [newTracks[newIndex], newTracks[index]];
    setFormData(prev => ({ ...prev, tracks: newTracks }));
  };

  const calculateTotalDuration = () => {
    let totalSeconds = 0;
    formData.tracks.forEach(track => {
      if (track.duration) {
        // Handle both formats: number (seconds from Spotify) and string (mm:ss from manual input)
        if (typeof track.duration === 'number') {
          totalSeconds += track.duration;
        } else if (typeof track.duration === 'string' && track.duration.includes(':')) {
          const [mins, secs] = track.duration.split(':').map(Number);
          if (!isNaN(mins) && !isNaN(secs)) {
            totalSeconds += mins * 60 + secs;
          }
        }
      }
    });
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    // If it's a number (seconds from Spotify), convert to mm:ss
    if (typeof duration === 'number') {
      const mins = Math.floor(duration / 60);
      const secs = Math.floor(duration % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    // If it's already a string, return as is
    return duration;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto"
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

          {/* Track List Editor */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Track List
              </label>
              <button
                type="button"
                onClick={addTrack}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                ➕ Add Track
              </button>
            </div>

            {formData.tracks.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-4 text-center">
                No tracks yet. Click "Add Track" to start.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {formData.tracks.map((track, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-500 w-6">{index + 1}.</span>
                    
                    <input
                      type="text"
                      value={track.name}
                      onChange={(e) => handleTrackChange(index, 'name', e.target.value)}
                      placeholder="Track name"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    
                    <input
                      type="text"
                      value={formatDuration(track.duration)}
                      onChange={(e) => handleTrackChange(index, 'duration', e.target.value)}
                      placeholder="mm:ss"
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-center"
                    />
                    
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveTrack(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ⬆️
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTrack(index, 1)}
                        disabled={index === formData.tracks.length - 1}
                        className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ⬇️
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTrack(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Remove track"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.tracks.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                <strong>Total Duration:</strong> {calculateTotalDuration()}
                <span className="text-gray-600 ml-2">
                  ({formData.tracks.length} tracks)
                </span>
              </div>
            )}
          </div>
          
          {album.spotifyId && (
            <div className="text-xs text-gray-500 border-t pt-3">
              Spotify ID: {album.spotifyId}
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
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

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-lg">
            <div className="bg-white rounded-lg p-6 max-w-md shadow-2xl border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Unsaved Changes
              </h3>
              <p className="text-gray-600 mb-6">
                You have unsaved changes. Do you want to save or discard them?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDiscardAndClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                >
                  Discard
                </button>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAndClose}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AlbumEditModal;
