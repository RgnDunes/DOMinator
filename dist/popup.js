// Simple popup script

document.addEventListener("DOMContentLoaded", function () {
  // Get button elements
  const inspectBtn = document.getElementById("inspectBtn");
  const performanceBtn = document.getElementById("performanceBtn");
  const accessibilityBtn = document.getElementById("accessibilityBtn");

  // Add click event for inspect button
  inspectBtn.addEventListener("click", function () {
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "REQUEST_DOM_TREE" },
          function (response) {
            if (response) {
              alert("DOM tree generated! Check the console for details.");
            } else {
              alert(
                "No response from the page. Make sure you're on a web page."
              );
            }
          }
        );
      }
    });
  });

  // Add click event for performance button
  performanceBtn.addEventListener("click", function () {
    alert("Performance analysis is coming soon!");
  });

  // Add click event for accessibility button
  accessibilityBtn.addEventListener("click", function () {
    alert("Accessibility checking is coming soon!");
  });
});
