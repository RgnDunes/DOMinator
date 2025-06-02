import { MessageType, DOMNode, Message } from "./types";
import { parseDOM, calculateDOMStats } from "./utils";

// Elements for highlighting and tooltips
let highlightElement: HTMLElement | null = null;
let tooltipElement: HTMLElement | null = null;
let overlayElement: HTMLElement | null = null;

// Handle messages from popup or DevTools
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (!message.type) return;

    switch (message.type) {
      case MessageType.RequestDOMTree:
        const domTree = generateDOMTree();
        sendResponse({ type: MessageType.DOMTreeResponse, payload: domTree });
        break;

      case MessageType.HighlightNode:
        highlightNode(message.payload);
        break;

      case MessageType.ClearHighlight:
        clearHighlight();
        break;

      case MessageType.GetNodeDetails:
        const details = getNodeDetails(message.payload);
        sendResponse({
          type: MessageType.NodeDetailsResponse,
          payload: details,
        });
        break;

      case MessageType.ToggleLiveMode:
        toggleLiveMode(message.payload);
        break;
    }

    return true; // Required for async responses
  }
);

// Generate the DOM tree
function generateDOMTree() {
  const domNode = parseDOM(document.documentElement);
  const stats = calculateDOMStats(domNode);

  return {
    root: domNode,
    stats,
  };
}

// Highlight a node in the page
function highlightNode(nodeInfo: { path: string }) {
  clearHighlight();

  const { path } = nodeInfo;
  const node = findNodeByPath(path);

  if (!node) return;

  // Create highlight element
  highlightElement = document.createElement("div");
  highlightElement.className = "dominator-highlight";

  // Position the highlight
  const rect = node.getBoundingClientRect();
  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  const scrollY = window.scrollY || document.documentElement.scrollTop;

  Object.assign(highlightElement.style, {
    position: "absolute",
    top: `${rect.top + scrollY}px`,
    left: `${rect.left + scrollX}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: "none",
  });

  // Create tooltip with element info
  tooltipElement = document.createElement("div");
  tooltipElement.className = "dominator-tooltip";

  const tagName = node.tagName.toLowerCase();
  const id = node.id ? `#${node.id}` : "";
  const classList = Array.from(node.classList)
    .map((c) => `.${c}`)
    .join("");

  tooltipElement.textContent = `${tagName}${id}${classList}`;

  // Position the tooltip
  Object.assign(tooltipElement.style, {
    top: `${rect.top + scrollY - 30}px`,
    left: `${rect.left + scrollX}px`,
  });

  // Append to document
  document.body.appendChild(highlightElement);
  document.body.appendChild(tooltipElement);
}

// Clear any active highlights
function clearHighlight() {
  if (highlightElement) {
    highlightElement.remove();
    highlightElement = null;
  }

  if (tooltipElement) {
    tooltipElement.remove();
    tooltipElement = null;
  }
}

// Find a node by its path
function findNodeByPath(path: string): Element | null {
  const parts = path.split("/").filter(Boolean);
  let currentNode: Node = document;

  for (const part of parts) {
    const index = parseInt(part, 10);
    if (isNaN(index) || !currentNode.childNodes[index]) {
      return null;
    }
    currentNode = currentNode.childNodes[index];
  }

  return currentNode instanceof Element ? currentNode : null;
}

// Get detailed information about a node
function getNodeDetails(nodeInfo: { path: string }) {
  const { path } = nodeInfo;
  const node = findNodeByPath(path);

  if (!node) return null;

  // Get computed styles
  const computedStyle = window.getComputedStyle(node);
  const styles: Record<string, string> = {};

  for (let i = 0; i < computedStyle.length; i++) {
    const prop = computedStyle[i];
    styles[prop] = computedStyle.getPropertyValue(prop);
  }

  // Get box model information
  const rect = node.getBoundingClientRect();
  const boxModel = {
    width: rect.width,
    height: rect.height,
    margin: {
      top: parseInt(computedStyle.marginTop, 10),
      right: parseInt(computedStyle.marginRight, 10),
      bottom: parseInt(computedStyle.marginBottom, 10),
      left: parseInt(computedStyle.marginLeft, 10),
    },
    border: {
      top: parseInt(computedStyle.borderTopWidth, 10),
      right: parseInt(computedStyle.borderRightWidth, 10),
      bottom: parseInt(computedStyle.borderBottomWidth, 10),
      left: parseInt(computedStyle.borderLeftWidth, 10),
    },
    padding: {
      top: parseInt(computedStyle.paddingTop, 10),
      right: parseInt(computedStyle.paddingRight, 10),
      bottom: parseInt(computedStyle.paddingBottom, 10),
      left: parseInt(computedStyle.paddingLeft, 10),
    },
    content: {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
    },
  };

  return {
    computedStyle: styles,
    boxModel,
  };
}

// Toggle live update mode
let liveUpdateObserver: MutationObserver | null = null;

function toggleLiveMode(enabled: boolean) {
  if (enabled) {
    if (!liveUpdateObserver) {
      liveUpdateObserver = new MutationObserver(handleDOMMutations);
      liveUpdateObserver.observe(document.documentElement, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true,
      });
    }
  } else {
    if (liveUpdateObserver) {
      liveUpdateObserver.disconnect();
      liveUpdateObserver = null;
    }
  }
}

function handleDOMMutations(mutations: MutationRecord[]) {
  // Send message to notify of DOM updates
  chrome.runtime.sendMessage({
    type: MessageType.DOMTreeResponse,
    payload: generateDOMTree(),
  });
}

// Create overlay for full-page inspection mode
function createOverlay() {
  overlayElement = document.createElement("div");
  overlayElement.className = "dominator-overlay";
  document.body.appendChild(overlayElement);
}

// Initialize content script
function initialize() {
  createOverlay();

  // Notify that content script is ready
  chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_READY" });
}

initialize();
