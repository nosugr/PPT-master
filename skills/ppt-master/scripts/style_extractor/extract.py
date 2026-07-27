#!/usr/bin/env python3
"""Style Extractor — main entry point.

Extracts pixel-accurate style parameters from a PPTX file and outputs:
- style_blueprint.json — machine-readable precise parameters
- style_guide.md — AI-readable strict specification

Usage:
    python style_extractor/extract.py <input.pptx> [-o <output_dir>]
    python style_extractor/extract.py <directory_of_pptx_files> [-o <output_dir>]

When given multiple PPTX files (or a directory), the extractor merges
the analysis to find the common style across all presentations.
"""

from __future__ import annotations

import argparse
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

# Ensure parent scripts dir is on path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pptx_to_svg.emu_units import NS

from .typography_analyzer import (
    TextFrameRecord,
    TypographyProfile,
    analyze_typography,
    extract_theme_fonts,
    parse_text_frame,
)
from .color_analyzer import (
    ColorProfile,
    ColorUsage,
    analyze_colors,
    collect_colors_from_slide,
    extract_theme_colors,
)
from .layout_analyzer import (
    LayoutProfile,
    SlideLayout,
    analyze_layout,
    extract_shapes_from_slide,
)
from .pattern_detector import PatternProfile, analyze_patterns
from .output_formatter import generate_blueprint, generate_style_guide, write_outputs


# OOXML relationship types
SLIDE_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"
THEME_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme"
LAYOUT_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout"
MASTER_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster"

REL_NS = {"rel": "http://schemas.openxmlformats.org/package/2006/relationships"}


def load_xml(zf: zipfile.ZipFile, path: str) -> ET.Element | None:
    """Load and parse an XML part from the PPTX zip."""
    try:
        with zf.open(path) as fh:
            return ET.parse(fh).getroot()
    except (KeyError, ET.ParseError):
        return None


def normalize_path(target: str, base: str) -> str:
    """Resolve a relative target path against a base part path."""
    from pathlib import PurePosixPath
    import posixpath
    resolved = str(PurePosixPath(base).parent / target)
    normalized = posixpath.normpath(resolved).replace("\\", "/")
    return normalized.lstrip("/")


def parse_rels(zf: zipfile.ZipFile, part_path: str) -> dict[str, dict[str, str]]:
    """Parse the .rels file for a given part."""
    from pathlib import PurePosixPath
    rels_path = str(PurePosixPath(part_path).parent / "_rels" / f"{PurePosixPath(part_path).name}.rels")
    root = load_xml(zf, rels_path)
    if root is None:
        return {}

    rels = {}
    for rel in root.findall("rel:Relationship", REL_NS):
        rid = rel.attrib.get("Id", "")
        target = rel.attrib.get("Target", "")
        rtype = rel.attrib.get("Type", "")
        if rid and target:
            rels[rid] = {
                "target": normalize_path(target, part_path),
                "type": rtype,
            }
    return rels


def extract_from_pptx(pptx_path: Path) -> dict:
    """Extract style data from a single PPTX file.

    Returns a dict with keys: typography, colors, layout, patterns, meta.
    """
    print(f"[INFO] Analyzing: {pptx_path.name}")

    with zipfile.ZipFile(pptx_path, "r") as zf:
        # Load presentation
        pres_root = load_xml(zf, "ppt/presentation.xml")
        if pres_root is None:
            print(f"[ERROR] Invalid PPTX: {pptx_path}")
            return {}

        # Slide size
        canvas_w = 1280.0
        canvas_h = 720.0
        sld_sz = pres_root.find("p:sldSz", NS)
        if sld_sz is not None:
            from pptx_to_svg.emu_units import emu_to_px
            canvas_w = emu_to_px(int(sld_sz.attrib.get("cx", "12192000")))
            canvas_h = emu_to_px(int(sld_sz.attrib.get("cy", "6858000")))

        # Get slide parts
        pres_rels = parse_rels(zf, "ppt/presentation.xml")
        slide_parts = []
        for sld_id in pres_root.findall("p:sldIdLst/p:sldId", NS):
            rid = sld_id.attrib.get(f"{{{NS['r']}}}id", "")
            rel = pres_rels.get(rid)
            if rel and rel["type"] == SLIDE_REL:
                slide_parts.append(rel["target"])

        # Find theme
        theme_root = None
        theme_fonts: dict[str, str] = {}
        theme_colors: dict[str, str] = {}

        # Walk through masters to find theme
        for rel in pres_rels.values():
            if rel["type"] == MASTER_REL:
                master_rels = parse_rels(zf, rel["target"])
                for mrel in master_rels.values():
                    if mrel["type"] == THEME_REL:
                        theme_root = load_xml(zf, mrel["target"])
                        if theme_root is not None:
                            theme_fonts = extract_theme_fonts(theme_root)
                            theme_colors = extract_theme_colors(theme_root)
                        break
                if theme_root is not None:
                    break

        print(f"  Slides: {len(slide_parts)}")
        print(f"  Theme fonts: {theme_fonts}")
        print(f"  Theme colors: {len(theme_colors)} defined")

        # Process each slide
        all_text_frames: list[TextFrameRecord] = []
        all_color_usages: list[ColorUsage] = []
        all_slide_layouts: list[SlideLayout] = []

        for idx, slide_path in enumerate(slide_parts, 1):
            slide_root = load_xml(zf, slide_path)
            if slide_root is None:
                continue

            # Typography: extract text frames
            sp_tree = slide_root.find("p:cSld/p:spTree", NS)
            if sp_tree is not None:
                for sp in sp_tree.iter(f"{{{NS['p']}}}sp"):
                    frame = parse_text_frame(sp, idx, theme_fonts)
                    if frame:
                        all_text_frames.append(frame)

            # Colors: collect all color usages
            color_usages = collect_colors_from_slide(slide_root, idx, theme_colors)
            all_color_usages.extend(color_usages)

            # Layout: extract shape positions
            shapes = extract_shapes_from_slide(slide_root, idx)
            slide_layout = SlideLayout(slide_index=idx, shapes=shapes)
            all_slide_layouts.append(slide_layout)

        print(f"  Text frames extracted: {len(all_text_frames)}")
        print(f"  Color usages collected: {len(all_color_usages)}")
        print(f"  Slides analyzed for layout: {len(all_slide_layouts)}")

    # Run analyzers
    typography_profile = analyze_typography(all_text_frames)
    typography_profile.theme_fonts = theme_fonts

    color_profile = analyze_colors(all_color_usages, theme_colors)

    layout_profile = analyze_layout(all_slide_layouts, canvas_w, canvas_h)

    pattern_profile = analyze_patterns(all_slide_layouts)

    return {
        "typography": typography_profile,
        "colors": color_profile,
        "layout": layout_profile,
        "patterns": pattern_profile,
        "meta": {
            "source": pptx_path.name,
            "slide_count": len(slide_parts),
            "canvas_w": canvas_w,
            "canvas_h": canvas_h,
        },
    }


def merge_extractions(results: list[dict]) -> dict:
    """Merge style data from multiple PPTX files into a unified profile.

    Finds the common patterns across all presentations to identify
    the user's consistent personal style.
    """
    if len(results) == 1:
        return results[0]

    # For now, use the first result as base and note multi-file analysis
    # TODO: implement proper cross-file merging (font intersection, color union, etc.)
    merged = results[0]
    merged["meta"]["source"] = f"{len(results)} files merged"
    merged["meta"]["slide_count"] = sum(r["meta"]["slide_count"] for r in results)

    return merged


def run(input_path: Path, output_dir: Path) -> int:
    """Main execution flow."""
    # Collect PPTX files
    pptx_files: list[Path] = []
    if input_path.is_file():
        if input_path.suffix.lower() in (".pptx", ".pptm"):
            pptx_files.append(input_path)
        else:
            print(f"[ERROR] Not a PPTX file: {input_path}")
            return 1
    elif input_path.is_dir():
        pptx_files = sorted(input_path.glob("*.pptx"))
        pptx_files.extend(sorted(input_path.glob("*.pptm")))
        if not pptx_files:
            print(f"[ERROR] No PPTX files found in: {input_path}")
            return 1
    else:
        print(f"[ERROR] Path not found: {input_path}")
        return 1

    print(f"[INFO] Found {len(pptx_files)} PPTX file(s) to analyze")
    print()

    # Extract from each file
    results = []
    for pptx_file in pptx_files:
        result = extract_from_pptx(pptx_file)
        if result:
            results.append(result)

    if not results:
        print("[ERROR] No valid results extracted")
        return 1

    # Merge if multiple files
    merged = merge_extractions(results)

    # Generate outputs
    blueprint = generate_blueprint(
        typography=merged["typography"],
        colors=merged["colors"],
        layout=merged["layout"],
        patterns=merged["patterns"],
        source_name=merged["meta"]["source"],
        slide_count=merged["meta"]["slide_count"],
    )

    style_guide = generate_style_guide(blueprint, merged["meta"]["source"])

    # Write outputs
    blueprint_path, guide_path = write_outputs(output_dir, blueprint, style_guide)

    print()
    print(f"[OK] Style extraction complete!")
    print(f"  Blueprint: {blueprint_path}")
    print(f"  Style Guide: {guide_path}")
    print()
    print(f"  To use this style in future PPT generation:")
    print(f"    1. Copy style_guide.md to your project directory")
    print(f"    2. Reference it when starting generation")
    print(f"    3. The Strategist and Executor will follow it strictly")

    return 0


def main() -> None:
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Extract pixel-accurate style parameters from PPTX files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m style_extractor.extract presentation.pptx
  python -m style_extractor.extract presentation.pptx -o ./my_style/
  python -m style_extractor.extract ./my_pptx_folder/ -o ./extracted_style/

Output:
  style_blueprint.json  — Machine-readable precise parameters
  style_guide.md        — AI-readable strict specification
        """,
    )
    parser.add_argument("input", help="PPTX file or directory containing PPTX files")
    parser.add_argument(
        "-o", "--output",
        help="Output directory (default: <input_stem>_style/ beside the input)",
    )

    args = parser.parse_args()
    input_path = Path(args.input).resolve()

    if args.output:
        output_dir = Path(args.output).resolve()
    else:
        if input_path.is_file():
            output_dir = input_path.with_name(f"{input_path.stem}_style")
        else:
            output_dir = input_path / "extracted_style"

    sys.exit(run(input_path, output_dir))


if __name__ == "__main__":
    main()
