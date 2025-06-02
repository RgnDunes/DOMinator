# DOMinator - Chrome Extension for DOM Visualization & Analysis

DOMinator is a powerful Chrome extension that helps developers visualize, analyze, and export DOM trees with detailed insights into structure, performance, and accessibility.

## 🌟 Features

### Interactive DOM Tree Visualization

- Generate the full DOM tree of the current webpage
- Display in a collapsible, searchable, and color-coded format
- Hover-to-highlight feature: When you hover over a node in the tree, the corresponding element on the webpage is highlighted.

### Detailed Node Inspector

- Show element details such as tag names, attributes, styles, computed values, and event listeners.
- Include support for inline styles, classes, dataset attributes, and ARIA roles.

### Filtering, Search, and Custom Views

- Filter nodes by tag (e.g., div, span), classes, attributes, or text content
- Search within the tree for specific elements or properties
- Toggle visibility of certain node types (like script tags or comments) for a cleaner tree view

### DOM Export and Snapshot

- Export the DOM tree as a JSON file, text file, or a visual tree diagram image
- Capture snapshots of the DOM tree at different times for debugging dynamic pages
- Compare snapshots to detect DOM changes over time

### Performance Insights

- Display key metrics like total nodes, maximum depth, etc.
- Identify nodes contributing to layout shifts or reflows
- Find elements with heavy inline styles or large datasets

### Accessibility Insights

- Highlight potential accessibility issues like missing alt attributes, ARIA roles, or improper semantic tags
- Provide an A11y summary report for the entire DOM

### Live DOM Update Mode

- Watch the DOM tree update in real-time as page content changes (ideal for SPAs and dynamic apps)

### Bookmarking and Notes

- Bookmark specific nodes for future reference
- Add notes to nodes for collaboration or feature reviews

## 🚀 Installation

### From Chrome Web Store

_(Coming soon)_

### Manual Installation (Developer Mode)

1. Clone this repository:

   ```
   git clone https://github.com/RgnDunes/DOMinator
   ```

2. Build the extension:

   ```
   cd DOMinator
   npm install
   npm run build
   ```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `dist` folder from the project directory

## 🔧 Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Setup Development Environment

```
git clone https://github.com/RgnDunes/DOMinator
cd dominator
npm install
```

### Development Commands

- `npm run dev` - Start development mode with hot reloading
- `npm run build` - Build the extension for production
- `npm test` - Run tests

## 🧩 Usage

1. Click the DOMinator icon in your Chrome toolbar
2. Click "Inspect DOM Tree" to open the visualization panel
3. Navigate the tree, search for elements, or use filters to focus on specific parts
4. Use the Node Inspector to view detailed information about selected elements
5. Export the DOM tree or take snapshots as needed

## 📖 Documentation

### Main Views

- **Tree View**: Navigate the DOM structure with expandable/collapsible nodes
- **Performance View**: Analyze performance metrics and identify bottlenecks
- **Accessibility View**: Check for accessibility issues and get remediation suggestions

### Features Guide

- **Filtering**: Use the sidebar to filter elements by tag name, visibility, etc.
- **Search**: Enter text in the search box to find nodes by tag, attribute, or content
- **Bookmarks**: Click the bookmark button in the inspector to save important nodes
- **Export**: Use the export button to save the DOM tree as JSON or text
- **Snapshots**: Capture the current DOM state to compare changes over time
- **Live Mode**: Toggle live updates to watch the DOM change in real-time

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for web developers who appreciate DOM visualization and analysis.
