// Background script for DOMinator extension

// Track which tabs have the content script loaded
const contentScriptTabs = new Set<number>();

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("DOMinator extension installed");
});

// Listen for tab updates to track which tabs have our content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    !tab.url.startsWith("chrome://")
  ) {
    console.log(
      `DOMinator: Tab ${tabId} updated, checking content script status`
    );
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("DOMinator: Background received message", message, sender);

  if (message.action === "contentScriptReady" && sender.tab?.id) {
    // Content script has loaded in a tab
    console.log(`DOMinator: Content script ready in tab ${sender.tab.id}`);
    contentScriptTabs.add(sender.tab.id);
    sendResponse({ success: true });
    return true;
  }

  if (message.action === "checkContentScript" && message.tabId) {
    // Check if content script is loaded in the specified tab
    const isLoaded = contentScriptTabs.has(message.tabId);
    console.log(
      `DOMinator: Content script loaded in tab ${message.tabId}? ${isLoaded}`
    );

    if (isLoaded) {
      sendResponse({ isLoaded });
    } else {
      // Try to inject the content script if not loaded
      try {
        console.log("DOMinator: Attempting to inject content script");
        chrome.scripting
          .executeScript({
            target: { tabId: message.tabId },
            files: ["src/content.js"],
          })
          .then(() => {
            console.log(
              `DOMinator: Injected content script into tab ${message.tabId}`
            );
            contentScriptTabs.add(message.tabId);
            sendResponse({ isLoaded: true, injected: true });
          })
          .catch((error) => {
            console.error(`DOMinator: Failed to inject content script:`, error);
            sendResponse({ isLoaded: false, error: error.message });
          });
      } catch (error) {
        console.error(`DOMinator: Error injecting content script:`, error);
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
});

// Keep service worker alive
function keepAlive() {
  setInterval(() => {
    console.log("DOMinator: Keeping service worker alive");
  }, 20000);
}

// When a tab is closed, remove it from our tracking
chrome.tabs.onRemoved.addListener((tabId) => {
  contentScriptTabs.delete(tabId);
  console.log(`DOMinator: Tab ${tabId} closed, removed from tracking`);
});

keepAlive();
