// Simple background script

// Handle extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // First time installation
    console.log("DOMinator extension installed");

    // Initialize storage with default settings
    chrome.storage.sync.set({
      settings: {
        darkMode: false, // Default to light mode
        autoExpandDepth: 2,
        showAttributes: true,
        showNodeValues: true,
        liveUpdateMode: false,
        highlightOnHover: true,
      },
    });
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Keep channel open for async responses
  return true;
});
