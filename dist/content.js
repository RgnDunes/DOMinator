// Simple content script

// Create a basic function to get DOM tree
function getDOMTree() {
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Send DOM tree if requested
  if (message && message.type === "REQUEST_DOM_TREE") {
    const domTree = getDOMTree();
    sendResponse({
      type: "DOM_TREE_RESPONSE",
      payload: {
        root: domTree,
        stats: {
          totalNodes: document.querySelectorAll("*").length,
          maxDepth: getMaxDepth(document.documentElement),
        },
      },
    });
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
