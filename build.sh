#!/bin/bash

# Clean dist directory
rm -rf dist
mkdir -p dist/images

# Create placeholder icons if they don't exist
mkdir -p temp_icons

# Create a simple blue square icon (base64 encoded 1x1 pixel PNG)
BLUE_SQUARE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Generate icons of different sizes if they don't exist
if [ ! -s "public/images/icon16.png" ]; then
  echo "Creating placeholder icon16.png"
  echo $BLUE_SQUARE | base64 --decode > temp_icons/icon16.png
  cp temp_icons/icon16.png public/images/icon16.png
fi

if [ ! -s "public/images/icon48.png" ]; then
  echo "Creating placeholder icon48.png"
  echo $BLUE_SQUARE | base64 --decode > temp_icons/icon48.png
  cp temp_icons/icon48.png public/images/icon48.png
fi

if [ ! -s "public/images/icon128.png" ]; then
  echo "Creating placeholder icon128.png"
  echo $BLUE_SQUARE | base64 --decode > temp_icons/icon128.png
  cp temp_icons/icon128.png public/images/icon128.png
fi

# Copy static files
cp src/html/popup.html dist/
cp src/js/background.js dist/
cp src/js/content.js dist/
cp src/js/popup.js dist/
cp src/css/content.css dist/
cp src/css/popup.css dist/
cp public/images/*.png dist/images/
cp manifest.json dist/

# Clean up
rm -rf temp_icons

echo "Build completed! The extension is in the dist/ directory."
echo "To load it in Chrome, go to chrome://extensions/, enable Developer mode,"
echo "and click 'Load unpacked' to select the dist/ folder." 