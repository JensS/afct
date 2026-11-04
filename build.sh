#!/bin/bash

# AFCT Theme Build Script
# Creates a production-ready zip file with only shipping files

set -euo pipefail

cd "$(dirname "$0")"

THEME_NAME="afct"
BUILD_DIR="build"
VERSION=$(node -p "require('./package.json').version")
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
cp credits.json "${BUILD_DIR}/${THEME_NAME}/"

# Copy dist — minified bundles only (skip unminified dev builds and font copies)
mkdir -p "${BUILD_DIR}/${THEME_NAME}/dist"
cp dist/afct.min.js dist/bundle.min.css "${BUILD_DIR}/${THEME_NAME}/dist/"
# Webpack dynamic chunks (history-timeline + vendor splits)
find dist -name "*.chunk.min.js" \
    | xargs -I{} cp {} "${BUILD_DIR}/${THEME_NAME}/dist/"
# License files
find dist -name "*.LICENSE.txt" \
    | xargs -I{} cp {} "${BUILD_DIR}/${THEME_NAME}/dist/"
# Webpack-emitted fonts (hashed filenames)
find dist -name "*.otf" -o -name "*.ttf" -o -name "*.woff" -o -name "*.woff2" \
    | xargs -I{} cp {} "${BUILD_DIR}/${THEME_NAME}/dist/"

cp -r css "${BUILD_DIR}/${THEME_NAME}/"
cp -r fonts "${BUILD_DIR}/${THEME_NAME}/"
cp -r img "${BUILD_DIR}/${THEME_NAME}/"
cp -r inc "${BUILD_DIR}/${THEME_NAME}/"

# JS files loaded directly (not webpack-bundled)
mkdir -p "${BUILD_DIR}/${THEME_NAME}/js"
# Runtime data
cp js/countries-50m.json js/countries-110m.json \
   "${BUILD_DIR}/${THEME_NAME}/js/"
# Frontend scripts
cp js/youtube-consent.js \
   "${BUILD_DIR}/${THEME_NAME}/js/"
# Admin scripts
cp js/admin-history.js js/admin-history-json-upload.js js/admin-prospect-carousel.js \
   "${BUILD_DIR}/${THEME_NAME}/js/"

# Remove any .DS_Store files
find "${BUILD_DIR}/${THEME_NAME}" -name ".DS_Store" -delete

# Create zip file
echo "Creating ${OUTPUT_FILE}..."
cd "${BUILD_DIR}"
zip -qr "${OUTPUT_FILE}" "${THEME_NAME}" -x "*.DS_Store" -x "__MACOSX/*"
cd ..

echo ""
echo "Build complete: ${BUILD_DIR}/${OUTPUT_FILE}"
echo "Size: $(du -h "${BUILD_DIR}/${OUTPUT_FILE}" | cut -f1)"
