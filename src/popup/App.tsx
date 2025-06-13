import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiSettings,
  FiSun,
  FiMoon,
  FiDownload,
  FiEdit3,
  FiZap,
  FiRefreshCw,
} from "react-icons/fi";
import DOMTree from "./components/DOMTree";
import NodeDetails from "./components/NodeDetails";
import SearchBar from "./components/SearchBar";
import SettingsPanel from "./components/SettingsPanel";
import { useStore, DOMNode } from "./store";

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { selectedNode, domTree, loadDOMTree, isLoading } = useStore();
  const exportMenuRef = React.useRef<HTMLDivElement>(null);

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
    loadDOMTreeFromCurrentTab();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportMenu]);

  const loadDOMTreeFromCurrentTab = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // First check if the content script is loaded
        checkContentScriptAndLoad(tabs[0].id);
      } else {
        setLoadingError("Could not get current tab");
      }
    });
  };

  const checkContentScriptAndLoad = (tabId: number) => {
    // Check with background script if content script is loaded
    chrome.runtime.sendMessage(
      { action: "checkContentScript", tabId },
      (response) => {
        if (chrome.runtime.lastError) {
          setLoadingError("Could not communicate with background script");
          return;
        }

        // Now try to load the DOM tree
        loadDOMTree(tabId);
      }
    );
  };

  const handleRefresh = () => {
    setLoadingError(null);
    loadDOMTreeFromCurrentTab();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Function to toggle export menu
  const handleExportClick = () => {
    setShowExportMenu(!showExportMenu);
  };

  // Export as JSON
  const exportAsJSON = () => {
    if (!domTree) {
      return;
    }

    try {
      const jsonString = JSON.stringify(domTree, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      downloadFile(blob, "dom-tree.json");
    } catch (error) {
      alert("Failed to export as JSON");
    }
  };

  // Helper function to download a file
  const downloadFile = (blob: Blob, filename: string) => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download file");
    }
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
            onClick={toggleSettings}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Panel (conditionally rendered) */}
      {showSettings && <SettingsPanel onClose={toggleSettings} />}

      {/* Search Bar (only shown when not in settings) */}
      {!showSettings && <SearchBar />}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : loadingError ? (
          <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
            <p className="text-red-500 mb-4">{loadingError}</p>
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
            >
              <FiRefreshCw className="mr-1.5" /> Try Again
            </button>
          </div>
        ) : (
          !showSettings && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* DOM Tree */}
              <div className="flex-1 overflow-auto p-2 dom-tree-container">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    DOM Tree
                  </h2>
                  <button
                    onClick={handleRefresh}
                    className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    title="Refresh DOM tree"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                </div>
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
                <div className="relative">
                  <button
                    disabled={!domTree}
                    onClick={handleExportClick}
                    className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    <FiDownload className="mr-1.5" /> Export
                  </button>

                  {/* Export Menu */}
                  {showExportMenu && domTree && (
                    <div
                      ref={exportMenuRef}
                      className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 min-w-[160px]"
                    >
                      <button
                        onClick={exportAsJSON}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                      >
                        Export as JSON
                      </button>
                    </div>
                  )}
                </div>
                <button
                  disabled={!selectedNode}
                  className="flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  <FiZap className="mr-1.5" /> AI Suggest
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default App;
