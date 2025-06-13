// AI Service for DOMinator extension

import { DOMNode } from "../popup/store";

// Interface for AI explanation request
interface AIExplanationRequest {
  nodeId: string;
  tagName: string;
  attributes: Record<string, string>;
  textContent?: string;
  children: number;
  xpath?: string;
}

// Interface for AI explanation response
interface AIExplanationResponse {
  explanation: string;
  suggestions?: string[];
}

// Interface for AI DOM enhancement request
interface AIDOMEnhancementRequest {
  domTree: DOMNode;
}

// Interface for AI DOM enhancement response
interface AIDOMEnhancementResponse {
  enhancedDOM: string;
  changes: {
    original: string;
    enhanced: string;
    reason: string;
  }[];
}

/**
 * Get an AI explanation for a DOM node
 * @param node The DOM node to explain
 * @returns Promise with the explanation
 */
export const getAIExplanation = async (
  node: DOMNode
): Promise<AIExplanationResponse> => {
  try {
    // For a real implementation, you would call an AI API like OpenAI here
    // This is a mock implementation

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate mock explanation based on node properties
    const explanation = generateMockExplanation(node);

    // Generate mock suggestions
    const suggestions = generateMockSuggestions(node);

    return {
      explanation,
      suggestions,
    };
  } catch (error) {
    console.error("Error getting AI explanation:", error);
    return {
      explanation: "Unable to generate explanation. Please try again later.",
    };
  }
};

/**
 * Generate a mock explanation for a DOM node
 * @param node The DOM node to explain
 * @returns A mock explanation
 */
const generateMockExplanation = (node: DOMNode): string => {
  const tagName = node.tagName.toLowerCase();

  // Basic explanation based on tag name
  let explanation = `This is a <${tagName}> element`;

  // Add information about ID if present
  if (node.attributes.id) {
    explanation += ` with ID "${node.attributes.id}"`;
  }

  // Add information about classes if present
  if (node.attributes.class) {
    const classes = node.attributes.class.split(" ").filter(Boolean);
    if (classes.length === 1) {
      explanation += ` with class "${classes[0]}"`;
    } else if (classes.length > 1) {
      explanation += ` with classes "${classes.join('", "')}"`;
    }
  }

  // Add information about children
  if (node.children.length > 0) {
    explanation += `. It contains ${node.children.length} child element${
      node.children.length !== 1 ? "s" : ""
    }.`;
  } else {
    explanation += ".";
  }

  // Add purpose explanation based on tag and attributes
  explanation += "\n\n";

  if (tagName === "div") {
    explanation +=
      "This <div> element is used as a generic container for content. ";

    if (
      node.attributes.class?.includes("container") ||
      node.attributes.class?.includes("wrapper")
    ) {
      explanation +=
        "It appears to be a main wrapper or container for other elements. ";
    }

    if (!node.attributes.role && node.children.length > 3) {
      explanation +=
        "Consider adding a semantic role attribute for better accessibility. ";
    }
  } else if (tagName === "button") {
    explanation += "This button element is used for user interaction. ";

    if (!node.attributes.type) {
      explanation += "It doesn't have a type attribute specified. ";
    }

    if (!node.attributes["aria-label"] && !node.textContent) {
      explanation += "Consider adding an aria-label for better accessibility. ";
    }
  } else if (tagName === "a") {
    explanation += "This is a link element that navigates to ";

    if (node.attributes.href) {
      explanation += `"${node.attributes.href}". `;
    } else {
      explanation += "an unspecified destination (missing href attribute). ";
    }

    if (!node.attributes.rel && node.attributes.href?.startsWith("http")) {
      explanation += 'Consider adding rel="noopener" for external links. ';
    }
  } else if (tagName === "img") {
    explanation += "This is an image element ";

    if (node.attributes.alt) {
      explanation += `with alt text "${node.attributes.alt}". `;
    } else {
      explanation += "missing alt text, which is important for accessibility. ";
    }
  } else if (tagName === "input") {
    explanation += `This is an input element of type "${
      node.attributes.type || "text"
    }". `;

    if (!node.attributes.id) {
      explanation +=
        "It doesn't have an ID, which makes it harder to associate with a label. ";
    }
  } else if (tagName === "nav") {
    explanation +=
      "This is a navigation element that typically contains links to other pages. ";
  } else if (tagName === "header") {
    explanation +=
      "This is a header element that typically contains introductory content or navigation aids. ";
  } else if (tagName === "footer") {
    explanation +=
      "This is a footer element that typically contains information about the author, copyright, or related links. ";
  } else if (tagName === "section") {
    explanation +=
      "This is a section element that represents a standalone section of content. ";

    if (!node.attributes["aria-label"] && !node.attributes["aria-labelledby"]) {
      explanation +=
        "Consider adding an aria-label or aria-labelledby attribute for better accessibility. ";
    }
  }

  return explanation;
};

/**
 * Generate mock suggestions for improving a DOM node
 * @param node The DOM node to generate suggestions for
 * @returns An array of suggestions
 */
const generateMockSuggestions = (node: DOMNode): string[] => {
  const suggestions: string[] = [];
  const tagName = node.tagName.toLowerCase();

  // Suggest semantic elements instead of divs
  if (tagName === "div") {
    if (
      node.attributes.class?.includes("nav") ||
      node.attributes.id?.includes("nav")
    ) {
      suggestions.push(
        "Replace <div> with <nav> for better semantics since this appears to be a navigation element."
      );
    } else if (
      node.attributes.class?.includes("header") ||
      node.attributes.id?.includes("header")
    ) {
      suggestions.push("Replace <div> with <header> for better semantics.");
    } else if (
      node.attributes.class?.includes("footer") ||
      node.attributes.id?.includes("footer")
    ) {
      suggestions.push("Replace <div> with <footer> for better semantics.");
    } else if (
      node.attributes.class?.includes("main") ||
      node.attributes.id?.includes("main")
    ) {
      suggestions.push("Replace <div> with <main> for better semantics.");
    } else if (
      node.attributes.class?.includes("section") ||
      node.attributes.id?.includes("section")
    ) {
      suggestions.push("Replace <div> with <section> for better semantics.");
    } else if (!node.attributes.role && node.children.length > 0) {
      suggestions.push(
        "Add a role attribute to this <div> to improve accessibility."
      );
    }
  }

  // Suggest adding alt text to images
  if (tagName === "img" && !node.attributes.alt) {
    suggestions.push("Add alt text to this image for better accessibility.");
  }

  // Suggest adding type to buttons
  if (tagName === "button" && !node.attributes.type) {
    suggestions.push(
      'Add a type attribute to this button (e.g., type="button").'
    );
  }

  // Suggest adding labels to form elements
  if (
    (tagName === "input" || tagName === "textarea" || tagName === "select") &&
    !node.attributes["aria-label"] &&
    !node.attributes["aria-labelledby"]
  ) {
    suggestions.push(
      "Add an aria-label or associate this form control with a <label> element."
    );
  }

  // Suggest adding rel to external links
  if (
    tagName === "a" &&
    node.attributes.href?.startsWith("http") &&
    !node.attributes.rel
  ) {
    suggestions.push(
      'Add rel="noopener noreferrer" to this external link for security.'
    );
  }

  return suggestions;
};

/**
 * Get AI suggestions for enhancing the entire DOM
 * @param domTree The DOM tree to enhance
 * @returns Promise with the enhanced DOM
 */
export const getAIDOMEnhancement = async (
  domTree: DOMNode
): Promise<AIDOMEnhancementResponse> => {
  try {
    // For a real implementation, you would call an AI API like OpenAI here
    // This is a mock implementation

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real implementation, this would be the enhanced HTML from the AI
    // For now, we'll just return a mock response
    return {
      enhancedDOM: "<html><!-- Enhanced DOM would be here --></html>",
      changes: [
        {
          original: '<div class="navigation">',
          enhanced: '<nav class="navigation">',
          reason: "Replaced div with semantic nav element",
        },
        {
          original: '<div class="header">',
          enhanced: '<header class="header">',
          reason: "Replaced div with semantic header element",
        },
      ],
    };
  } catch (error) {
    console.error("Error getting AI DOM enhancement:", error);
    return {
      enhancedDOM: "",
      changes: [],
    };
  }
};

/**
 * Check if an API key is configured
 * @returns Promise with boolean indicating if API key is configured
 */
export const isAIConfigured = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["openaiApiKey"], (result) => {
      resolve(!!result.openaiApiKey);
    });
  });
};

/**
 * Configure the AI service with an API key
 * @param apiKey The API key to use
 * @returns Promise indicating success
 */
export const configureAI = async (apiKey: string): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
      resolve(true);
    });
  });
};
