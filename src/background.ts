// Background script for DOMinator extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("DOMinator extension installed");
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
    console.log("Keeping service worker alive");
  }, 20000);
}

keepAlive();
