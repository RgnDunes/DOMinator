import React, { useState } from "react";

interface ToolbarProps {
  onToggleDarkMode: () => void;
  darkMode: boolean;
  onSaveSnapshot: () => void;
  onExport: (format: "json" | "text") => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  searchResults: number;
  onTabChange: (tab: "tree" | "performance" | "accessibility") => void;
  activeTab: "tree" | "performance" | "accessibility";
}

const Toolbar: React.FC<ToolbarProps> = ({
  onToggleDarkMode,
  darkMode,
  onSaveSnapshot,
  onExport,
  onSearch,
  searchTerm,
  searchResults,
  onTabChange,
  activeTab,
}) => {
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section toolbar-section-left">
        <div className="toolbar-tabs">
          <div
            className={`toolbar-tab ${activeTab === "tree" ? "active" : ""}`}
            onClick={() => onTabChange("tree")}
          >
            Tree View
          </div>
          <div
            className={`toolbar-tab ${
              activeTab === "performance" ? "active" : ""
            }`}
            onClick={() => onTabChange("performance")}
          >
            Performance
          </div>
          <div
            className={`toolbar-tab ${
              activeTab === "accessibility" ? "active" : ""
            }`}
            onClick={() => onTabChange("accessibility")}
          >
            Accessibility
          </div>
        </div>
      </div>

      <div className="toolbar-section toolbar-section-center">
        <div className="search-container">
          <input
            type="text"
            className="search-box"
            placeholder="Search for elements, attributes, or text..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <div className="search-results-count">
              {searchResults} {searchResults === 1 ? "result" : "results"}
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-section toolbar-section-right">
        <button
          className="button button-secondary toolbar-button"
          onClick={onSaveSnapshot}
          title="Save current DOM snapshot"
        >
          📸 Snapshot
        </button>

        <div className="toolbar-dropdown">
          <button
            className="button button-secondary toolbar-button"
            onClick={() => setShowExportOptions(!showExportOptions)}
            title="Export DOM tree"
          >
            📤 Export
          </button>

          {showExportOptions && (
            <div className="toolbar-dropdown-menu">
              <div
                className="toolbar-dropdown-item"
                onClick={() => {
                  onExport("json");
                  setShowExportOptions(false);
                }}
              >
                Export as JSON
              </div>
              <div
                className="toolbar-dropdown-item"
                onClick={() => {
                  onExport("text");
                  setShowExportOptions(false);
                }}
              >
                Export as Text
              </div>
            </div>
          )}
        </div>

        <button
          className="button button-secondary toolbar-button"
          onClick={onToggleDarkMode}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
