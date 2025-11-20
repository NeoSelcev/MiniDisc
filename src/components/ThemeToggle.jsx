import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';
import useThemeStore, { applyTheme } from '../store/useThemeStore';
import { useEffect } from 'react';

function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  
  useEffect(() => {
    // Apply theme on mount
    applyTheme(theme);
    
    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme('auto');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  const cycleTheme = () => {
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };
  
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return faSun;
      case 'dark':
        return faMoon;
      case 'auto':
      default:
        return faCircleHalfStroke;
    }
  };
  
  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
      default:
        return 'Auto';
    }
  };
  
  return (
    <button
      onClick={cycleTheme}
      className="flex items-center px-3 py-1.5 text-sm rounded transition text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
      title={`Theme: ${getLabel()} (click to cycle)`}
    >
      <FontAwesomeIcon icon={getIcon()} className="w-4 h-4" />
    </button>
  );
}

export default ThemeToggle;
