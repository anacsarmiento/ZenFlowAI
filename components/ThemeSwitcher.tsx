import React from 'react';
import { Theme } from '../types';
import { CloseIcon, PaletteIcon } from './Icons';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
}

const presetThemes: Omit<Theme, 'primaryColor' | 'accentColor'>[] = [
  { name: 'emerald' },
  { name: 'ocean' },
  { name: 'sunset' },
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange, onClose }) => {
  
  const handleCustomPrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onThemeChange({
      name: 'custom',
      primaryColor: e.target.value,
      accentColor: currentTheme.accentColor || '#10b981',
    });
  };

  const handleCustomAccentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onThemeChange({
      name: 'custom',
      primaryColor: currentTheme.primaryColor || '#065f46',
      accentColor: e.target.value,
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-switcher-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
            <CloseIcon />
          </button>
          
          <h2 id="theme-switcher-title" className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <PaletteIcon />
            <span className="ml-2">Customize Theme</span>
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Preset Themes</h3>
              <div className="grid grid-cols-3 gap-3">
                {presetThemes.map(theme => (
                  <button 
                    key={theme.name} 
                    onClick={() => onThemeChange(theme)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-colors ${currentTheme.name === theme.name ? 'border-[var(--accent-500)] bg-[var(--primary-100)]' : 'border-transparent hover:bg-gray-100'}`}
                    aria-label={`Select ${theme.name} theme`}
                  >
                    <div className={`w-8 h-8 rounded-full theme-${theme.name} bg-[var(--accent-500)] mb-1 shadow-inner`}></div>
                    <span className="capitalize text-xs font-medium text-gray-700">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
               <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Custom Colors</h3>
               <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="primary-color" className="block text-sm font-medium text-gray-600">Primary</label>
                  <input
                    type="color"
                    id="primary-color"
                    value={currentTheme.primaryColor || '#065f46'}
                    onChange={handleCustomPrimaryChange}
                    className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-md cursor-pointer"
                    aria-label="Select custom primary color"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="accent-color" className="block text-sm font-medium text-gray-600">Accent</label>
                  <input
                    type="color"
                    id="accent-color"
                    value={currentTheme.accentColor || '#10b981'}
                    onChange={handleCustomAccentChange}
                    className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-md cursor-pointer"
                    aria-label="Select custom accent color"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
