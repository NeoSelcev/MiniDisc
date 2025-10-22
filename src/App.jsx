import { useEffect, useState } from 'react';
import useAppStore from './store/useAppStore';
import Header from './components/Header';
import AlbumList from './components/AlbumList';
import LayoutPreview from './components/LayoutPreview';
import SettingsModal from './components/SettingsModal';
import SpotifyCallback from './components/SpotifyCallback';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  
  // Check if we're on the callback path (not hash-based)
  const isCallbackRoute = window.location.pathname === '/callback' || window.location.search.includes('code=');
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useAppStore.getState().undo();
      }
      
      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        useAppStore.getState().redo();
      }
      
      // Ctrl+S - Save project
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveProject();
      }
      
      // Ctrl+, - Open settings
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handleSaveProject = () => {
    const project = useAppStore.getState().exportProject();
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.metadata.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (isCallbackRoute) {
    return <SpotifyCallback />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => setShowSettings(true)} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Album list */}
          <div className="lg:col-span-1">
            <AlbumList />
          </div>
          
          {/* Main area - Layout preview */}
          <div className="lg:col-span-2">
            <LayoutPreview />
          </div>
        </div>
      </main>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}

export default App;

