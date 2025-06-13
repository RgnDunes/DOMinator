let highlightedElement: Element | null = null;
let overlay: HTMLElement | null = null;
let originalDOM: string | null = null;
let enhancedDOM: string | null = null;
let enhancedModeEnabled = false;

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

const generateUniqueId = (): string => {
  return "dominator-" + Math.random().toString(36).substr(2, 9);
};

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

const getCssSelector = (element: Element): string => {
  if (!element) return "";
  if (element === document.body) return "body";

  let selector = element.tagName.toLowerCase();

  if (element.id) {
    selector += `#${element.id}`;
    return selector;
  }

  if (element.className && typeof element.className === "string") {
    const classes = element.className.split(" ").filter((c) => c);
    if (classes.length > 0) {
      selector += `.${classes.join(".")}`;
    }
  } else if (element.classList && element.classList.length > 0) {
    selector += `.${Array.from(element.classList).join(".")}`;
  }

  if (element.parentElement && element.parentElement !== document.body) {
    const parentSelector = getCssSelector(element.parentElement);
    selector = `${parentSelector} > ${selector}`;
  }

  return selector;
};

const createDOMNodeRepresentation = (element: Element, depth = 0): DOMNode => {
  try {
    const nodeId = generateUniqueId();

    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

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

    element.setAttribute("data-dominator-id", nodeId);

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
  } catch (error: any) {
    throw new Error(`Failed to process DOM element: ${error.message}`);
  }
};

const getDOMTree = (): { domTree: DOMNode | null; error?: string } => {
  try {
    if (!document || !document.documentElement) {
      return { domTree: null, error: "Document not available" };
    }

    const domTree = createDOMNodeRepresentation(document.documentElement);
    return { domTree };
  } catch (error: any) {
    return {
      domTree: null,
      error: `Failed to get DOM tree: ${error.message || "Unknown error"}`,
    };
  }
};

const highlightElement = (element: Element | null) => {
  if (overlay) {
    document.body.removeChild(overlay);
    overlay = null;
  }

  if (highlightedElement) {
    highlightedElement.classList.remove("dominator-highlighted");
  }

  highlightedElement = element;

  if (!element) return;

  element.classList.add("dominator-highlighted");

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

  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

const findElementById = (id: string): Element | null => {
  return document.querySelector(`[data-dominator-id="${id}"]`);
};

const toggleEnhancedDOM = (enabled: boolean) => {
  enhancedModeEnabled = enabled;

  if (enabled) {
    if (!originalDOM) {
      originalDOM = document.documentElement.outerHTML;
    }

    if (!enhancedDOM) {
      enhanceDOMSemantics();
    } else {
      document.open();
      document.write(enhancedDOM);
      document.close();
    }
  } else if (originalDOM) {
    document.open();
    document.write(originalDOM);
    document.close();
  }
};

const enhanceDOMSemantics = () => {
  if (!enhancedDOM) {
    const potentialNavs = document.querySelectorAll(
      'div[class*="nav"], div[class*="menu"], div[id*="nav"], div[id*="menu"]'
    );
    potentialNavs.forEach((div) => {
      if (!(div as HTMLElement).hasAttribute("role")) {
        (div as HTMLElement).setAttribute("role", "navigation");
      }
    });

    const potentialHeaders = document.querySelectorAll(
      'div[class*="header"], div[id*="header"]'
    );
    potentialHeaders.forEach((div) => {
      if (!(div as HTMLElement).hasAttribute("role")) {
        (div as HTMLElement).setAttribute("role", "banner");
      }
    });

    const potentialFooters = document.querySelectorAll(
      'div[class*="footer"], div[id*="footer"]'
    );
    potentialFooters.forEach((div) => {
      if (!(div as HTMLElement).hasAttribute("role")) {
        (div as HTMLElement).setAttribute("role", "contentinfo");
      }
    });

    const images = document.querySelectorAll("img:not([alt])");
    images.forEach((img) => {
      (img as HTMLImageElement).alt = "Image";
    });

    const formControls = document.querySelectorAll(
      "input:not([aria-label]):not([aria-labelledby]):not([title])"
    );
    formControls.forEach((input) => {
      const type = (input as HTMLInputElement).type;
      (input as HTMLInputElement).setAttribute("aria-label", `${type} field`);
    });

    enhancedDOM = document.documentElement.outerHTML;
  }
};

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

const initialize = () => {
  addHighlightStyles();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getDOMTree") {
      try {
        const result = getDOMTree();
        sendResponse(result);
      } catch (error: any) {
        sendResponse({
          domTree: null,
          error: `Error processing DOM tree: ${
            error.message || "Unknown error"
          }`,
        });
      }
    } else if (message.action === "highlightNode") {
      const element = findElementById(message.nodeId);
      highlightElement(element);
      sendResponse({ success: true });
    } else if (message.action === "toggleEnhancedDOM") {
      toggleEnhancedDOM(message.enabled);
      sendResponse({ success: true });
    } else if (message.action === "ping") {
      sendResponse({ success: true, message: "Content script is active" });
    }

    return true;
  });

  try {
    chrome.runtime.sendMessage({ action: "contentScriptReady" });
  } catch (e) {}
};

initialize();
