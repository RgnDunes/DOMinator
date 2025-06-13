// Content script for DOMinator extension

// Store references to highlighted elements and overlay
let highlightedElement: Element | null = null;
let overlay: HTMLElement | null = null;
let originalDOM: string | null = null;
let enhancedDOM: string | null = null;
let enhancedModeEnabled = false;

// Define the DOMNode interface for type safety
interface DOMNode {
  id: string;
  tagName: string;
  attributes: Record<string, string>;
  textContent?: string;
  children: DOMNode[];
  parentId?: string;
  xpath?: string;
  cssSelector?: string;
  depth: number;
  collapsed?: boolean;
}

// Generate a unique ID for DOM nodes
const generateUniqueId = (): string => {
  return "dominator-" + Math.random().toString(36).substr(2, 9);
};

// Get XPath for an element
const getXPath = (element: Element): string => {
  if (!element) return "";
  if (element === document.body) return "/html/body";

  let ix = 0;
  const siblings = element.parentElement?.children || [];

  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i];
    if (sibling === element) {
      const path = getXPath(element.parentElement as Element);
      const tagName = element.tagName.toLowerCase();
      return `${path}/${tagName}[${ix + 1}]`;
    }

    if (sibling.tagName === element.tagName) {
      ix++;
    }
  }

  return "";
};

// Get a CSS selector for an element
const getCssSelector = (element: Element): string => {
  if (!element) return "";
  if (element === document.body) return "body";

  let selector = element.tagName.toLowerCase();

  if (element.id) {
    selector += `#${element.id}`;
    return selector;
  }

  if (element.className) {
    const classes = element.className.split(" ").filter((c) => c);
    if (classes.length > 0) {
      selector += `.${classes.join(".")}`;
    }
  }

  // Add parent context if needed
  if (element.parentElement && element.parentElement !== document.body) {
    const parentSelector = getCssSelector(element.parentElement);
    selector = `${parentSelector} > ${selector}`;
  }

  return selector;
};

// Create a simplified representation of a DOM node
const createDOMNodeRepresentation = (element: Element, depth = 0): DOMNode => {
  const nodeId = generateUniqueId();

  // Get attributes
  const attributes: Record<string, string> = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attributes[attr.name] = attr.value;
  }

  // Create node representation
  const node: DOMNode = {
    id: nodeId,
    tagName: element.tagName,
    attributes,
    textContent: element.textContent?.trim() || "",
    children: [],
    xpath: getXPath(element),
    cssSelector: getCssSelector(element),
    depth,
  };

  // Add data attribute to the actual DOM element for later reference
  element.setAttribute("data-dominator-id", nodeId);

  // Process children (limit depth to avoid excessive recursion)
  if (depth < 50) {
    for (let i = 0; i < element.children.length; i++) {
      const childNode = createDOMNodeRepresentation(
        element.children[i],
        depth + 1
      );
      childNode.parentId = nodeId;
      node.children.push(childNode);
    }
  }

  return node;
};

// Get the DOM tree starting from document.body
const getDOMTree = (): DOMNode => {
  return createDOMNodeRepresentation(document.documentElement);
};

// Highlight an element on the page
const highlightElement = (element: Element | null) => {
  // Remove previous highlight
  if (overlay) {
    document.body.removeChild(overlay);
    overlay = null;
  }

  if (highlightedElement) {
    highlightedElement.classList.remove("dominator-highlighted");
  }

  highlightedElement = element;

  if (!element) return;

  // Add highlight class
  element.classList.add("dominator-highlighted");

  // Create overlay
  const rect = element.getBoundingClientRect();
  overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.border = "2px solid #0ea5e9";
  overlay.style.borderRadius = "3px";
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "2147483647";
  overlay.style.boxShadow = "0 0 0 2000px rgba(14, 165, 233, 0.1)";

  document.body.appendChild(overlay);

  // Scroll into view if needed
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

// Find element by dominator ID
const findElementById = (id: string): Element | null => {
  return document.querySelector(`[data-dominator-id="${id}"]`);
};

// Toggle enhanced DOM mode
const toggleEnhancedDOM = (enabled: boolean) => {
  enhancedModeEnabled = enabled;

  if (enabled) {
    if (!originalDOM) {
      originalDOM = document.documentElement.outerHTML;
    }

    if (!enhancedDOM) {
      // Generate enhanced DOM (this would ideally use AI suggestions)
      // For now, we'll just make some simple semantic improvements
      enhanceDOMSemantics();
    } else {
      // Restore previously generated enhanced DOM
      document.open();
      document.write(enhancedDOM);
      document.close();
    }
  } else if (originalDOM) {
    // Restore original DOM
    document.open();
    document.write(originalDOM);
    document.close();
  }
};

// Enhance DOM semantics (simplified version)
const enhanceDOMSemantics = () => {
  // Store current DOM before making changes
  if (!enhancedDOM) {
    // Simple semantic improvements
    // Replace divs with semantic elements where appropriate

    // Find navigation divs
    const potentialNavs = document.querySelectorAll(
      'div[class*="nav"], div[class*="menu"], div[id*="nav"], div[id*="menu"]'
    );
    potentialNavs.forEach((div) => {
      if (!(div as HTMLElement).hasAttribute("role")) {
        (div as HTMLElement).setAttribute("role", "navigation");
      }
    });

    // Find header divs
    const potentialHeaders = document.querySelectorAll(
      'div[class*="header"], div[id*="header"]'
    );
    potentialHeaders.forEach((div) => {
      if (!(div as HTMLElement).hasAttribute("role")) {
        (div as HTMLElement).setAttribute("role", "banner");
      }
    });

    // Find footer divs
    const potentialFooters = document.querySelectorAll(
      'div[class*="footer"], div[id*="footer"]'
    );
    potentialFooters.forEach((div) => {
      if (!(div as HTMLElement).hasAttribute("role")) {
        (div as HTMLElement).setAttribute("role", "contentinfo");
      }
    });

    // Add missing alt attributes to images
    const images = document.querySelectorAll("img:not([alt])");
    images.forEach((img) => {
      (img as HTMLImageElement).alt = "Image";
    });

    // Add missing labels to form controls
    const formControls = document.querySelectorAll(
      "input:not([aria-label]):not([aria-labelledby]):not([title])"
    );
    formControls.forEach((input) => {
      const type = (input as HTMLInputElement).type;
      (input as HTMLInputElement).setAttribute("aria-label", `${type} field`);
    });

    // Store the enhanced DOM
    enhancedDOM = document.documentElement.outerHTML;
  }
};

// Add CSS for highlighted elements
const addHighlightStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    .dominator-highlighted {
      outline: 2px solid #0ea5e9 !important;
      outline-offset: -2px !important;
    }
  `;
  document.head.appendChild(style);
};

// Initialize
const initialize = () => {
  addHighlightStyles();

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getDOMTree") {
      sendResponse({ domTree: getDOMTree() });
    } else if (message.action === "highlightNode") {
      const element = findElementById(message.nodeId);
      highlightElement(element);
      sendResponse({ success: true });
    } else if (message.action === "toggleEnhancedDOM") {
      toggleEnhancedDOM(message.enabled);
      sendResponse({ success: true });
    }

    // Return true to indicate we'll respond asynchronously
    return true;
  });
};

// Start the extension
initialize();
