#!/bin/bash
# Generate SVG diagrams from Mermaid source files
#
# Prerequisites:
#   npm install -g @mermaid-js/mermaid-cli
#
# Usage:
#   ./scripts/generate-diagrams.sh
#
# This regenerates all SVG diagrams from their Mermaid (.mmd) source files.
# Run this after editing any .mmd file in src/assets/diagrams/.

set -e

DIAGRAMS_DIR="src/assets/diagrams"
OUTPUT_DIR="src/assets"

echo "Generating SVG diagrams from Mermaid sources..."

for mmd_file in "$DIAGRAMS_DIR"/*.mmd; do
    basename=$(basename "$mmd_file" .mmd)
    output_file="$OUTPUT_DIR/$basename.svg"
    echo "  $mmd_file -> $output_file"
    npx mmdc -i "$mmd_file" -o "$output_file" -b transparent
done

echo "Done. SVG files generated in $OUTPUT_DIR/"
