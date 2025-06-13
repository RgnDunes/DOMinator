# DOMinator

A Chrome extension that enhances the developer experience by providing advanced DOM visualization, analysis, and AI-powered suggestions.

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

### Development Mode

1. Clone this repository:

   ```
   git clone https://github.com/yourusername/dominator.git
   cd dominator
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Convert SVG icons to PNG (required for Chrome extensions):

   ```
   # Using ImageMagick (install if needed)
   convert -background none public/icons/icon16.svg public/icons/icon16.png
   convert -background none public/icons/icon48.svg public/icons/icon48.png
   convert -background none public/icons/icon128.svg public/icons/icon128.png
   ```

4. Build the extension:

   ```
   npm run build
   ```

5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder from this project

## Usage

1. Click the DOMinator icon in your Chrome toolbar to open the popup
2. Use the tree view to navigate the DOM structure of the current page
3. Search for specific elements using the search bar
4. Select elements to view details, get AI explanations, or edit properties
5. Export the DOM tree or specific sections as needed

## Technologies

- **Chrome Extension API** (Manifest V3)
- **React** for UI components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **OpenAI API** for AI-powered features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
