#!/bin/bash

# Clean dist directory
rm -rf dist
mkdir -p dist/images

# Copy static files
cp src/html/popup.html dist/
cp src/js/background.js dist/
cp src/js/content.js dist/
cp src/js/popup.js dist/
cp src/css/content.css dist/
cp src/css/popup.css dist/
cp public/images/*.png dist/images/
cp manifest.json dist/

echo "Build completed! The extension is in the dist/ directory."
echo "To load it in Chrome, go to chrome://extensions/, enable Developer mode,"
echo "and click 'Load unpacked' to select the dist/ folder." 