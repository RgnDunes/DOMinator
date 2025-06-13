#!/bin/bash

# Build script for DOMinator Chrome Extension

echo "🔨 Building DOMinator Chrome Extension..."

# Create directories if they don't exist
mkdir -p dist/public/icons dist/src

# Clean up previous build if exists
echo "🧹 Cleaning up previous build..."
rm -rf dist/*

# Build with Vite
echo "📦 Running Vite build..."
npm run build

# Copy manifest.json to dist
echo "📄 Copying manifest.json to dist..."
cp manifest.json dist/

# Copy icons to dist
echo "🖼️ Copying icons to dist..."
mkdir -p dist/public/icons
cp -r public/icons/* dist/public/icons/

# Make sure the content script is in the right place
echo "🔍 Checking for content script..."
if [ -f "dist/src/content.js" ]; then
  echo "✅ Content script found at dist/src/content.js"
else
  echo "⚠️ Content script not found at expected location, searching..."
  CONTENT_SCRIPT=$(find dist -name "*content*.js" | grep -v "map" | head -n 1)
  if [ -n "$CONTENT_SCRIPT" ]; then
    echo "✅ Found content script at $CONTENT_SCRIPT, copying to correct location..."
    mkdir -p dist/src
    cp "$CONTENT_SCRIPT" dist/src/content.js
  else
    echo "❌ Could not find content script. Build may be incomplete."
  fi
fi

# Make sure the background script is in the right place
echo "🔍 Checking for background script..."
if [ -f "dist/src/background.js" ]; then
  echo "✅ Background script found at dist/src/background.js"
else
  echo "⚠️ Background script not found at expected location, searching..."
  BACKGROUND_SCRIPT=$(find dist -name "background.js" | grep -v "map" | head -n 1)
  if [ -n "$BACKGROUND_SCRIPT" ]; then
    echo "✅ Found background script at $BACKGROUND_SCRIPT, copying to correct location..."
    mkdir -p dist/src
    cp "$BACKGROUND_SCRIPT" dist/src/background.js
  else
    echo "❌ Could not find background script. Build may be incomplete."
  fi
fi

echo "✅ Build complete! The extension is ready in the dist folder."
echo "📋 To install in Chrome:"
echo "   1. Open Chrome and go to chrome://extensions/"
echo "   2. Enable Developer Mode"
echo "   3. Click 'Load unpacked' and select the dist folder" 