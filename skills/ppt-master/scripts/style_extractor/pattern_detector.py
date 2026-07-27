"""Pattern Detector — identify recurring visual patterns across slides.

Goes beyond single-slide layout classification to detect:
- Consistent header/footer structures
- Recurring decorative elements (bars, lines, shapes)
- Spacing rhythms (consistent gaps between elements)
- Title positioning consistency
- Content density patterns
"""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass, field

from .layout_analyzer import ShapeRecord, SlideLayout


@dataclass
class RecurringElement:
    """A decorative or structural element that appears on multiple slides."""
    description: str
    shape_type: str
    # Average position
    x_px: float = 0.0
    y_px: float = 0.0
    w_px: float = 0.0
    h_px: float = 0.0
    # Frequency
    slide_count: int = 0
    total_slides: int = 0
    frequency_percent: float = 0.0
    # Visual properties
    color: str = ""


@dataclass
class SpacingPattern:
    """Detected spacing rhythm."""
    name: str
    value_px: float
    context: str  # "between_title_and_content", "between_items", "margin", etc.
    frequency: int = 0


@dataclass
class HeaderFooterPattern:
    """Detected header or footer structure."""
    type: str  # "header" or "footer"
    y_start_px: float = 0.0
    y_end_px: float = 0.0
    height_px: float = 0.0
    elements: list[dict] = field(default_factory=list)  # [{type, x, w, description}]
    slide_count: int = 0
    frequency_percent: float = 0.0


@dataclass
class PatternProfile:
    """Complete pattern detection result."""
    # Recurring structural elements
    recurring_elements: list[RecurringElement] = field(default_factory=list)
    # Header/footer patterns
    headers: list[HeaderFooterPattern] = field(default_factory=list)
    footers: list[HeaderFooterPattern] = field(default_factory=list)
    # Spacing patterns
    spacing_patterns: list[SpacingPattern] = field(default_factory=list)
    # Content density
    avg_shapes_per_slide: float = 0.0
    avg_text_shapes_per_slide: float = 0.0
    # Title consistency
    title_position: dict = field(default_factory=dict)  # {x, y, w, h, consistency_score}


def detect_recurring_elements(
    slide_layouts: list[SlideLayout],
    min_frequency: float = 0.5,
) -> list[RecurringElement]:
    """Find shapes that appear in similar positions across many slides."""
    total_slides = len(slide_layouts)
    if total_slides < 2:
        return []

    # Bucket shapes by approximate position (grid-based)
    GRID_SIZE = 50  # px
    position_buckets: defaultdict[tuple, list[ShapeRecord]] = defaultdict(list)

    for layout in slide_layouts:
        for shape in layout.shapes:
            # Skip large content shapes (they vary per slide)
            if shape.has_text and shape.w_px > 800 and shape.h_px > 300:
                continue
            # Bucket by grid position and approximate size
            bucket_x = int(shape.x_px / GRID_SIZE)
            bucket_y = int(shape.y_px / GRID_SIZE)
            bucket_w = int(shape.w_px / GRID_SIZE)
            bucket_h = int(shape.h_px / GRID_SIZE)
            key = (bucket_x, bucket_y, bucket_w, bucket_h, shape.shape_type)
            position_buckets[key].append(shape)

    recurring: list[RecurringElement] = []
    for key, shapes in position_buckets.items():
        # Count unique slides
        unique_slides = len(set(s.slide_index for s in shapes))
        freq = unique_slides / total_slides

        if freq >= min_frequency and unique_slides >= 2:
            avg_x = sum(s.x_px for s in shapes) / len(shapes)
            avg_y = sum(s.y_px for s in shapes) / len(shapes)
            avg_w = sum(s.w_px for s in shapes) / len(shapes)
            avg_h = sum(s.h_px for s in shapes) / len(shapes)

            desc = _describe_element(shapes[0], avg_x, avg_y, avg_w, avg_h)

            recurring.append(RecurringElement(
                description=desc,
                shape_type=shapes[0].shape_type,
                x_px=round(avg_x, 1),
                y_px=round(avg_y, 1),
                w_px=round(avg_w, 1),
                h_px=round(avg_h, 1),
                slide_count=unique_slides,
                total_slides=total_slides,
                frequency_percent=round(freq * 100, 1),
            ))

    recurring.sort(key=lambda e: -e.frequency_percent)
    return recurring


def detect_header_footer(
    slide_layouts: list[SlideLayout],
    canvas_height: float = 720.0,
) -> tuple[list[HeaderFooterPattern], list[HeaderFooterPattern]]:
    """Detect consistent header and footer regions."""
    total_slides = len(slide_layouts)
    if total_slides < 2:
        return [], []

    HEADER_ZONE = canvas_height * 0.15  # Top 15%
    FOOTER_ZONE = canvas_height * 0.85  # Bottom 15%

    # Collect shapes in header/footer zones
    header_shapes: defaultdict[int, list[ShapeRecord]] = defaultdict(list)
    footer_shapes: defaultdict[int, list[ShapeRecord]] = defaultdict(list)

    for layout in slide_layouts:
        for shape in layout.shapes:
            if shape.y_px + shape.h_px <= HEADER_ZONE:
                header_shapes[layout.slide_index].append(shape)
            elif shape.y_px >= FOOTER_ZONE:
                footer_shapes[layout.slide_index].append(shape)

    headers = []
    footers = []

    # Analyze header consistency
    if len(header_shapes) >= total_slides * 0.5:
        all_header_shapes = [s for shapes in header_shapes.values() for s in shapes]
        if all_header_shapes:
            max_h = max(s.y_px + s.h_px for s in all_header_shapes)
            headers.append(HeaderFooterPattern(
                type="header",
                y_start_px=0,
                y_end_px=round(max_h, 1),
                height_px=round(max_h, 1),
                slide_count=len(header_shapes),
                frequency_percent=round(len(header_shapes) / total_slides * 100, 1),
            ))

    # Analyze footer consistency
    if len(footer_shapes) >= total_slides * 0.5:
        all_footer_shapes = [s for shapes in footer_shapes.values() for s in shapes]
        if all_footer_shapes:
            min_y = min(s.y_px for s in all_footer_shapes)
            footers.append(HeaderFooterPattern(
                type="footer",
                y_start_px=round(min_y, 1),
                y_end_px=canvas_height,
                height_px=round(canvas_height - min_y, 1),
                slide_count=len(footer_shapes),
                frequency_percent=round(len(footer_shapes) / total_slides * 100, 1),
            ))

    return headers, footers


def detect_spacing_patterns(slide_layouts: list[SlideLayout]) -> list[SpacingPattern]:
    """Detect consistent spacing between elements."""
    # Collect vertical gaps between consecutive text shapes
    vertical_gaps: list[float] = []
    title_to_content_gaps: list[float] = []

    for layout in slide_layouts:
        text_shapes = sorted(
            [s for s in layout.shapes if s.has_text],
            key=lambda s: s.y_px,
        )

        for i in range(len(text_shapes) - 1):
            gap = text_shapes[i + 1].y_px - (text_shapes[i].y_px + text_shapes[i].h_px)
            if 0 < gap < 200:  # Reasonable gap range
                vertical_gaps.append(gap)

                # Title to content gap
                if text_shapes[i].placeholder_type in ("title", "ctrTitle"):
                    title_to_content_gaps.append(gap)

    patterns: list[SpacingPattern] = []

    # Find most common vertical gaps
    if vertical_gaps:
        gap_counter = Counter(round(g / 5) * 5 for g in vertical_gaps)  # Round to 5px
        for gap_val, count in gap_counter.most_common(3):
            if count >= 3:
                patterns.append(SpacingPattern(
                    name=f"vertical_gap_{int(gap_val)}px",
                    value_px=float(gap_val),
                    context="between_elements",
                    frequency=count,
                ))

    if title_to_content_gaps:
        avg_gap = sum(title_to_content_gaps) / len(title_to_content_gaps)
        patterns.append(SpacingPattern(
            name="title_to_content_gap",
            value_px=round(avg_gap, 1),
            context="between_title_and_content",
            frequency=len(title_to_content_gaps),
        ))

    return patterns


def detect_title_consistency(slide_layouts: list[SlideLayout]) -> dict:
    """Analyze how consistently titles are positioned."""
    title_positions: list[dict] = []

    for layout in slide_layouts:
        for shape in layout.shapes:
            if shape.placeholder_type in ("title",) and shape.has_text:
                title_positions.append({
                    "x": shape.x_px,
                    "y": shape.y_px,
                    "w": shape.w_px,
                    "h": shape.h_px,
                })

    if not title_positions:
        return {}

    avg_x = sum(p["x"] for p in title_positions) / len(title_positions)
    avg_y = sum(p["y"] for p in title_positions) / len(title_positions)
    avg_w = sum(p["w"] for p in title_positions) / len(title_positions)
    avg_h = sum(p["h"] for p in title_positions) / len(title_positions)

    # Consistency score (0-1, based on standard deviation)
    if len(title_positions) > 1:
        x_std = (sum((p["x"] - avg_x) ** 2 for p in title_positions) / len(title_positions)) ** 0.5
        y_std = (sum((p["y"] - avg_y) ** 2 for p in title_positions) / len(title_positions)) ** 0.5
        # Lower std = higher consistency
        consistency = max(0, 1.0 - (x_std + y_std) / 100.0)
    else:
        consistency = 1.0

    return {
        "x_px": round(avg_x, 1),
        "y_px": round(avg_y, 1),
        "w_px": round(avg_w, 1),
        "h_px": round(avg_h, 1),
        "sample_count": len(title_positions),
        "consistency_score": round(consistency, 3),
    }


def analyze_patterns(slide_layouts: list[SlideLayout]) -> PatternProfile:
    """Run all pattern detection and produce a profile."""
    profile = PatternProfile()

    if not slide_layouts:
        return profile

    # Recurring elements
    profile.recurring_elements = detect_recurring_elements(slide_layouts)

    # Header/footer
    profile.headers, profile.footers = detect_header_footer(slide_layouts)

    # Spacing
    profile.spacing_patterns = detect_spacing_patterns(slide_layouts)

    # Content density
    total_shapes = sum(len(l.shapes) for l in slide_layouts)
    total_text = sum(
        len([s for s in l.shapes if s.has_text])
        for l in slide_layouts
    )
    n = len(slide_layouts)
    profile.avg_shapes_per_slide = round(total_shapes / n, 1) if n else 0
    profile.avg_text_shapes_per_slide = round(total_text / n, 1) if n else 0

    # Title consistency
    profile.title_position = detect_title_consistency(slide_layouts)

    return profile


def _describe_element(
    shape: ShapeRecord,
    x: float, y: float, w: float, h: float,
) -> str:
    """Generate a description for a recurring element."""
    position = ""
    if y < 100:
        position = "top"
    elif y > 600:
        position = "bottom"
    elif x < 100:
        position = "left"
    elif x > 1100:
        position = "right"
    else:
        position = "center"

    size = ""
    if w < 50 and h < 50:
        size = "small"
    elif w > 500 or h > 500:
        size = "large"
    else:
        size = "medium"

    type_desc = shape.shape_type
    if shape.has_text:
        type_desc = f"text ({shape.text_preview[:20]})"

    return f"{size} {type_desc} at {position}"
