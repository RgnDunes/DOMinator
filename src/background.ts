// Background script for DOMinator extension

// Track which tabs have the content script loaded
const contentScriptTabs = new Set<number>();

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Extension installed
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If the tab is fully loaded and has a supported URL, inject the content script
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.startsWith("http")
  ) {
    // Try to inject the content script
    chrome.scripting
      .executeScript({
        target: { tabId },
        files: ["src/content.js"],
      })
      .then(() => {
        contentScriptTabs.add(tabId);
      })
      .catch(() => {
        // Ignore errors - some pages don't allow content scripts
      });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "contentScriptReady" && sender.tab?.id) {
    // Content script has loaded in a tab
    contentScriptTabs.add(sender.tab.id);
    sendResponse({ success: true });
    return true;
  }

  if (message.action === "checkContentScript" && message.tabId) {
    // Check if content script is loaded in the specified tab
    const isLoaded = contentScriptTabs.has(message.tabId);

    if (isLoaded) {
      sendResponse({ isLoaded });
    } else {
      // Try to inject the content script if not loaded
      try {
        chrome.scripting
          .executeScript({
            target: { tabId: message.tabId },
            files: ["src/content.js"],
          })
          .then(() => {
            contentScriptTabs.add(message.tabId);
            sendResponse({ isLoaded: true, injected: true });
          })
          .catch((error) => {
            sendResponse({ isLoaded: false, error: error.message });
          });
      } catch (error) {
        sendResponse({ isLoaded: false, error: String(error) });
      }
      return true;
    }
  }

  if (message.action === "getAIExplanation") {
    // This is where you would make an API call to OpenAI or similar
    // For now, we'll just simulate a response
    setTimeout(() => {
      sendResponse({
        explanation: `This appears to be a ${
          message.tagName
        } element used for ${
          message.tagName === "DIV"
            ? "grouping content"
            : message.tagName === "BUTTON"
            ? "user interaction"
            : message.tagName === "NAV"
            ? "navigation"
            : "containing content"
        }. ${
          message.tagName === "DIV" && !message.attributes.role
            ? "Consider using a more semantic element or adding a role attribute for better accessibility."
            : ""
        }`,
      });
    }, 500);

    // Return true to indicate we'll respond asynchronously
    return true;
  }

  return false;
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  contentScriptTabs.delete(tabId);
});
