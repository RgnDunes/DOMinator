# DOMinator

A Chrome extension that enhances the developer experience by providing advanced DOM visualization, analysis, and AI-powered suggestions for web development.

<p align="center">
  <img width="269" alt="Screenshot 2025-06-14 at 12 27 33 AM" src="https://github.com/user-attachments/assets/c78d85e5-d210-4cf8-ae90-075a6b772f2d" />
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

1. Visit the [DOMinator page](/#) on the Chrome Web Store
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
 <img width="444" alt="Screenshot 2025-06-13 at 9 07 20 PM" src="https://github.com/user-attachments/assets/c0f83ea7-8eee-47d2-9e23-e97f3036f0a3" />
</p>

<p align="center">
<img width="427" alt="Screenshot 2025-06-14 at 12 08 20 AM" src="https://github.com/user-attachments/assets/55a850bb-6050-40c4-83ec-56924caac97a" />
</p>

<p align="center">
  <img width="426" alt="Screenshot 2025-06-14 at 12 08 28 AM" src="https://github.com/user-attachments/assets/959d0ca6-6095-4825-b926-727ae5bb28a6" />
</p>

<p align="center">
  <img width="418" alt="Screenshot 2025-06-14 at 12 08 08 AM" src="https://github.com/user-attachments/assets/d546fedc-0e63-4317-896a-65cef9ede37f" />
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
