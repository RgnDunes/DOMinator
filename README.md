# DOMinator

A Chrome extension that enhances the developer experience by providing advanced DOM visualization, analysis, and AI-powered suggestions for web development.

<p align="center">
  <img src="public/icons/icon128.png" alt="DOMinator Logo" width="128" height="128">
</p>

## Overview

DOMinator is a powerful developer tool designed to transform how web developers interact with and analyze the Document Object Model (DOM). It provides an intuitive interface for visualizing, navigating, and modifying webpage structures with advanced features that streamline the development workflow.

## Features

- **Visualize the DOM Tree** - Collapsible, customizable tree view of the current page's DOM
- **Search and Highlight Nodes** - Find elements using CSS selectors, XPath, or tag/ID/class keywords
- **AI-Powered Explanations** - Get explanations about DOM elements and their purpose
- **Semantic Suggestions** - Receive recommendations for improving HTML structure and accessibility
- **Real-time Editing** - Modify HTML attributes and content with AI recommendations
- **Export DOM Tree** - Save simplified DOM tree as JSON or image for documentation
- **Toggle Enhanced DOM** - Switch between original and AI-enhanced semantic versions
- **Anti-pattern Detection** - Identify common issues like deeply nested divs with refactoring suggestions
- **Dark Mode** - Eye-friendly interface for night coding
- **Bookmark DOM Paths** - Save important elements for debugging sessions

## Installation

### From Chrome Web Store

1. Visit the [DOMinator page](#) on the Chrome Web Store
2. Click "Add to Chrome"
3. Confirm the installation when prompted

### Development Mode

1. Clone this repository:

   ```bash
   git clone https://github.com/RgnDunes/dominator.git
   cd dominator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `dist` folder from this project

## Usage

1. Click the DOMinator icon in your Chrome toolbar to open the popup
2. Use the tree view to navigate the DOM structure of the current page
3. Search for specific elements using the search bar
4. Select elements to view details, get AI explanations, or edit properties
5. Export the DOM tree or specific sections as needed

## Screenshots

<p align="center">
  <img src="public/screenshots/dominator-main.png" alt="DOMinator Main Interface" width="600">
</p>

<p align="center">
  <img src="public/screenshots/dominator-analysis.png" alt="DOMinator Analysis View" width="600">
</p>

## Technologies

- **Chrome Extension API** (Manifest V3)
- **React** for UI components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **OpenAI API** for AI-powered features

## Privacy

DOMinator is designed with privacy in mind:

- All DOM processing happens locally in your browser
- No user data is collected or transmitted outside your browser
- The extension only accesses the current active tab when you're using it
- No personally identifiable information is collected

## Development

### Project Structure

```
dominator/
├── dist/             # Built extension files
├── public/           # Static assets
│   └── icons/        # Extension icons
├── src/              # Source code
│   ├── content/      # Content scripts
│   ├── popup/        # Extension popup UI
│   ├── services/     # Service modules
│   └── utils/        # Utility functions
├── manifest.json     # Extension manifest
└── package.json      # Project dependencies
```

### Commands

- `npm run dev` - Start development server
- `npm run build` - Build production-ready extension
- `npm run test` - Run tests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/dominator/issues) on GitHub.
