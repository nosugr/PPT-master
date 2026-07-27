#!/usr/bin/env python3
"""Convenience entry point for the Style Extractor.

Usage:
    python3 skills/ppt-master/scripts/extract_style.py <input.pptx> [-o <output_dir>]
    python3 skills/ppt-master/scripts/extract_style.py <directory/> [-o <output_dir>]

Extracts pixel-accurate style parameters (typography, colors, layout, spacing)
from one or more PPTX files and outputs:
  - style_blueprint.json  — machine-readable precise parameters
  - style_guide.md        — AI-readable strict specification for generation

When given multiple files, finds the common style across all presentations.
"""

import sys
from pathlib import Path

# Ensure the scripts directory is on the path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from style_extractor.extract import main

if __name__ == "__main__":
    main()
