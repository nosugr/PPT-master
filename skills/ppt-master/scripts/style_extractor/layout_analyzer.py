"""Layout Analyzer — extract precise element positioning and detect layout patterns.

For each slide, records the exact bounding box of every shape (text frames,
images, rectangles, groups). Then clusters slides by their spatial arrangement
to identify recurring layout patterns (e.g. "title-top + content-below",
"two-column", "full-bleed image + overlay text").
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from xml.etree import ElementTree as ET

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pptx_to_svg.emu_units import NS, emu_to_px


@dataclass
class ShapeRecord:
    """A single shape's position and type on a slide."""
    slide_index: int
    shape_type: str  # "text", "image", "rect", "group", "chart", "table", "other"
    name: str = ""
    x_px: float = 0.0
    y_px: float = 0.0
    w_px: float = 0.0
    h_px: float = 0.0
    rotation_deg: float = 0.0
    # For text shapes
    has_text: bool = False
    text_preview: str = ""
    # For images
    image_ref: str = ""
    # Placeholder info
    placeholder_type: str = ""  # "title", "body", "dt", "ftr", "sldNum", etc.
    placeholder_idx: str = ""


@dataclass
class SlideLayout:
    """All shapes on a single slide, representing its layout."""
    slide_index: int
    shapes: list[ShapeRecord] = field(default_factory=list)
    # Derived
    shape_count: int = 0
    has_title: bool = False
    has_body: bool = False
    has_image: bool = False
    layout_type: str = ""  # classified type


@dataclass
class LayoutPattern:
    """A recurring layout pattern detected across multiple slides."""
    name: str
    frequency: int
    slide_indices: list[int] = field(default_factory=list)
    # Canonical regions (averaged positions)
    regions: list[dict] = field(default_factory=list)  # [{role, x, y, w, h}]
    # Description
    description: str = ""


@dataclass
class LayoutProfile:
    """Complete layout analysis result."""
    # Canvas size
    canvas_width_px: float = 1280.0
    canvas_height_px: float = 720.0
    # Per-slide layouts
    slide_layouts: list[SlideLayout] = field(default_factory=list)
    # Detected patterns
    patterns: list[LayoutPattern] = field(default_factory=list)
    # Margin analysis
    margins: dict = field(default_factory=dict)  # {left, right, top, bottom}


def extract_shapes_from_slide(
    slide_root: ET.Element | None,
    slide_index: int,
) -> list[ShapeRecord]:
    """Extract all shape positions from a slide."""
    shapes: list[ShapeRecord] = []
    if slide_root is None:
        return shapes

    sp_tree = slide_root.find("p:cSld/p:spTree", NS)
    if sp_tree is None:
        return shapes

    _walk_shapes(sp_tree, slide_index, shapes)
    return shapes


def _walk_shapes(
    container: ET.Element,
    slide_index: int,
    shapes: list[ShapeRecord],
) -> None:
    """Recursively walk shape tree."""
    for child in list(container):
        if not isinstance(child.tag, str):
            continue
        local = child.tag.split("}", 1)[-1]

        if local == "sp":
            record = _parse_shape(child, slide_index, "text")
            if record:
                shapes.append(record)
        elif local == "pic":
            record = _parse_shape(child, slide_index, "image")
            if record:
                # Get image reference
                blip_fill = child.find("p:blipFill/a:blip", NS)
                if blip_fill is not None:
                    record.image_ref = blip_fill.attrib.get(
                        f"{{{NS['r']}}}embed", ""
                    )
                shapes.append(record)
        elif local == "graphicFrame":
            record = _parse_graphic_frame(child, slide_index)
            if record:
                shapes.append(record)
        elif local == "grpSp":
            # Group shape — extract group bounds and recurse
            grp_record = _parse_group(child, slide_index)
            if grp_record:
                shapes.append(grp_record)
        elif local == "cxnSp":
            # Connector shape
            record = _parse_shape(child, slide_index, "connector")
            if record:
                shapes.append(record)


def _parse_shape(
    sp: ET.Element,
    slide_index: int,
    default_type: str,
) -> ShapeRecord | None:
    """Parse a <p:sp> element into a ShapeRecord."""
    # Get transform
    sp_pr = sp.find("p:spPr", NS)
    if sp_pr is None:
        return None

    xfrm = sp_pr.find("a:xfrm", NS)
    if xfrm is None:
        return None

    off = xfrm.find("a:off", NS)
    ext = xfrm.find("a:ext", NS)
    if off is None or ext is None:
        return None

    try:
        x = emu_to_px(int(off.attrib.get("x", "0")))
        y = emu_to_px(int(off.attrib.get("y", "0")))
        w = emu_to_px(int(ext.attrib.get("cx", "0")))
        h = emu_to_px(int(ext.attrib.get("cy", "0")))
    except ValueError:
        return None

    # Skip zero-size shapes
    if w < 1 and h < 1:
        return None

    rotation = 0.0
    rot_attr = xfrm.attrib.get("rot")
    if rot_attr:
        try:
            rotation = int(rot_attr) / 60000.0  # 60000 units per degree
        except ValueError:
            pass

    # Get name
    nv_sp_pr = sp.find("p:nvSpPr", NS)
    name = ""
    placeholder_type = ""
    placeholder_idx = ""
    if nv_sp_pr is not None:
        c_nv_pr = nv_sp_pr.find("p:cNvPr", NS)
        if c_nv_pr is not None:
            name = c_nv_pr.attrib.get("name", "")
        # Check placeholder
        nv_pr = nv_sp_pr.find("p:nvPr", NS)
        if nv_pr is not None:
            ph = nv_pr.find("p:ph", NS)
            if ph is not None:
                placeholder_type = ph.attrib.get("type", "body")
                placeholder_idx = ph.attrib.get("idx", "")

    # Check for text
    has_text = False
    text_preview = ""
    tx_body = sp.find("p:txBody", NS)
    if tx_body is not None:
        texts = []
        for t_elem in tx_body.iter(f"{{{NS['a']}}}t"):
            if t_elem.text:
                texts.append(t_elem.text)
        full = "".join(texts).strip()
        if full:
            has_text = True
            text_preview = full[:80]

    # Determine shape type
    shape_type = default_type
    if not has_text and default_type == "text":
        # Check if it's a filled rectangle (decorative)
        solid_fill = sp_pr.find("a:solidFill", NS)
        grad_fill = sp_pr.find("a:gradFill", NS)
        if solid_fill is not None or grad_fill is not None:
            shape_type = "rect"
        else:
            shape_type = "other"

    return ShapeRecord(
        slide_index=slide_index,
        shape_type=shape_type,
        name=name,
        x_px=x, y_px=y, w_px=w, h_px=h,
        rotation_deg=rotation,
        has_text=has_text,
        text_preview=text_preview,
        placeholder_type=placeholder_type,
        placeholder_idx=placeholder_idx,
    )


def _parse_graphic_frame(
    gf: ET.Element,
    slide_index: int,
) -> ShapeRecord | None:
    """Parse a graphicFrame (table or chart)."""
    xfrm = gf.find("p:xfrm", NS)
    if xfrm is None:
        return None

    off = xfrm.find("a:off", NS)
    ext = xfrm.find("a:ext", NS)
    if off is None or ext is None:
        return None

    try:
        x = emu_to_px(int(off.attrib.get("x", "0")))
        y = emu_to_px(int(off.attrib.get("y", "0")))
        w = emu_to_px(int(ext.attrib.get("cx", "0")))
        h = emu_to_px(int(ext.attrib.get("cy", "0")))
    except ValueError:
        return None

    # Determine if table or chart
    shape_type = "other"
    graphic = gf.find("a:graphic/a:graphicData", NS)
    if graphic is not None:
        uri = graphic.attrib.get("uri", "")
        if "table" in uri:
            shape_type = "table"
        elif "chart" in uri:
            shape_type = "chart"

    name = ""
    nv_gf_pr = gf.find("p:nvGraphicFramePr", NS)
    if nv_gf_pr is not None:
        c_nv_pr = nv_gf_pr.find("p:cNvPr", NS)
        if c_nv_pr is not None:
            name = c_nv_pr.attrib.get("name", "")

    return ShapeRecord(
        slide_index=slide_index,
        shape_type=shape_type,
        name=name,
        x_px=x, y_px=y, w_px=w, h_px=h,
    )


def _parse_group(
    grp: ET.Element,
    slide_index: int,
) -> ShapeRecord | None:
    """Parse a group shape — record its bounds."""
    grp_sp_pr = grp.find("p:grpSpPr", NS)
    if grp_sp_pr is None:
        return None

    xfrm = grp_sp_pr.find("a:xfrm", NS)
    if xfrm is None:
        return None

    off = xfrm.find("a:off", NS)
    ext = xfrm.find("a:ext", NS)
    if off is None or ext is None:
        return None

    try:
        x = emu_to_px(int(off.attrib.get("x", "0")))
        y = emu_to_px(int(off.attrib.get("y", "0")))
        w = emu_to_px(int(ext.attrib.get("cx", "0")))
        h = emu_to_px(int(ext.attrib.get("cy", "0")))
    except ValueError:
        return None

    return ShapeRecord(
        slide_index=slide_index,
        shape_type="group",
        x_px=x, y_px=y, w_px=w, h_px=h,
    )


def classify_slide_layout(layout: SlideLayout) -> str:
    """Classify a slide's layout type based on shape arrangement."""
    shapes = layout.shapes
    if not shapes:
        return "blank"

    text_shapes = [s for s in shapes if s.has_text]
    image_shapes = [s for s in shapes if s.shape_type == "image"]
    title_shapes = [s for s in shapes if s.placeholder_type in ("title", "ctrTitle")]

    # Cover detection
    if title_shapes and any(s.placeholder_type == "ctrTitle" for s in shapes):
        return "cover"

    # Full-bleed image
    canvas_area = 1280 * 720
    for img in image_shapes:
        if img.w_px * img.h_px > canvas_area * 0.8:
            return "full_image"

    # Two-column detection
    if len(text_shapes) >= 2:
        left_shapes = [s for s in text_shapes if s.x_px + s.w_px / 2 < 640]
        right_shapes = [s for s in text_shapes if s.x_px + s.w_px / 2 >= 640]
        if left_shapes and right_shapes:
            left_area = sum(s.w_px * s.h_px for s in left_shapes)
            right_area = sum(s.w_px * s.h_px for s in right_shapes)
            if 0.3 < left_area / max(right_area, 1) < 3.0:
                return "two_column"

    # Image + text
    if image_shapes and text_shapes:
        return "image_text"

    # Title + content
    if title_shapes and len(text_shapes) > 1:
        return "title_content"

    # Mostly text
    if text_shapes and not image_shapes:
        return "text_only"

    return "mixed"


def detect_patterns(slide_layouts: list[SlideLayout]) -> list[LayoutPattern]:
    """Detect recurring layout patterns across slides."""
    # Group slides by layout type
    type_groups: defaultdict[str, list[SlideLayout]] = defaultdict(list)
    for layout in slide_layouts:
        type_groups[layout.layout_type].append(layout)

    patterns: list[LayoutPattern] = []

    for layout_type, layouts in type_groups.items():
        if len(layouts) < 2:
            continue  # Need at least 2 slides to form a pattern

        # Compute average positions for key regions
        regions = _compute_average_regions(layouts)

        pattern = LayoutPattern(
            name=layout_type,
            frequency=len(layouts),
            slide_indices=[l.slide_index for l in layouts],
            regions=regions,
            description=_describe_pattern(layout_type, regions),
        )
        patterns.append(pattern)

    patterns.sort(key=lambda p: -p.frequency)
    return patterns


def _compute_average_regions(layouts: list[SlideLayout]) -> list[dict]:
    """Compute average bounding boxes for each role across similar slides."""
    role_positions: defaultdict[str, list[dict]] = defaultdict(list)

    for layout in layouts:
        for shape in layout.shapes:
            if not shape.has_text and shape.shape_type not in ("image", "table", "chart"):
                continue
            role = _determine_role(shape)
            role_positions[role].append({
                "x": shape.x_px,
                "y": shape.y_px,
                "w": shape.w_px,
                "h": shape.h_px,
            })

    regions = []
    for role, positions in role_positions.items():
        if len(positions) < 2:
            continue
        avg_x = sum(p["x"] for p in positions) / len(positions)
        avg_y = sum(p["y"] for p in positions) / len(positions)
        avg_w = sum(p["w"] for p in positions) / len(positions)
        avg_h = sum(p["h"] for p in positions) / len(positions)

        regions.append({
            "role": role,
            "x_px": round(avg_x, 1),
            "y_px": round(avg_y, 1),
            "w_px": round(avg_w, 1),
            "h_px": round(avg_h, 1),
            "sample_count": len(positions),
        })

    return regions


def _determine_role(shape: ShapeRecord) -> str:
    """Determine the semantic role of a shape."""
    if shape.placeholder_type:
        return shape.placeholder_type
    if shape.shape_type == "image":
        return "image"
    if shape.shape_type == "table":
        return "table"
    if shape.shape_type == "chart":
        return "chart"
    # Guess from position and size
    if shape.y_px < 100 and shape.w_px > 600:
        return "title_area"
    if shape.y_px > 600:
        return "footer_area"
    return "content"


def _describe_pattern(layout_type: str, regions: list[dict]) -> str:
    """Generate a human-readable description of a layout pattern."""
    descriptions = {
        "cover": "Cover page with centered title",
        "title_content": "Title at top with content area below",
        "two_column": "Two-column layout with balanced content",
        "image_text": "Image and text combination",
        "full_image": "Full-bleed background image",
        "text_only": "Text-only content layout",
        "mixed": "Mixed content with various elements",
    }
    base = descriptions.get(layout_type, f"Layout type: {layout_type}")

    if regions:
        region_names = [r["role"] for r in regions[:4]]
        base += f" (regions: {', '.join(region_names)})"

    return base


def analyze_margins(slide_layouts: list[SlideLayout]) -> dict:
    """Analyze consistent margins across all slides."""
    left_margins = []
    right_margins = []
    top_margins = []
    bottom_margins = []

    canvas_w = 1280.0
    canvas_h = 720.0

    for layout in slide_layouts:
        content_shapes = [
            s for s in layout.shapes
            if s.has_text or s.shape_type in ("image", "table", "chart")
        ]
        if not content_shapes:
            continue

        min_x = min(s.x_px for s in content_shapes)
        min_y = min(s.y_px for s in content_shapes)
        max_right = max(s.x_px + s.w_px for s in content_shapes)
        max_bottom = max(s.y_px + s.h_px for s in content_shapes)

        left_margins.append(min_x)
        top_margins.append(min_y)
        right_margins.append(canvas_w - max_right)
        bottom_margins.append(canvas_h - max_bottom)

    def _median(values: list[float]) -> float:
        if not values:
            return 0.0
        sorted_v = sorted(values)
        n = len(sorted_v)
        if n % 2 == 0:
            return (sorted_v[n // 2 - 1] + sorted_v[n // 2]) / 2.0
        return sorted_v[n // 2]

    return {
        "left_px": round(_median(left_margins), 1),
        "right_px": round(_median(right_margins), 1),
        "top_px": round(_median(top_margins), 1),
        "bottom_px": round(_median(bottom_margins), 1),
    }


def analyze_layout(
    slide_layouts: list[SlideLayout],
    canvas_width: float = 1280.0,
    canvas_height: float = 720.0,
) -> LayoutProfile:
    """Produce a complete layout analysis."""
    # Classify each slide
    for layout in slide_layouts:
        layout.shape_count = len(layout.shapes)
        layout.has_title = any(
            s.placeholder_type in ("title", "ctrTitle") for s in layout.shapes
        )
        layout.has_body = any(
            s.placeholder_type == "body" for s in layout.shapes
        )
        layout.has_image = any(
            s.shape_type == "image" for s in layout.shapes
        )
        layout.layout_type = classify_slide_layout(layout)

    patterns = detect_patterns(slide_layouts)
    margins = analyze_margins(slide_layouts)

    return LayoutProfile(
        canvas_width_px=canvas_width,
        canvas_height_px=canvas_height,
        slide_layouts=slide_layouts,
        patterns=patterns,
        margins=margins,
    )
