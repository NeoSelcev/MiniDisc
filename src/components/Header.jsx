import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompactDisc, faCheck, faCog } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../store/useAppStore';
import ThemeToggle from './ThemeToggle';

function Header({ onOpenSettings }) {
  const { projectMetadata, updateProjectMetadata, importProject, exportProject, resetProject } = useAppStore();
  const fileInputRef = useRef(null);
  
  const handleExport = () => {
    const project = exportProject();
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
  
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target.result);
        importProject(projectData);
        alert('Project loaded successfully!');
      } catch (error) {
        alert('Failed to load project: ' + error.message);
      }
    };
    reader.readAsText(file);
  };
  
  const handleNewProject = () => {
    if (confirm('Create new project? This will clear the current project.')) {
      resetProject();
    }
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Mobile: Stacked layout */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 md:h-16">
          {/* Top row: Logo + Navigation */}
          <div className="flex items-center justify-between mb-2 md:mb-0">
            {/* Logo/Title - Clickable to go home */}
            <a 
              href="#main"
              className="text-base md:text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition cursor-pointer flex items-center space-x-1 md:space-x-2"
              title="Go to Home"
            >
              <img src="/minidisc.svg" alt="MiniDisc" className="w-5 h-5 md:w-6 md:h-6" />
              <span className="whitespace-nowrap">MiniDisc Sticker Printer</span>
            </a>
            
            {/* Auto-save indicator (Word style) - Desktop only */}
            <div className="hidden lg:flex items-center ml-4 px-3 py-1 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md text-xs text-green-700 dark:text-green-300">
              <FontAwesomeIcon icon={faCheck} className="mr-1 w-3 h-3" />
              <span className="whitespace-nowrap">Auto-saved • Last modified: {new Date(projectMetadata.modified).toLocaleString()}</span>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex items-center space-x-1 md:hidden">
              <button
                onClick={onOpenSettings}
                className="px-2 py-1 text-xs rounded transition text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Settings (Ctrl+,)"
              >
                <FontAwesomeIcon icon={faCog} className="mr-1 w-3 h-3" /> Settings
              </button>
            </div>
          </div>
          
          {/* Bottom row: Project name + Actions */}
          <div className="flex items-center justify-between space-x-2">
            {/* Mobile auto-save indicator */}
            <div className="md:hidden flex-1 text-xs text-green-700 dark:text-green-300 text-center bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded border border-green-200 dark:border-green-700">
              <FontAwesomeIcon icon={faCheck} className="mr-1 w-3 h-3" /> Auto-saved • {new Date(projectMetadata.modified).toLocaleTimeString()}
            </div>
            
            <input
              type="text"
              value={projectMetadata.name}
              onChange={(e) => updateProjectMetadata({ name: e.target.value })}
              className="hidden md:block flex-1 md:flex-none md:w-40 lg:w-48 px-2 py-1 text-xs md:text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-0 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Project name"
            />
            
            {/* Actions */}
            <div className="flex items-center space-x-1 md:space-x-2">
              <button
                onClick={handleNewProject}
                className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition whitespace-nowrap"
                title="New Project"
              >
                New
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition whitespace-nowrap"
                title="Load Project (Ctrl+O)"
              >
                Load
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              
              <button
                onClick={handleExport}
                className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition whitespace-nowrap"
                title="Save Project (Ctrl+S)"
              >
                Save
              </button>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                
                <ThemeToggle />
                
                <button
                  onClick={onOpenSettings}
                  className="px-3 py-1.5 text-sm rounded transition whitespace-nowrap text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Settings (Ctrl+,)"
                >
                  <FontAwesomeIcon icon={faCog} className="mr-1 w-4 h-4" /> Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
