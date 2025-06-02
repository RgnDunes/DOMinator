import { MessageType } from "./types";

// Handle extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // First time installation
    console.log("DOMinator extension installed");
    initializeStorage();
  } else if (details.reason === "update") {
    // Extension updated
    console.log("DOMinator extension updated");
  }
});

// Initialize storage with default settings
function initializeStorage() {
  chrome.storage.sync.set({
    settings: {
      darkMode:
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches,
      autoExpandDepth: 2,
      showAttributes: true,
      showNodeValues: true,
      liveUpdateMode: false,
      highlightOnHover: true,
      maxNodesBeforeVirtualization: 1000,
      defaultExportFormat: "json",
      autosaveSnapshots: false,
      snapshotIntervalSeconds: 60,
    },
    bookmarks: [],
    snapshots: [],
  });
}

// Set up connection between devtools panel and content script
chrome.runtime.onConnect.addListener((port) => {
  // Listen for messages from the devtools panel
  port.onMessage.addListener((message) => {
    if (!message.type) return;

    // Forward message to content script in active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          // Forward response back to devtools panel
          if (response) {
            port.postMessage(response);
          }
        });
      }
    });
  });

  // Clean up when devtools panel is closed
  port.onDisconnect.addListener(() => {
    console.log("DevTools panel disconnected");
  });
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // If message is from content script, forward it to devtools panel
  if (sender.tab && message.type === MessageType.DOMTreeResponse) {
    chrome.runtime.sendMessage(message);
  }

  // Handle export request
  if (message.type === MessageType.ExportDOM) {
    handleExport(message.payload);
    sendResponse({ type: MessageType.ExportComplete });
  }

  return true; // Keep channel open for async responses
});

// Export DOM tree
function handleExport(payload: { format: string; data: any }) {
  const { format, data } = payload;

  if (format === "json") {
    // Create a download for JSON data
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
      url: url,
      filename: `dominator-export-${Date.now()}.json`,
      saveAs: true,
    });
  } else if (format === "text") {
    // Create a download for text data
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
      url: url,
      filename: `dominator-export-${Date.now()}.txt`,
      saveAs: true,
    });
  }
}
