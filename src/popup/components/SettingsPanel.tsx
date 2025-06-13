import React, { useState } from "react";
import { FiX, FiSave, FiKey } from "react-icons/fi";

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  // Load saved API key when component mounts
  React.useEffect(() => {
    chrome.storage.sync.get(["openaiApiKey"], (result) => {
      if (result.openaiApiKey) {
        setApiKey(result.openaiApiKey);
      }
    });
  }, []);

  const handleSave = () => {
    // Save API key to Chrome storage
    chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Settings</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close settings"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            OpenAI API Key (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiKey className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Required for AI-powered features. Your key is stored locally.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            About DOMinator
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Version 1.0.0 - A Chrome extension for DOM visualization, analysis,
            and AI-powered suggestions.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            className="flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
          >
            <FiSave className="mr-1.5" /> Save Settings
          </button>
          {saved && (
            <p className="mt-2 text-xs text-green-500">
              Settings saved successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
