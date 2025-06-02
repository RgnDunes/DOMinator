// Create a new panel in Chrome DevTools
chrome.devtools.panels.create(
  "DOMinator", // Panel title
  "/public/images/icon48.png", // Panel icon
  "/panel.html", // Panel HTML page
  (panel) => {
    // Panel created callback
    console.log("DOMinator DevTools panel created");

    // Set up communication with the panel
    panel.onShown.addListener((window) => {
      console.log("DOMinator panel shown");
    });

    panel.onHidden.addListener(() => {
      console.log("DOMinator panel hidden");
    });
  }
);
