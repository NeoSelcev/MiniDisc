import { useRef } from 'react';
import useAppStore from '../store/useAppStore';

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Mobile: Stacked layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 sm:h-16">
          {/* Top row: Logo + Navigation */}
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            {/* Logo/Title - Clickable to go home */}
            <a 
              href="#main"
              className="text-base sm:text-xl font-bold text-gray-900 hover:text-primary-600 transition cursor-pointer flex items-center space-x-1 sm:space-x-2"
              title="Go to Home"
            >
              <span>📀</span>
              <span className="whitespace-nowrap">MiniDisc Sticker Printer</span>
            </a>
            
            {/* Auto-save indicator (Word style) */}
            <div className="hidden sm:flex items-center ml-4 px-3 py-1 bg-green-50 border border-green-200 rounded-md text-xs text-green-700">
              <span className="mr-1">✓</span>
              <span className="whitespace-nowrap">Auto-saved • Last modified: {new Date(projectMetadata.modified).toLocaleString()}</span>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex items-center space-x-1 sm:hidden">
              <button
                onClick={onOpenSettings}
                className="px-2 py-1 text-xs rounded transition text-gray-700 hover:bg-gray-100"
                title="Settings (Ctrl+,)"
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
          
          {/* Bottom row: Project name + Actions */}
          <div className="flex items-center justify-between space-x-2">
            {/* Mobile auto-save indicator */}
            <div className="sm:hidden flex-1 text-xs text-green-700 text-center bg-green-50 px-2 py-1 rounded border border-green-200">
              ✓ Auto-saved • {new Date(projectMetadata.modified).toLocaleTimeString()}
            </div>
            
            <input
              type="text"
              value={projectMetadata.name}
              onChange={(e) => updateProjectMetadata({ name: e.target.value })}
              className="hidden sm:block flex-1 sm:flex-none px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-0"
              placeholder="Project name"
            />
            
            {/* Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={handleNewProject}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded transition whitespace-nowrap"
                title="New Project"
              >
                New
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded transition whitespace-nowrap"
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
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded transition whitespace-nowrap"
                title="Save Project (Ctrl+S)"
              >
                Save
              </button>
              
              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="h-6 w-px bg-gray-300" />
                
                <button
                  onClick={onOpenSettings}
                  className="px-3 py-1.5 text-sm rounded transition whitespace-nowrap text-gray-700 hover:bg-gray-100"
                  title="Settings (Ctrl+,)"
                >
                  ⚙️ Settings
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
