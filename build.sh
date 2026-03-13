#!/bin/bash
# Build script for the Rate It All Chrome extension

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VERSION=$(grep -o '"version": *"[^"]*"' public/manifest.json | grep -o '[0-9.]*')

if [ -z "$VERSION" ]; then
    echo "Error: Could not extract version from public/manifest.json"
    exit 1
fi

echo "Building Rate It All v${VERSION}..."

INLINE_RUNTIME_CHUNK=false GENERATE_SOURCEMAP=false ./node_modules/.bin/craco build

OUTPUT="rate-it-all-v${VERSION}.zip"
rm -f "$OUTPUT"
(cd build && zip -r "$SCRIPT_DIR/$OUTPUT" .)

echo ""
echo "Created: $OUTPUT"
echo ""
echo "Contents:"
unzip -l "$OUTPUT"
echo ""
echo "Done! Load the 'build' folder in chrome://extensions (Load unpacked)."
