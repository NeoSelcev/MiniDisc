import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'auto', // 'light', 'dark', or 'auto'
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Apply theme to document
export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  if (theme === 'auto') {
    // Use system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } else if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export default useThemeStore;
