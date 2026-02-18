#!/bin/bash

# AFCT Theme Build Script
# Creates a production-ready zip file with only shipping files

set -e

THEME_NAME="afct"
BUILD_DIR="build"
VERSION=$(grep -m1 '"version"' package.json | sed 's/.*: "\(.*\)".*/\1/')
OUTPUT_FILE="${THEME_NAME}-${VERSION}.zip"

echo "Building ${THEME_NAME} theme v${VERSION}..."

# Run webpack production build
echo "Running webpack build..."
npm run build

# Clean previous build
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/${THEME_NAME}"

echo "Copying theme files..."

# Copy PHP files (root level)
cp *.php "${BUILD_DIR}/${THEME_NAME}/"

# Copy essential files
cp style.css "${BUILD_DIR}/${THEME_NAME}/"
cp screenshot.png "${BUILD_DIR}/${THEME_NAME}/"
cp credits.json "${BUILD_DIR}/${THEME_NAME}/" 2>/dev/null || true

# Copy dist — minified bundles only (skip unminified dev builds and font copies)
mkdir -p "${BUILD_DIR}/${THEME_NAME}/dist"
cp dist/afct.min.js dist/afct.min.js.LICENSE.txt \
   dist/bundle.min.css dist/bundle.min.js \
   "${BUILD_DIR}/${THEME_NAME}/dist/" 2>/dev/null || true
# Webpack-emitted fonts (hashed filenames)
find dist -name "*.otf" -o -name "*.ttf" -o -name "*.woff" -o -name "*.woff2" \
    | xargs -I{} cp {} "${BUILD_DIR}/${THEME_NAME}/dist/" 2>/dev/null || true

cp -r css "${BUILD_DIR}/${THEME_NAME}/"
cp -r fonts "${BUILD_DIR}/${THEME_NAME}/"
cp -r img "${BUILD_DIR}/${THEME_NAME}/"
cp -r inc "${BUILD_DIR}/${THEME_NAME}/"

# JS files loaded directly (not webpack-bundled)
mkdir -p "${BUILD_DIR}/${THEME_NAME}/js"
# Runtime data
cp js/countries-110m.json js/history.json \
   "${BUILD_DIR}/${THEME_NAME}/js/" 2>/dev/null || true
# Frontend scripts
cp js/youtube-consent.js \
   "${BUILD_DIR}/${THEME_NAME}/js/" 2>/dev/null || true
# Admin scripts
cp js/admin-history.js js/admin-history-json-upload.js js/admin-prospect-carousel.js \
   "${BUILD_DIR}/${THEME_NAME}/js/" 2>/dev/null || true

# Remove any .DS_Store files
find "${BUILD_DIR}/${THEME_NAME}" -name ".DS_Store" -delete 2>/dev/null || true

# Create zip file
echo "Creating ${OUTPUT_FILE}..."
cd "${BUILD_DIR}"
zip -r "../${OUTPUT_FILE}" "${THEME_NAME}" -x "*.DS_Store" -x "__MACOSX/*"
cd ..

# Clean up build directory
rm -rf "${BUILD_DIR}"

echo ""
echo "Build complete: ${OUTPUT_FILE}"
echo "Size: $(du -h "${OUTPUT_FILE}" | cut -f1)"
