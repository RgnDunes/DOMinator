const contentScriptTabs = new Set<number>();

chrome.runtime.onInstalled.addListener(() => {});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.startsWith("http")
  ) {
    chrome.scripting
      .executeScript({
        target: { tabId },
        files: ["src/content.js"],
      })
      .then(() => {
        contentScriptTabs.add(tabId);
      })
      .catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "contentScriptReady" && sender.tab?.id) {
    contentScriptTabs.add(sender.tab.id);
    sendResponse({ success: true });
    return true;
  }

  if (message.action === "checkContentScript" && message.tabId) {
    const isLoaded = contentScriptTabs.has(message.tabId);

    if (isLoaded) {
      sendResponse({ isLoaded });
    } else {
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

    return true;
  }

  return false;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  contentScriptTabs.delete(tabId);
});
