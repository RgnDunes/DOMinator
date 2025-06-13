import { DOMNode } from "../popup/store";

export const extractDOMTree = (document: Document): DOMNode => {
  return createDOMNodeRepresentation(document.documentElement, 0);
};

const createDOMNodeRepresentation = (
  element: Element,
  depth: number
): DOMNode => {
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

export const generateUniqueId = (): string => {
  return "dominator-" + Math.random().toString(36).substring(2, 9);
};

export const getXPath = (element: Element): string => {
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

export const getCssSelector = (element: Element): string => {
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

  if (element.parentElement && element.parentElement !== document.body) {
    const parentSelector = getCssSelector(element.parentElement);
    selector = `${parentSelector} > ${selector}`;
  }

  return selector;
};

export const detectAntiPatterns = (
  node: DOMNode
): { node: DOMNode; issue: string; suggestion: string }[] => {
  const issues: { node: DOMNode; issue: string; suggestion: string }[] = [];

  const checkDeeplyNestedDivs = (
    node: DOMNode,
    depth: number,
    divChain: number
  ) => {
    const isDiv = node.tagName.toLowerCase() === "div";
    const currentDivChain = isDiv ? divChain + 1 : 0;

    if (currentDivChain >= 3) {
      issues.push({
        node,
        issue: `Deeply nested <div> chain detected (${currentDivChain} levels)`,
        suggestion:
          "Consider using more semantic elements or simplifying the structure",
      });
    }

    node.children.forEach((child) => {
      checkDeeplyNestedDivs(child, depth + 1, currentDivChain);
    });
  };

  const checkAccessibility = (node: DOMNode) => {
    const tagName = node.tagName.toLowerCase();

    if (tagName === "img" && !node.attributes.alt) {
      issues.push({
        node,
        issue: "Image missing alt attribute",
        suggestion: "Add descriptive alt text to improve accessibility",
      });
    }

    if (
      tagName === "button" &&
      !node.textContent &&
      !node.attributes["aria-label"]
    ) {
      issues.push({
        node,
        issue: "Button without accessible name",
        suggestion: "Add text content or aria-label to the button",
      });
    }

    if (
      tagName === "input" &&
      !node.attributes["aria-label"] &&
      !node.attributes["aria-labelledby"]
    ) {
      issues.push({
        node,
        issue: "Form input without associated label",
        suggestion:
          "Associate this input with a label element or add aria-label",
      });
    }

    if (tagName === "div") {
      if (
        node.attributes.class?.includes("nav") ||
        node.attributes.id?.includes("nav")
      ) {
        issues.push({
          node,
          issue: "Non-semantic navigation",
          suggestion: "Replace <div> with <nav> for better semantics",
        });
      } else if (
        node.attributes.class?.includes("header") ||
        node.attributes.id?.includes("header")
      ) {
        issues.push({
          node,
          issue: "Non-semantic header",
          suggestion: "Replace <div> with <header> for better semantics",
        });
      } else if (
        node.attributes.class?.includes("footer") ||
        node.attributes.id?.includes("footer")
      ) {
        issues.push({
          node,
          issue: "Non-semantic footer",
          suggestion: "Replace <div> with <footer> for better semantics",
        });
      }
    }

    node.children.forEach(checkAccessibility);
  };

  checkDeeplyNestedDivs(node, 0, 0);
  checkAccessibility(node);

  return issues;
};

export const exportAsJSON = (node: DOMNode): string => {
  const simplify = (node: DOMNode): any => {
    return {
      tag: node.tagName.toLowerCase(),
      attributes: node.attributes,
      textContent: node.textContent || undefined,
      children: node.children.map(simplify),
    };
  };

  return JSON.stringify(simplify(node), null, 2);
};

export const generateHTML = (node: DOMNode): string => {
  const tagName = node.tagName.toLowerCase();

  const attributes = Object.entries(node.attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  const selfClosingTags = ["img", "input", "br", "hr", "meta", "link"];
  if (selfClosingTags.includes(tagName)) {
    return `<${tagName}${attributes ? " " + attributes : ""} />`;
  }

  let html = `<${tagName}${attributes ? " " + attributes : ""}>`;

  if (node.children.length === 0 && node.textContent) {
    html += node.textContent;
  } else {
    node.children.forEach((child) => {
      html += generateHTML(child);
    });
  }

  html += `</${tagName}>`;

  return html;
};
