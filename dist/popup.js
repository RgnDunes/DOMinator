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

  // Get tree container
  const treeContainer = document.getElementById("treeContainer");
  const statsContainer = document.getElementById("statsContainer");

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

  // Add click event for inspect button
  inspectBtn.addEventListener("click", function () {
    console.log("DOMinator: Inspect button clicked");
    hideStatus();
    showStatus("Processing...");

    // Hide tree container when starting new inspection
    treeContainer.style.display = "none";
    statsContainer.style.display = "none";

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

            // Display the DOM tree
            displayDOMTree(response.payload.root);

            // Display stats
            statsContainer.innerHTML = `
              <div><strong>Total nodes:</strong> ${nodeCount}</div>
              <div><strong>Maximum depth:</strong> ${maxDepth}</div>
            `;
            statsContainer.style.display = "block";
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

  function displayDOMTree(rootNode) {
    treeContainer.innerHTML = "";

    // Create DOM tree from the response
    const treeHTML = createTreeHTML(rootNode);
    treeContainer.innerHTML = treeHTML;
    treeContainer.style.display = "block";

    // Add event listeners for tree toggles
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
