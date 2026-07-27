"""Output Formatter — generate style_blueprint.json and style_guide.md.

Takes the analysis results from all analyzers and produces:
1. style_blueprint.json — machine-readable, pixel-precise style parameters
2. style_guide.md — AI-readable strict specification for generation
"""

from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

from .typography_analyzer import TypographyProfile
from .color_analyzer import ColorProfile
from .layout_analyzer import LayoutProfile
from .pattern_detector import PatternProfile


def generate_blueprint(
    typography: TypographyProfile,
    colors: ColorProfile,
    layout: LayoutProfile,
    patterns: PatternProfile,
    source_name: str = "",
    slide_count: int = 0,
) -> dict:
    """Generate the style_blueprint.json structure."""
    blueprint = {
        "meta": {
            "source": source_name,
            "slide_count": slide_count,
            "canvas": {
                "width_px": layout.canvas_width_px,
                "height_px": layout.canvas_height_px,
                "viewBox": f"0 0 {int(layout.canvas_width_px)} {int(layout.canvas_height_px)}",
            },
        },
        "typography": {
            "theme_fonts": typography.theme_fonts,
            "font_families": typography.font_families,
            "font_sizes": typography.font_sizes,
            "hierarchy": typography.hierarchy,
        },
        "colors": {
            "theme_colors": colors.theme_colors,
            "palette": colors.palette,
            "all_colors": colors.all_colors[:20],
            "slide_backgrounds": colors.slide_backgrounds,
        },
        "layout": {
            "margins": layout.margins,
            "patterns": [
                {
                    "name": p.name,
                    "frequency": p.frequency,
                    "slide_indices": p.slide_indices,
                    "regions": p.regions,
                    "description": p.description,
                }
                for p in layout.patterns
            ],
        },
        "structure": {
            "recurring_elements": [
                {
                    "description": e.description,
                    "shape_type": e.shape_type,
                    "position": {"x": e.x_px, "y": e.y_px, "w": e.w_px, "h": e.h_px},
                    "frequency_percent": e.frequency_percent,
                }
                for e in patterns.recurring_elements[:10]
            ],
            "headers": [
                {
                    "height_px": h.height_px,
                    "y_range": [h.y_start_px, h.y_end_px],
                    "frequency_percent": h.frequency_percent,
                }
                for h in patterns.headers
            ],
            "footers": [
                {
                    "height_px": f.height_px,
                    "y_range": [f.y_start_px, f.y_end_px],
                    "frequency_percent": f.frequency_percent,
                }
                for f in patterns.footers
            ],
            "spacing": [
                {
                    "name": s.name,
                    "value_px": s.value_px,
                    "context": s.context,
                    "frequency": s.frequency,
                }
                for s in patterns.spacing_patterns
            ],
            "title_position": patterns.title_position,
            "density": {
                "avg_shapes_per_slide": patterns.avg_shapes_per_slide,
                "avg_text_shapes_per_slide": patterns.avg_text_shapes_per_slide,
            },
        },
    }

    return blueprint


def generate_style_guide(
    blueprint: dict,
    source_name: str = "",
) -> str:
    """Generate a strict AI-readable style guide from the blueprint."""
    lines: list[str] = []

    meta = blueprint["meta"]
    typo = blueprint["typography"]
    colors = blueprint["colors"]
    layout = blueprint["layout"]
    structure = blueprint["structure"]

    # Header
    lines.append(f"# Style Guide — {source_name}")
    lines.append("")
    lines.append("> **STRICT SPECIFICATION**: When generating slides, you MUST follow these exact")
    lines.append("> parameters. Do NOT deviate from the specified fonts, sizes, colors, or positions.")
    lines.append("> This guide was extracted from actual slide measurements, not approximated.")
    lines.append("")

    # Canvas
    lines.append("## Canvas")
    lines.append("")
    lines.append(f"- **Dimensions**: {int(meta['canvas']['width_px'])} × {int(meta['canvas']['height_px'])} px")
    lines.append(f"- **viewBox**: `{meta['canvas']['viewBox']}`")
    lines.append("")

    # Margins
    margins = layout.get("margins", {})
    if margins:
        lines.append("## Margins (Content Safe Area)")
        lines.append("")
        lines.append(f"- Left: **{margins.get('left_px', 0)}px**")
        lines.append(f"- Right: **{margins.get('right_px', 0)}px**")
        lines.append(f"- Top: **{margins.get('top_px', 0)}px**")
        lines.append(f"- Bottom: **{margins.get('bottom_px', 0)}px**")
        lines.append("")

    # Typography
    lines.append("## Typography")
    lines.append("")

    # Theme fonts
    theme_fonts = typo.get("theme_fonts", {})
    if theme_fonts:
        lines.append("### Font Stack")
        lines.append("")
        for key, font in theme_fonts.items():
            lines.append(f"- {key}: **{font}**")
        lines.append("")

    # Hierarchy
    hierarchy = typo.get("hierarchy", [])
    if hierarchy:
        lines.append("### Size Hierarchy (MUST follow exactly)")
        lines.append("")
        lines.append("| Role | Font | Size (pt) | Weight | Color |")
        lines.append("|------|------|-----------|--------|-------|")
        for level in hierarchy:
            font = level.get("font_family", "—")
            size = level.get("font_size_pt", "—")
            weight = "Bold" if level.get("bold") else "Regular"
            color = level.get("color", "—")
            role = level.get("role", "—")
            lines.append(f"| {role} | {font} | {size} | {weight} | `{color}` |")
        lines.append("")

    # Colors
    lines.append("## Color Palette")
    lines.append("")

    # Theme colors
    theme_colors = colors.get("theme_colors", {})
    if theme_colors:
        lines.append("### Theme Colors")
        lines.append("")
        for name, hex_val in theme_colors.items():
            lines.append(f"- {name}: `{hex_val}`")
        lines.append("")

    # Actual palette
    palette = colors.get("palette", [])
    if palette:
        lines.append("### Actual Usage Palette (by frequency)")
        lines.append("")
        lines.append("| Color | Usage % | Contexts |")
        lines.append("|-------|---------|----------|")
        for entry in palette[:10]:
            hex_val = entry.get("hex", "—")
            pct = entry.get("usage_percent", 0)
            contexts = ", ".join(entry.get("contexts", []))
            lines.append(f"| `{hex_val}` | {pct}% | {contexts} |")
        lines.append("")

    # Layout patterns
    patterns = layout.get("patterns", [])
    if patterns:
        lines.append("## Layout Patterns")
        lines.append("")
        for pattern in patterns:
            name = pattern.get("name", "unknown")
            freq = pattern.get("frequency", 0)
            desc = pattern.get("description", "")
            lines.append(f"### Pattern: {name} (used {freq} times)")
            lines.append(f"_{desc}_")
            lines.append("")

            regions = pattern.get("regions", [])
            if regions:
                lines.append("| Region | X | Y | Width | Height |")
                lines.append("|--------|---|---|-------|--------|")
                for region in regions:
                    role = region.get("role", "—")
                    x = region.get("x_px", 0)
                    y = region.get("y_px", 0)
                    w = region.get("w_px", 0)
                    h = region.get("h_px", 0)
                    lines.append(f"| {role} | {x} | {y} | {w} | {h} |")
                lines.append("")

    # Structure
    lines.append("## Structural Elements")
    lines.append("")

    # Headers/footers
    headers = structure.get("headers", [])
    footers = structure.get("footers", [])
    if headers:
        for h in headers:
            lines.append(f"### Header (appears on {h['frequency_percent']}% of slides)")
            lines.append(f"- Height: **{h['height_px']}px**")
            lines.append(f"- Y range: {h['y_range'][0]} → {h['y_range'][1]}")
            lines.append("")
    if footers:
        for f in footers:
            lines.append(f"### Footer (appears on {f['frequency_percent']}% of slides)")
            lines.append(f"- Height: **{f['height_px']}px**")
            lines.append(f"- Y range: {f['y_range'][0]} → {f['y_range'][1]}")
            lines.append("")

    # Title position
    title_pos = structure.get("title_position", {})
    if title_pos:
        lines.append("### Title Position (MUST be consistent)")
        lines.append("")
        lines.append(f"- X: **{title_pos.get('x_px', 0)}px**")
        lines.append(f"- Y: **{title_pos.get('y_px', 0)}px**")
        lines.append(f"- Width: **{title_pos.get('w_px', 0)}px**")
        lines.append(f"- Height: **{title_pos.get('h_px', 0)}px**")
        lines.append(f"- Consistency score: {title_pos.get('consistency_score', 0)}")
        lines.append("")

    # Spacing
    spacing = structure.get("spacing", [])
    if spacing:
        lines.append("### Spacing Rules")
        lines.append("")
        for s in spacing:
            lines.append(f"- **{s['name']}**: {s['value_px']}px ({s['context']})")
        lines.append("")

    # Density
    density = structure.get("density", {})
    if density:
        lines.append("### Content Density")
        lines.append("")
        lines.append(f"- Average shapes per slide: **{density.get('avg_shapes_per_slide', 0)}**")
        lines.append(f"- Average text elements per slide: **{density.get('avg_text_shapes_per_slide', 0)}**")
        lines.append("")

    # Recurring elements
    recurring = structure.get("recurring_elements", [])
    if recurring:
        lines.append("### Recurring Decorative Elements")
        lines.append("")
        lines.append("These elements appear consistently and SHOULD be reproduced:")
        lines.append("")
        for elem in recurring[:6]:
            desc = elem.get("description", "")
            pos = elem.get("position", {})
            freq = elem.get("frequency_percent", 0)
            lines.append(
                f"- {desc} — position ({pos.get('x', 0)}, {pos.get('y', 0)}, "
                f"{pos.get('w', 0)}×{pos.get('h', 0)}) — {freq}% of slides"
            )
        lines.append("")

    return "\n".join(lines)


def write_outputs(
    output_dir: Path,
    blueprint: dict,
    style_guide: str,
) -> tuple[Path, Path]:
    """Write both output files to the specified directory."""
    output_dir.mkdir(parents=True, exist_ok=True)

    blueprint_path = output_dir / "style_blueprint.json"
    blueprint_path.write_text(
        json.dumps(blueprint, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    guide_path = output_dir / "style_guide.md"
    guide_path.write_text(style_guide, encoding="utf-8")

    return blueprint_path, guide_path
