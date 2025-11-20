import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus, faChevronUp, faChevronDown, faCamera, faCloudArrowUp, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../store/useAppStore';

function AlbumEditModal({ album, isOpen, onClose }) {
  const { updateAlbum, removeAlbum } = useAppStore();
  const [formData, setFormData] = useState({
    albumName: '',
    artistName: '',
    year: new Date().getFullYear(),
    tracks: [],
    coverImage: null,
  });
  const [originalData, setOriginalData] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isNewAlbum, setIsNewAlbum] = useState(false);
  
  // Sync formData with album prop when it changes
  useEffect(() => {
    if (album) {
      const data = {
        albumName: album.albumName || '',
        artistName: album.artistName || '',
        year: album.year || new Date().getFullYear(),
        tracks: album.tracks || [],
        coverImage: album.coverImage || null,
      };
      setFormData(data);
      setImagePreview(album.coverImage || null);
      setOriginalData(JSON.parse(JSON.stringify(data))); // Deep clone
      
      // Check if this is a new album (no cover image = just created manually)
      setIsNewAlbum(!album.coverImage);
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

  const isValidAlbum = () => {
    return formData.coverImage !== null;
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleClose = () => {
    // If it's a new album without required fields, show special warning
    if (isNewAlbum && !isValidAlbum()) {
      setShowConfirmDialog(true);
    } else if (hasChanges()) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleSaveAndClose = () => {
    // Validate before saving
    if (!isValidAlbum()) {
      alert('Please add a cover image before saving.');
      return;
    }
    
    updateAlbum(album.id, formData);
    setShowConfirmDialog(false);
    onClose();
  };

  const handleDiscardAndClose = () => {
    // If new album is being discarded, remove it from the list
    if (isNewAlbum && !isValidAlbum()) {
      removeAlbum(album.id);
    }
    setShowConfirmDialog(false);
    onClose();
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate image is present
    if (!formData.coverImage) {
      alert('Please add a cover image before saving.');
      return;
    }
    
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, coverImage: null }));
    setImagePreview(null);
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
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Album</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Image Upload */}
          <div className="flex justify-center">
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt={formData.albumName}
                  className="w-48 h-48 rounded-lg object-cover shadow-lg"
                />
                {/* Floating X button */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-lg flex items-center justify-center font-bold"
                  title="Remove image"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                </button>
                  {/* Change image overlay on hover */}
                  <label className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <span className="text-white font-semibold">
                      <FontAwesomeIcon icon={faCamera} className="mr-1 w-4 h-4" /> Change Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="w-48 h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition">
                  <FontAwesomeIcon icon={faCloudArrowUp} className="w-16 h-16 text-gray-400 mb-3" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Upload Image</span>
                  <span className="text-gray-400 text-sm mt-1">Click to select</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    required
                  />
                </label>
              )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Album Name
            </label>
            <input
              type="text"
              name="albumName"
              value={formData.albumName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Artist Name
            </label>
            <input
              type="text"
              name="artistName"
              value={formData.artistName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Track List Editor */}
          <div className="border-t dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Track List
              </label>
              <button
                type="button"
                onClick={addTrack}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1 w-3 h-3" /> Add Track
              </button>
            </div>

            {formData.tracks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center">
                No tracks yet. Click "Add Track" to start.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">{formData.tracks.map((track, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-6">{index + 1}.</span>
                    
                    <input
                      type="text"
                      value={track.name}
                      onChange={(e) => handleTrackChange(index, 'name', e.target.value)}
                      placeholder="Track name"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
                    />
                    
                    <input
                      type="text"
                      value={formatDuration(track.duration)}
                      onChange={(e) => handleTrackChange(index, 'duration', e.target.value)}
                      placeholder="mm:ss"
                      className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-center dark:bg-gray-800 dark:text-gray-100"
                    />
                    
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveTrack(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <FontAwesomeIcon icon={faChevronUp} className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTrack(index, 1)}
                        disabled={index === formData.tracks.length - 1}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTrack(index)}
                        className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        title="Remove track"
                      >
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.tracks.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-sm text-gray-900 dark:text-gray-100">
                <strong>Total Duration:</strong> {calculateTotalDuration()}
                <span className="text-gray-600 dark:text-gray-400 ml-2">
                  ({formData.tracks.length} tracks)
                </span>
              </div>
            )}
          </div>
          
          {album.spotifyId && (
            <div className="text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-3">
              Spotify ID: {album.spotifyId}
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
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
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 flex items-center justify-center rounded-lg">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md shadow-2xl border-2 border-gray-200 dark:border-gray-700">
              {isNewAlbum && !isValidAlbum() ? (
                <>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1 w-4 h-4" /> Incomplete Album
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This album is missing required information (cover image). If you exit now, the album will not be saved.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDiscardAndClose}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                      Discard Album
                    </button>
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                    >
                      Continue Editing
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Unsaved Changes
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You have unsaved changes. Do you want to save or discard them?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDiscardAndClose}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
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
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AlbumEditModal;
