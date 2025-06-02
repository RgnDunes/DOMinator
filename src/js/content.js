// Simple content script

// Notify that content script has loaded
console.log("DOMinator: Content script loaded on", window.location.href);

// Create a basic function to get DOM tree
function getDOMTree() {
  console.log("DOMinator: Generating DOM tree");
  // Simple function to parse the DOM into a JSON structure
  function parseNode(node, depth = 0) {
    const result = {
      nodeType: node.nodeType,
      nodeName: node.nodeName,
      nodeValue: node.nodeValue,
      children: [],
      depth: depth,
    };

    // Add attributes for element nodes
    if (node.nodeType === 1) {
      // Element node
      result.tagName = node.tagName.toLowerCase();
      result.attributes = [];

      // Get attributes
      if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          result.attributes.push({
            name: attr.name,
            value: attr.value,
          });
        }
      }
    }

    // Process children
    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) {
        result.children.push(parseNode(node.childNodes[i], depth + 1));
      }
    }

    return result;
  }

  // Start from the document element (html)
  return parseNode(document.documentElement);
}

// Handle messages from popup or background
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("DOMinator: Content script received message:", message);

  // Handle PING message for availability check
  if (message && message.type === "PING") {
    console.log("DOMinator: Responding to PING");
    sendResponse({ type: "PONG" });
    return true;
  }

  // Send DOM tree if requested
  if (message && message.type === "REQUEST_DOM_TREE") {
    try {
      console.log("DOMinator: Processing DOM tree request");
      const domTree = getDOMTree();
      const stats = {
        totalNodes: document.querySelectorAll("*").length,
        maxDepth: getMaxDepth(document.documentElement),
      };

      console.log(
        "DOMinator: DOM tree generated with",
        stats.totalNodes,
        "nodes"
      );

      const response = {
        type: "DOM_TREE_RESPONSE",
        payload: {
          root: domTree,
          stats: stats,
        },
      };

      console.log("DOMinator: Sending response");
      sendResponse(response);
      console.log("DOMinator: Response sent");
    } catch (error) {
      console.error("DOMinator: Error generating DOM tree", error);
      sendResponse({
        type: "ERROR",
        payload: {
          message: error.message,
        },
      });
    }
  }

  // Return true to indicate we'll respond asynchronously
  return true;
});

// Helper function to get max depth
function getMaxDepth(node, depth = 0) {
  if (!node) return depth;

  let maxChildDepth = depth;

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const childDepth = getMaxDepth(node.children[i], depth + 1);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }
  }

  return maxChildDepth;
}

// Add a small element to the page to indicate the extension is active
function addIndicator() {
  const indicator = document.createElement("div");
  indicator.style.position = "fixed";
  indicator.style.bottom = "5px";
  indicator.style.right = "5px";
  indicator.style.width = "10px";
  indicator.style.height = "10px";
  indicator.style.backgroundColor = "#4285f4";
  indicator.style.borderRadius = "50%";
  indicator.style.zIndex = "9999";
  indicator.style.opacity = "0.7";
  indicator.title = "DOMinator is active on this page";
  document.body.appendChild(indicator);
}

// Initialize when the page is ready
if (document.readyState === "complete") {
  addIndicator();
} else {
  window.addEventListener("load", addIndicator);
}
