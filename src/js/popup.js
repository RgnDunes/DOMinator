// Simple popup script

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMinator: Popup opened");

  // Get button elements
  const inspectBtn = document.getElementById("inspectBtn");
  const performanceBtn = document.getElementById("performanceBtn");
  const accessibilityBtn = document.getElementById("accessibilityBtn");
  const statusDiv = document.createElement("div");
  statusDiv.style.margin = "10px 0";
  statusDiv.style.padding = "10px";
  statusDiv.style.borderRadius = "4px";
  statusDiv.style.display = "none";
  document.body.appendChild(statusDiv);

  // Get tree container and view toggle
  const treeContainer = document.getElementById("treeContainer");
  const statsContainer = document.getElementById("statsContainer");
  const viewToggle = document.getElementById("viewToggle");
  const diagramViewBtn = document.getElementById("diagramViewBtn");
  const codeViewBtn = document.getElementById("codeViewBtn");

  // Store the DOM tree data
  let currentDomTree = null;
  let currentViewMode = "diagram"; // Default to diagram view

  function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.display = "block";
    statusDiv.style.backgroundColor = isError ? "#ffebee" : "#e8f5e9";
    statusDiv.style.color = isError ? "#b71c1c" : "#1b5e20";
  }

  function hideStatus() {
    statusDiv.style.display = "none";
  }

  // Check if URL is restricted
  function isRestrictedPage(url) {
    if (!url) return true;

    return (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("chrome-search://") ||
      url.startsWith("edge://") ||
      url.startsWith("about:") ||
      url.startsWith("data:") ||
      url.startsWith("file:") ||
      url.startsWith("view-source:") ||
      url.startsWith("devtools://") ||
      url.includes("chrome.google.com/webstore") ||
      url.includes("chromewebstore.google.com")
    );
  }

  // Functions for diagram creation - must be defined before they're used
  function simplifyNodeForDiagram(node, currentDepth = 0, maxDepth = 5) {
    // Skip if we've reached max depth
    if (currentDepth > maxDepth) {
      return null;
    }

    // Skip non-element nodes except for significant text nodes
    if (
      node.nodeType !== 1 &&
      !(
        node.nodeType === 3 &&
        node.nodeValue &&
        node.nodeValue.trim().length > 5
      )
    ) {
      return null;
    }

    // Skip script, style, meta tags in the diagram
    if (
      node.nodeType === 1 &&
      (node.tagName === "SCRIPT" ||
        node.tagName === "LINK" ||
        node.tagName === "NOSCRIPT")
    ) {
      return null;
    }

    const result = {
      nodeType: node.nodeType,
      nodeName: node.nodeName,
      nodeValue: node.nodeValue,
      tagName: node.tagName,
      children: [],
    };

    // Process only important children to keep diagram clean
    if (node.children && node.children.length > 0) {
      for (let i = 0; i < node.children.length; i++) {
        const child = simplifyNodeForDiagram(
          node.children[i],
          currentDepth + 1,
          maxDepth
        );
        if (child) {
          result.children.push(child);
        }
      }
    }

    return result;
  }

  function createDiagramNode(node, depth) {
    if (!node) return "";

    // Determine node type and label
    let nodeLabel = "";
    let nodeClass = "";

    if (node.nodeType === 1) {
      // Element node
      nodeLabel = node.tagName.toLowerCase();
      nodeClass = "element-node";
    } else if (node.nodeType === 3) {
      // Text node
      const text = node.nodeValue.trim();
      nodeLabel = text.length > 10 ? text.substring(0, 10) + "..." : text;
      nodeClass = "text-node";
    } else if (node.nodeType === 8) {
      // Comment node
      nodeLabel = "comment";
      nodeClass = "comment-node";
    } else {
      nodeLabel = node.nodeName;
    }

    let html = `<div class="diagram-tree">
                  <div class="diagram-node ${nodeClass}" title="${nodeLabel}">${nodeLabel}</div>`;

    // Add children if any
    if (node.children && node.children.length > 0) {
      html += `<div class="diagram-children">
                <div class="diagram-children-container">`;

      node.children.forEach((childNode) => {
        html += `<div class="diagram-branch">${createDiagramNode(
          childNode,
          depth + 1
        )}</div>`;
      });

      html += `</div></div>`;
    }

    html += `</div>`;
    return html;
  }

  function createDiagramHTML(node) {
    // Filter to only show element nodes for diagram view
    // and limit depth to keep the diagram manageable
    const simplifiedNode = simplifyNodeForDiagram(node);
    return createDiagramNode(simplifiedNode, 0);
  }

  function createTreeHTML(node) {
    let html = '<div class="tree-item">';

    // Different display for different node types
    if (node.nodeType === 1) {
      // Element node
      html += `<span class="tree-toggle">− </span>`;
      html += `<span class="tree-element">&lt;${node.tagName}`;

      // Add attributes
      if (node.attributes && node.attributes.length > 0) {
        node.attributes.forEach((attr) => {
          html += `<span class="tree-attribute">${attr.name}="${attr.value}"</span>`;
        });
      }

      html += "&gt;</span>";
    } else if (node.nodeType === 3) {
      // Text node
      const text = node.nodeValue.trim();
      if (text) {
        html += `<span class="tree-text">"${text}"</span>`;
      } else {
        return ""; // Skip empty text nodes
      }
    } else if (node.nodeType === 8) {
      // Comment node
      html += `<span class="tree-comment">&lt;!-- ${node.nodeValue} --&gt;</span>`;
    } else {
      html += `<span>${node.nodeName}</span>`;
    }

    // Add children if any
    if (node.children && node.children.length > 0) {
      html += '<div class="tree-children">';

      node.children.forEach((childNode) => {
        const childHTML = createTreeHTML(childNode);
        if (childHTML) {
          // Only add non-empty child HTML
          html += childHTML;
        }
      });

      html += "</div>";

      // Add closing tag for element nodes
      if (node.nodeType === 1) {
        html += `<span class="tree-element">&lt;/${node.tagName}&gt;</span>`;
      }
    } else if (node.nodeType === 1) {
      // Self-closing tag for elements without children
      html = html.replace("&gt;</span>", " /&gt;</span>");
    }

    html += "</div>";
    return html;
  }

  function displayDOMTree(rootNode) {
    treeContainer.innerHTML = "";

    if (currentViewMode === "diagram") {
      // Create visual diagram tree
      const diagramHTML = createDiagramHTML(rootNode);
      treeContainer.innerHTML = diagramHTML;
    } else {
      // Create code-style tree
      const treeHTML = createTreeHTML(rootNode);
      treeContainer.innerHTML = treeHTML;

      // Add event listeners for tree toggles in code view
      const toggles = treeContainer.querySelectorAll(".tree-toggle");
      toggles.forEach((toggle) => {
        toggle.addEventListener("click", function () {
          const children = this.parentElement.querySelector(".tree-children");
          if (children) {
            if (children.style.display === "none") {
              children.style.display = "block";
              this.textContent = "− "; // Minus sign
            } else {
              children.style.display = "none";
              this.textContent = "+ "; // Plus sign
            }
          }
        });
      });
    }

    treeContainer.style.display = "block";
  }

  // View toggle buttons
  diagramViewBtn.addEventListener("click", function () {
    if (currentViewMode !== "diagram") {
      currentViewMode = "diagram";
      diagramViewBtn.classList.add("active");
      codeViewBtn.classList.remove("active");
      if (currentDomTree) {
        displayDOMTree(currentDomTree);
      }
    }
  });

  codeViewBtn.addEventListener("click", function () {
    if (currentViewMode !== "code") {
      currentViewMode = "code";
      codeViewBtn.classList.add("active");
      diagramViewBtn.classList.remove("active");
      if (currentDomTree) {
        displayDOMTree(currentDomTree);
      }
    }
  });

  // Add click event for inspect button
  inspectBtn.addEventListener("click", function () {
    console.log("DOMinator: Inspect button clicked");
    hideStatus();
    showStatus("Processing...");

    // Hide tree container when starting new inspection
    treeContainer.style.display = "none";
    statsContainer.style.display = "none";
    viewToggle.style.display = "none";

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log("DOMinator: Active tab:", tabs[0]);

      if (!tabs || !tabs.length) {
        showStatus("No active tab found", true);
        return;
      }

      const tab = tabs[0];

      // Check if we can inject into this tab
      if (isRestrictedPage(tab.url)) {
        showStatus(
          "Cannot inspect Chrome Web Store or other special pages. Please navigate to a regular website.",
          true
        );
        return;
      }

      if (tab.id) {
        console.log("DOMinator: Sending message to tab", tab.id);

        // First check if the content script is already injected
        chrome.tabs.sendMessage(tab.id, { type: "PING" }, function (response) {
          const hasError = chrome.runtime.lastError;

          if (hasError) {
            console.log(
              "DOMinator: Content script not loaded, injecting manually",
              hasError
            );

            // Inject CSS first
            chrome.scripting.insertCSS(
              {
                target: { tabId: tab.id },
                files: ["content.css"],
              },
              function () {
                const cssError = chrome.runtime.lastError;
                if (cssError) {
                  console.error("DOMinator: Failed to inject CSS", cssError);
                  // Continue anyway, CSS is not critical
                }

                // Then inject the content script
                chrome.scripting.executeScript(
                  {
                    target: { tabId: tab.id },
                    files: ["content.js"],
                  },
                  function (injectionResults) {
                    const injectionError = chrome.runtime.lastError;
                    if (injectionError) {
                      console.error(
                        "DOMinator: Failed to inject content script",
                        injectionError
                      );

                      let errorMessage = "Failed to inject content script";
                      if (injectionError.message) {
                        if (
                          injectionError.message.includes("cannot be scripted")
                        ) {
                          errorMessage =
                            "This page cannot be analyzed. Please try a regular website.";
                        } else {
                          errorMessage = `${errorMessage}: ${injectionError.message}`;
                        }
                      }

                      showStatus(errorMessage, true);
                      return;
                    }

                    // Add delay to ensure content script is initialized
                    setTimeout(() => {
                      // Now try again to send the message
                      sendDOMTreeRequest(tab.id);
                    }, 200);
                  }
                );
              }
            );
          } else {
            // Content script is loaded, send the request
            sendDOMTreeRequest(tab.id);
          }
        });
      }
    });
  });

  function sendDOMTreeRequest(tabId) {
    console.log("DOMinator: Sending DOM tree request to tab", tabId);
    chrome.tabs.sendMessage(
      tabId,
      { type: "REQUEST_DOM_TREE" },
      function (response) {
        const hasError = chrome.runtime.lastError;

        if (hasError) {
          console.error("DOMinator: Error sending message", hasError);
          showStatus(
            `Error communicating with the page: ${hasError.message}. Try refreshing the page.`,
            true
          );
          return;
        }

        if (response) {
          console.log("DOMinator: Response received", response);
          if (response.type === "ERROR") {
            showStatus("Error: " + response.payload.message, true);
          } else {
            const nodeCount = response.payload.stats.totalNodes;
            const maxDepth = response.payload.stats.maxDepth;
            showStatus(`Success! DOM tree with ${nodeCount} nodes generated.`);

            // Save the DOM tree
            currentDomTree = response.payload.root;

            // Display the DOM tree
            displayDOMTree(currentDomTree);

            // Display stats
            statsContainer.innerHTML = `
              <div><strong>Total nodes:</strong> ${nodeCount}</div>
              <div><strong>Maximum depth:</strong> ${maxDepth}</div>
            `;
            statsContainer.style.display = "block";
            viewToggle.style.display = "block";
          }
        } else {
          showStatus(
            "No response from the page. Try refreshing the page.",
            true
          );
        }
      }
    );
  }

  // Add click event for performance button
  performanceBtn.addEventListener("click", function () {
    hideStatus();
    showStatus("Performance analysis is coming soon!");
  });

  // Add click event for accessibility button
  accessibilityBtn.addEventListener("click", function () {
    hideStatus();
    showStatus("Accessibility checking is coming soon!");
  });
});
