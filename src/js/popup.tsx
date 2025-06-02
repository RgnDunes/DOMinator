import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { AppSettings, MessageType } from "./types";
import "../css/popup.css";

const Popup: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load settings from storage
    chrome.storage.sync.get("settings", (data) => {
      if (data.settings) {
        setSettings(data.settings);
      }
      setLoading(false);
    });
  }, []);

  const toggleDarkMode = () => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      darkMode: !settings.darkMode,
    };

    // Save updated settings
    chrome.storage.sync.set({ settings: updatedSettings }, () => {
      setSettings(updatedSettings);
    });
  };

  const openInspector = () => {
    // Send message to content script to initiate inspection
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: MessageType.RequestDOMTree,
        });

        // Open DevTools panel
        chrome.devtools?.panels?.openInspect();
      }
    });
  };

  const toggleLiveMode = () => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      liveUpdateMode: !settings.liveUpdateMode,
    };

    // Save updated settings
    chrome.storage.sync.set({ settings: updatedSettings }, () => {
      setSettings(updatedSettings);

      // Send toggle message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: MessageType.ToggleLiveMode,
            payload: updatedSettings.liveUpdateMode,
          });
        }
      });
    });
  };

  if (loading) {
    return <div className="popup-container">Loading...</div>;
  }

  return (
    <div className={`popup-container ${settings?.darkMode ? "dark-mode" : ""}`}>
      <div className="header">
        <h1 className="title">
          <img src="/public/images/icon48.png" alt="DOMinator" />
          DOMinator
        </h1>
        <div className="theme-toggle">
          <span className="theme-toggle-label">Dark Mode</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings?.darkMode || false}
              onChange={toggleDarkMode}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="action-section">
        <div className="action-button" onClick={openInspector}>
          <div className="action-icon">🔍</div>
          <div className="action-text">
            <h3 className="action-title">Inspect DOM Tree</h3>
            <p className="action-description">
              Generate and explore the DOM tree of the current page
            </p>
          </div>
        </div>

        <div className="action-button" onClick={toggleLiveMode}>
          <div className="action-icon">⚡</div>
          <div className="action-text">
            <h3 className="action-title">Live Update Mode</h3>
            <p className="action-description">
              {settings?.liveUpdateMode
                ? "Currently ON - Click to disable real-time updates"
                : "Currently OFF - Click to enable real-time updates"}
            </p>
          </div>
        </div>

        <div className="action-button">
          <div className="action-icon">📊</div>
          <div className="action-text">
            <h3 className="action-title">View Performance</h3>
            <p className="action-description">
              Analyze DOM performance metrics and find bottlenecks
            </p>
          </div>
        </div>

        <div className="action-button">
          <div className="action-icon">♿</div>
          <div className="action-text">
            <h3 className="action-title">Accessibility Check</h3>
            <p className="action-description">
              Identify accessibility issues in the current page
            </p>
          </div>
        </div>
      </div>

      <div className="footer">
        DOMinator v1.0.0 - DOM Tree Visualization & Analysis
      </div>
    </div>
  );
};

// Render the popup
ReactDOM.render(<Popup />, document.getElementById("root"));
