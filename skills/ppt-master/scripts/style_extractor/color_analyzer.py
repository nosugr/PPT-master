"""Color Analyzer — extract actual color usage from PPTX shapes.

Unlike theme-only extraction, this walks every shape on every slide and
collects ALL colors actually used (fills, strokes, text colors, gradients),
then clusters them into a palette with usage frequency and context.
"""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass, field
from xml.etree import ElementTree as ET

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pptx_to_svg.emu_units import NS


@dataclass
class ColorUsage:
    """A single color with its usage context."""
    hex_color: str
    context: str  # "text_fill", "shape_fill", "shape_stroke", "background", "gradient_stop"
    slide_index: int


@dataclass
class ColorCluster:
    """A group of similar colors clustered together."""
    representative: str  # The most common hex in this cluster
    variants: list[str] = field(default_factory=list)
    total_count: int = 0
    contexts: list[str] = field(default_factory=list)
    usage_percent: float = 0.0


@dataclass
class ColorProfile:
    """Complete color analysis result."""
    # Theme colors (from theme XML)
    theme_colors: dict[str, str] = field(default_factory=dict)
    # All colors actually used, with frequency
    all_colors: list[dict] = field(default_factory=list)  # [{hex, count, contexts}]
    # Clustered palette (primary, secondary, accent, etc.)
    palette: list[dict] = field(default_factory=list)
    # Background colors per slide
    slide_backgrounds: list[dict] = field(default_factory=list)  # [{slide, color}]
    # Color relationships
    text_on_background: list[dict] = field(default_factory=list)  # [{text_color, bg_color, count}]


def extract_theme_colors(theme_root: ET.Element | None) -> dict[str, str]:
    """Extract all theme color definitions."""
    colors: dict[str, str] = {}
    if theme_root is None:
        return colors

    clr_scheme = theme_root.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}clrScheme")
    if clr_scheme is None:
        return colors

    for child in list(clr_scheme):
        if not isinstance(child.tag, str):
            continue
        name = child.tag.split("}", 1)[-1]
        srgb = child.find("a:srgbClr", NS)
        sys_clr = child.find("a:sysClr", NS)
        if srgb is not None and "val" in srgb.attrib:
            colors[name] = f"#{srgb.attrib['val']}"
        elif sys_clr is not None:
            last = sys_clr.attrib.get("lastClr")
            if last:
                colors[name] = f"#{last}"

    return colors


def collect_colors_from_slide(
    slide_root: ET.Element | None,
    slide_index: int,
    theme_colors: dict[str, str],
) -> list[ColorUsage]:
    """Walk all shapes on a slide and collect color usages."""
    usages: list[ColorUsage] = []
    if slide_root is None:
        return usages

    # Background color
    bg = slide_root.find("p:cSld/p:bg", NS)
    if bg is not None:
        bg_color = _extract_fill_color(bg, theme_colors)
        if bg_color:
            usages.append(ColorUsage(bg_color, "background", slide_index))

    # Walk all shapes
    sp_tree = slide_root.find("p:cSld/p:spTree", NS)
    if sp_tree is None:
        return usages

    for shape in sp_tree.iter():
        if not isinstance(shape.tag, str):
            continue
        local = shape.tag.split("}", 1)[-1]

        # Shape fills
        if local == "spPr":
            fill_color = _extract_fill_color(shape, theme_colors)
            if fill_color:
                usages.append(ColorUsage(fill_color, "shape_fill", slide_index))

            # Stroke color
            ln = shape.find("a:ln", NS)
            if ln is not None:
                stroke_color = _extract_fill_color(ln, theme_colors)
                if stroke_color:
                    usages.append(ColorUsage(stroke_color, "shape_stroke", slide_index))

            # Gradient stops
            grad = shape.find("a:gradFill", NS)
            if grad is not None:
                for stop in grad.findall("a:gsLst/a:gs", NS):
                    stop_color = _extract_color_from_element(stop, theme_colors)
                    if stop_color:
                        usages.append(ColorUsage(stop_color, "gradient_stop", slide_index))

        # Text colors
        if local == "rPr":
            solid = shape.find("a:solidFill", NS)
            if solid is not None:
                text_color = _extract_color_from_element(solid, theme_colors)
                if text_color:
                    usages.append(ColorUsage(text_color, "text_fill", slide_index))

    return usages


def _extract_fill_color(elem: ET.Element, theme_colors: dict[str, str]) -> str | None:
    """Extract the primary fill color from an element."""
    # Solid fill
    solid = elem.find("a:solidFill", NS)
    if solid is not None:
        return _extract_color_from_element(solid, theme_colors)

    # Gradient — use first stop
    grad = elem.find("a:gradFill", NS)
    if grad is not None:
        first_stop = grad.find("a:gsLst/a:gs", NS)
        if first_stop is not None:
            return _extract_color_from_element(first_stop, theme_colors)

    return None


def _extract_color_from_element(elem: ET.Element, theme_colors: dict[str, str]) -> str | None:
    """Extract color value from a fill/color element."""
    srgb = elem.find("a:srgbClr", NS)
    if srgb is not None:
        val = srgb.attrib.get("val")
        if val:
            return f"#{val}"

    scheme = elem.find("a:schemeClr", NS)
    if scheme is not None:
        scheme_name = scheme.attrib.get("val", "")
        # Resolve scheme color to actual hex
        resolved = theme_colors.get(scheme_name)
        if resolved:
            return resolved
        # Common mappings
        scheme_map = {
            "tx1": "dk1", "tx2": "dk2",
            "bg1": "lt1", "bg2": "lt2",
        }
        mapped = scheme_map.get(scheme_name)
        if mapped and mapped in theme_colors:
            return theme_colors[mapped]

    return None


def _hex_distance(c1: str, c2: str) -> float:
    """Calculate color distance between two hex colors."""
    try:
        r1, g1, b1 = int(c1[1:3], 16), int(c1[3:5], 16), int(c1[5:7], 16)
        r2, g2, b2 = int(c2[1:3], 16), int(c2[3:5], 16), int(c2[5:7], 16)
        return ((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) ** 0.5
    except (ValueError, IndexError):
        return 999.0


def cluster_colors(usages: list[ColorUsage], threshold: float = 30.0) -> list[ColorCluster]:
    """Cluster similar colors together."""
    # Count raw colors
    color_counter: Counter = Counter()
    color_contexts: defaultdict[str, set] = defaultdict(set)

    for usage in usages:
        hex_c = usage.hex_color.upper()
        if len(hex_c) != 7 or not hex_c.startswith("#"):
            continue
        color_counter[hex_c] += 1
        color_contexts[hex_c].add(usage.context)

    # Sort by frequency
    sorted_colors = color_counter.most_common()

    # Greedy clustering
    clusters: list[ColorCluster] = []
    assigned: set[str] = set()

    for color, count in sorted_colors:
        if color in assigned:
            continue

        cluster = ColorCluster(
            representative=color,
            variants=[color],
            total_count=count,
            contexts=list(color_contexts[color]),
        )
        assigned.add(color)

        # Find similar colors
        for other_color, other_count in sorted_colors:
            if other_color in assigned:
                continue
            if _hex_distance(color, other_color) < threshold:
                cluster.variants.append(other_color)
                cluster.total_count += other_count
                cluster.contexts.extend(color_contexts[other_color])
                assigned.add(other_color)

        cluster.contexts = list(set(cluster.contexts))
        clusters.append(cluster)

    # Calculate usage percentages
    total = sum(c.total_count for c in clusters)
    if total > 0:
        for cluster in clusters:
            cluster.usage_percent = round(cluster.total_count / total * 100, 1)

    return clusters


def analyze_colors(
    color_usages: list[ColorUsage],
    theme_colors: dict[str, str],
) -> ColorProfile:
    """Produce a complete color analysis."""
    profile = ColorProfile(theme_colors=theme_colors)

    # All colors with frequency
    counter: Counter = Counter()
    contexts_map: defaultdict[str, set] = defaultdict(set)
    for usage in color_usages:
        hex_c = usage.hex_color.upper()
        if len(hex_c) == 7 and hex_c.startswith("#"):
            counter[hex_c] += 1
            contexts_map[hex_c].add(usage.context)

    profile.all_colors = [
        {"hex": color, "count": count, "contexts": sorted(contexts_map[color])}
        for color, count in counter.most_common(30)
    ]

    # Clustered palette
    clusters = cluster_colors(color_usages)
    profile.palette = [
        {
            "hex": c.representative,
            "variants": c.variants,
            "count": c.total_count,
            "usage_percent": c.usage_percent,
            "contexts": c.contexts,
        }
        for c in clusters[:12]  # Top 12 color clusters
    ]

    # Slide backgrounds
    bg_usages = [u for u in color_usages if u.context == "background"]
    slide_bgs: dict[int, str] = {}
    for u in bg_usages:
        slide_bgs[u.slide_index] = u.hex_color
    profile.slide_backgrounds = [
        {"slide": idx, "color": color}
        for idx, color in sorted(slide_bgs.items())
    ]

    return profile
