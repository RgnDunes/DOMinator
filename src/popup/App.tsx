import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiSettings,
  FiSun,
  FiMoon,
  FiDownload,
  FiEdit3,
  FiZap,
} from "react-icons/fi";
import DOMTree from "./components/DOMTree";
import NodeDetails from "./components/NodeDetails";
import SearchBar from "./components/SearchBar";
import { useStore } from "./store";

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { selectedNode, domTree, loadDOMTree, isLoading } = useStore();

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    // Load DOM tree from the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        loadDOMTree(tabs[0].id);
      }
    });
  }, [loadDOMTree]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400">
            DOMinator
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <FiSun className="w-5 h-5" />
            ) : (
              <FiMoon className="w-5 h-5" />
            )}
          </button>
          <button
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <SearchBar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* DOM Tree */}
            <div className="flex-1 overflow-auto p-2">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                DOM Tree
              </h2>
              <DOMTree tree={domTree} />
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <NodeDetails node={selectedNode} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                disabled={!selectedNode}
                className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium disabled:opacity-50"
              >
                <FiEdit3 className="mr-1.5" /> Edit
              </button>
              <button
                disabled={!domTree}
                className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium disabled:opacity-50"
              >
                <FiDownload className="mr-1.5" /> Export
              </button>
              <button
                disabled={!selectedNode}
                className="flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                <FiZap className="mr-1.5" /> AI Suggest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
