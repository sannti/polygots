import React, { useState } from 'react';
import type { Settings } from '../types';
import LanguageSelector from './LanguageSelector';

interface SettingsViewProps {
  currentSettings: Settings;
  onSave: (newSettings: Settings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentSettings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(currentSettings);
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleTargetLanguageChange = (value: string | string[]) => {
      setLocalSettings(prev => ({ ...prev, targetLanguage: value as string }));
      setHasChanges(true);
  };
  
  const handleSourceLanguagesChange = (value: string | string[]) => {
      setLocalSettings(prev => ({ ...prev, sourceLanguages: value as string[] }));
      setHasChanges(true);
  };

  const handleSave = () => {
    onSave(localSettings);
    setHasChanges(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-center text-white">Settings</h2>
      <div className="space-y-6">
        <LanguageSelector
          id="targetLanguage"
          label="I want to learn..."
          value={localSettings.targetLanguage}
          onChange={handleTargetLanguageChange}
        />
        <LanguageSelector
          id="sourceLanguages"
          label="I already know..."
          value={localSettings.sourceLanguages}
          onChange={handleSourceLanguagesChange}
          multiple
        />
        <button
          onClick={handleSave}
          disabled={!hasChanges || localSettings.targetLanguage === '' || localSettings.sourceLanguages.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsView;