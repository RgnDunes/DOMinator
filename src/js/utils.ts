import {
  DOMNode,
  DOMNodeAttribute,
  DOMTreeStats,
  DOMTreeFilter,
  AccessibilityIssue,
  AccessibilityIssueType,
  PerformanceInfo,
} from "./types";

export function generateUniqueId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function parseDOM(
  element: Node,
  depth: number = 0,
  index: number = 0,
  parentId: string | null = null
): DOMNode {
  const id = generateUniqueId();
  const path = parentId ? `${parentId}/${index}` : `/${index}`;

  const node: DOMNode = {
    id,
    nodeType: element.nodeType,
    nodeName: element.nodeName,
    nodeValue: element.nodeValue,
    children: [],
    depth,
    path,
    index,
    parent: parentId,
  };

  // Handle element nodes
  if (element.nodeType === Node.ELEMENT_NODE) {
    const el = element as Element;
    node.tagName = el.tagName.toLowerCase();

    // Get attributes
    node.attributes = [];
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      node.attributes.push({
        name: attr.name,
        value: attr.value,
      });
    }

    // Get visibility
    if (el instanceof HTMLElement) {
      const style = window.getComputedStyle(el);
      node.isVisible = !(
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      );
      node.isHidden = !node.isVisible;
    }

    // Check for accessibility issues
    node.accessibility = {
      role: el.getAttribute("role") || undefined,
      name: el.getAttribute("aria-label") || undefined,
      description: el.getAttribute("aria-description") || undefined,
      issues: checkAccessibilityIssues(el),
    };

    // Check for performance issues
    node.performance = checkPerformanceIssues(el, depth);
  }

  // Handle text nodes
  if (element.nodeType === Node.TEXT_NODE) {
    node.textContent = element.textContent?.trim();
  }

  // Process children
  let childIndex = 0;
  element.childNodes.forEach((child) => {
    node.children.push(parseDOM(child, depth + 1, childIndex, id));
    childIndex++;
  });

  return node;
}

export function checkAccessibilityIssues(
  element: Element
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for missing alt text on images
  if (element.tagName.toLowerCase() === "img" && !element.hasAttribute("alt")) {
    issues.push({
      type: AccessibilityIssueType.MissingAlt,
      message: "Image is missing alt text",
      severity: "error",
    });
  }

  // Check for missing labels on form controls
  if (["input", "select", "textarea"].includes(element.tagName.toLowerCase())) {
    const hasLabel =
      element.hasAttribute("aria-label") ||
      element.hasAttribute("aria-labelledby") ||
      (element.hasAttribute("id") &&
        document.querySelector(`label[for="${element.getAttribute("id")}"]`));

    if (!hasLabel) {
      issues.push({
        type: AccessibilityIssueType.MissingLabel,
        message: "Form control is missing a label",
        severity: "error",
      });
    }
  }

  // Check for missing roles on interactive elements
  if (
    element.hasAttribute("onclick") ||
    element.hasAttribute("onkeypress") ||
    element.hasAttribute("onkeydown")
  ) {
    if (
      !element.hasAttribute("role") &&
      !["button", "a", "input", "select", "textarea"].includes(
        element.tagName.toLowerCase()
      )
    ) {
      issues.push({
        type: AccessibilityIssueType.MissingRole,
        message: "Interactive element is missing a role",
        severity: "warning",
      });
    }
  }

  // Check for proper ARIA usage
  if (
    element.hasAttribute("aria-hidden") &&
    element.getAttribute("aria-hidden") === "true"
  ) {
    const hasInteractiveDescendants = !!element.querySelector(
      'a, button, input, select, textarea, [role="button"]'
    );
    if (hasInteractiveDescendants) {
      issues.push({
        type: AccessibilityIssueType.AriaIssue,
        message:
          'Element with aria-hidden="true" contains interactive elements',
        severity: "error",
      });
    }
  }

  return issues;
}

export function checkPerformanceIssues(
  element: Element,
  depth: number
): PerformanceInfo {
  const performanceInfo: PerformanceInfo = {};

  // Check for deep nesting
  if (depth > 15) {
    performanceInfo.deepNesting = true;
  }

  // Check for heavy inline styles
  if (element.hasAttribute("style")) {
    const styleValue = element.getAttribute("style") || "";
    if (styleValue.length > 200 || styleValue.split(";").length > 10) {
      performanceInfo.heavyInlineStyles = true;
    }
  }

  // Check for large datasets
  if (element.hasAttribute("data-")) {
    let dataSize = 0;
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr.name.startsWith("data-")) {
        dataSize += attr.value.length;
      }
    }

    if (dataSize > 1000) {
      performanceInfo.largeDataset = true;
    }
  }

  // Estimate style complexity
  if (element instanceof HTMLElement) {
    const style = window.getComputedStyle(element);
    const hasCostlyProperties =
      style.boxShadow !== "none" ||
      style.textShadow !== "none" ||
      style.filter !== "none" ||
      style.opacity !== "1" ||
      style.transform !== "none";

    if (hasCostlyProperties) {
      performanceInfo.styleComplexity = 1;
    }
  }

  return performanceInfo;
}

export function calculateDOMStats(root: DOMNode): DOMTreeStats {
  let totalNodes = 0;
  let maxDepth = 0;
  let elementCount: Record<string, number> = {};
  let hiddenElements = 0;
  let accessibilityIssues = 0;
  let performanceIssues = 0;

  function traverse(node: DOMNode) {
    totalNodes++;
    maxDepth = Math.max(maxDepth, node.depth);

    if (node.tagName) {
      elementCount[node.tagName] = (elementCount[node.tagName] || 0) + 1;
    }

    if (node.isHidden) {
      hiddenElements++;
    }

    if (node.accessibility?.issues.length) {
      accessibilityIssues += node.accessibility.issues.length;
    }

    if (
      node.performance &&
      (node.performance.deepNesting ||
        node.performance.heavyInlineStyles ||
        node.performance.largeDataset ||
        node.performance.styleComplexity)
    ) {
      performanceIssues++;
    }

    node.children.forEach(traverse);
  }

  traverse(root);

  return {
    totalNodes,
    maxDepth,
    elementCount,
    hiddenElements,
    accessibilityIssues,
    performanceIssues,
  };
}

export function filterDOMTree(
  node: DOMNode,
  filter: DOMTreeFilter
): DOMNode | null {
  // Clone the node to avoid modifying the original
  const clonedNode: DOMNode = { ...node, children: [] };

  // Check if the node should be filtered out
  if (filter.hideScriptTags && node.tagName === "script") {
    return null;
  }

  if (filter.hideComments && node.nodeType === Node.COMMENT_NODE) {
    return null;
  }

  if (
    filter.hideEmptyTextNodes &&
    node.nodeType === Node.TEXT_NODE &&
    (!node.textContent || !node.textContent.trim())
  ) {
    return null;
  }

  if (filter.hideInvisibleElements && node.isHidden) {
    return null;
  }

  // Filter by tag name
  if (filter.tagNames && filter.tagNames.length > 0 && node.tagName) {
    if (!filter.tagNames.includes(node.tagName.toLowerCase())) {
      return null;
    }
  }

  // Filter by attributes
  if (filter.attributes && filter.attributes.length > 0 && node.attributes) {
    const hasMatchingAttribute = filter.attributes.some((filterAttr) => {
      return node.attributes?.some((nodeAttr) => {
        if (filterAttr.value) {
          return (
            nodeAttr.name === filterAttr.name &&
            nodeAttr.value === filterAttr.value
          );
        }
        return nodeAttr.name === filterAttr.name;
      });
    });

    if (!hasMatchingAttribute) {
      return null;
    }
  }

  // Filter by text content
  if (filter.textContent && node.textContent) {
    if (
      !node.textContent.toLowerCase().includes(filter.textContent.toLowerCase())
    ) {
      return null;
    }
  }

  // Filter by accessibility issues
  if (
    filter.showOnlyAccessibilityIssues &&
    (!node.accessibility || node.accessibility.issues.length === 0)
  ) {
    // Still process children even if this node doesn't have issues
    const filteredChildren = node.children
      .map((child) => filterDOMTree(child, filter))
      .filter(Boolean) as DOMNode[];

    if (filteredChildren.length === 0) {
      return null;
    }

    clonedNode.children = filteredChildren;
    return clonedNode;
  }

  // Filter by performance issues
  if (
    filter.showOnlyPerformanceIssues &&
    (!node.performance ||
      (!node.performance.deepNesting &&
        !node.performance.heavyInlineStyles &&
        !node.performance.largeDataset &&
        !node.performance.styleComplexity))
  ) {
    // Still process children even if this node doesn't have issues
    const filteredChildren = node.children
      .map((child) => filterDOMTree(child, filter))
      .filter(Boolean) as DOMNode[];

    if (filteredChildren.length === 0) {
      return null;
    }

    clonedNode.children = filteredChildren;
    return clonedNode;
  }

  // Process children
  clonedNode.children = node.children
    .map((child) => filterDOMTree(child, filter))
    .filter(Boolean) as DOMNode[];

  return clonedNode;
}

export function searchDOMTree(node: DOMNode, searchTerm: string): DOMNode[] {
  const results: DOMNode[] = [];
  const lowerSearchTerm = searchTerm.toLowerCase();

  function traverse(node: DOMNode) {
    // Search in tag name
    if (node.tagName && node.tagName.toLowerCase().includes(lowerSearchTerm)) {
      results.push(node);
      return;
    }

    // Search in attributes
    if (node.attributes) {
      for (const attr of node.attributes) {
        if (
          attr.name.toLowerCase().includes(lowerSearchTerm) ||
          attr.value.toLowerCase().includes(lowerSearchTerm)
        ) {
          results.push(node);
          return;
        }
      }
    }

    // Search in text content
    if (
      node.textContent &&
      node.textContent.toLowerCase().includes(lowerSearchTerm)
    ) {
      results.push(node);
      return;
    }

    // Continue searching in children
    node.children.forEach(traverse);
  }

  traverse(node);
  return results;
}

export function exportDOMTreeAsText(
  node: DOMNode,
  indentation: number = 0
): string {
  let result = "";
  const indent = " ".repeat(indentation * 2);

  if (node.nodeType === Node.ELEMENT_NODE) {
    result += `${indent}<${node.tagName}`;

    if (node.attributes) {
      for (const attr of node.attributes) {
        result += ` ${attr.name}="${attr.value}"`;
      }
    }

    if (node.children.length === 0) {
      result += " />\n";
    } else {
      result += ">\n";

      for (const child of node.children) {
        result += exportDOMTreeAsText(child, indentation + 1);
      }

      result += `${indent}</${node.tagName}>\n`;
    }
  } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
    result += `${indent}${node.textContent.trim()}\n`;
  } else if (node.nodeType === Node.COMMENT_NODE) {
    result += `${indent}<!-- ${node.nodeValue} -->\n`;
  }

  return result;
}

export function exportDOMTreeAsJSON(node: DOMNode): string {
  return JSON.stringify(node, null, 2);
}

export function findNodeById(root: DOMNode, id: string): DOMNode | null {
  if (root.id === id) {
    return root;
  }

  for (const child of root.children) {
    const found = findNodeById(child, id);
    if (found) {
      return found;
    }
  }

  return null;
}

export function getDefaultSettings() {
  return {
    darkMode:
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
    autoExpandDepth: 2,
    showAttributes: true,
    showNodeValues: true,
    liveUpdateMode: false,
    highlightOnHover: true,
    maxNodesBeforeVirtualization: 1000,
    defaultExportFormat: "json" as const,
    autosaveSnapshots: false,
    snapshotIntervalSeconds: 60,
  };
}
