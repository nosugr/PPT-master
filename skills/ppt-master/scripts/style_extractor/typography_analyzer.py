"""Typography Analyzer — extract precise font usage from PPTX shapes.

Walks every text run in every slide and collects:
- Font family (resolved from theme refs)
- Font size (pt)
- Weight (bold / regular)
- Italic
- Color (hex)
- Alignment
- Line spacing
- Letter spacing
- Text frame insets

Groups runs by statistical clustering to identify the typography hierarchy
(H1, H2, body, caption, etc.) based on actual usage frequency.
"""

from __future__ import annotations

import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from xml.etree import ElementTree as ET

# Add parent scripts dir to path for pptx_to_svg imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pptx_to_svg.emu_units import NS, emu_to_px, hundredths_pt_to_px


@dataclass
class TextRunStyle:
    """Resolved style of a single text run."""
    font_family: str = "sans-serif"
    font_size_pt: float = 18.0
    bold: bool = False
    italic: bool = False
    color: str = "#000000"
    underline: bool = False
    letter_spacing_pt: float = 0.0


@dataclass
class ParagraphStyle:
    """Resolved paragraph-level style."""
    alignment: str = "left"  # left / center / right / justify
    line_spacing_ratio: float = 1.2
    space_before_pt: float = 0.0
    space_after_pt: float = 0.0
    indent_pt: float = 0.0
    margin_left_pt: float = 0.0
    level: int = 0
    bullet: str = ""  # bullet character if any


@dataclass
class TextFrameRecord:
    """A single text frame with its position and all paragraph/run styles."""
    slide_index: int
    shape_name: str = ""
    # Position in EMU converted to px
    x_px: float = 0.0
    y_px: float = 0.0
    w_px: float = 0.0
    h_px: float = 0.0
    # Body properties
    anchor: str = "t"  # t / ctr / b
    wrap: str = "square"
    inset_left_px: float = 0.0
    inset_top_px: float = 0.0
    inset_right_px: float = 0.0
    inset_bottom_px: float = 0.0
    # Content
    paragraphs: list[tuple[ParagraphStyle, list[TextRunStyle]]] = field(default_factory=list)
    full_text: str = ""


@dataclass
class TypographyProfile:
    """Aggregated typography analysis result."""
    # All unique font families used
    font_families: list[dict] = field(default_factory=list)  # [{name, count, contexts}]
    # Font size distribution
    font_sizes: list[dict] = field(default_factory=list)  # [{size_pt, count, contexts}]
    # Inferred hierarchy
    hierarchy: list[dict] = field(default_factory=list)  # [{role, font, size_pt, weight, color, ...}]
    # All text frame records (for downstream layout analysis)
    text_frames: list[TextFrameRecord] = field(default_factory=list)
    # Theme fonts
    theme_fonts: dict = field(default_factory=dict)


# Alignment map
ALIGN_MAP = {"l": "left", "ctr": "center", "r": "right", "just": "justify", "dist": "justify"}

# Default body insets (EMU)
DEFAULT_INSETS = {"l": 91440, "t": 45720, "r": 91440, "b": 45720}


def extract_theme_fonts(theme_root: ET.Element | None) -> dict[str, str]:
    """Extract font declarations from theme XML."""
    fonts: dict[str, str] = {}
    if theme_root is None:
        return fonts

    font_scheme = theme_root.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}fontScheme")
    if font_scheme is None:
        return fonts

    major = font_scheme.find("a:majorFont", NS)
    minor = font_scheme.find("a:minorFont", NS)

    if major is not None:
        latin = major.find("a:latin", NS)
        ea = major.find("a:ea", NS)
        if latin is not None and latin.attrib.get("typeface"):
            fonts["majorLatin"] = latin.attrib["typeface"]
        if ea is not None and ea.attrib.get("typeface"):
            fonts["majorEastAsia"] = ea.attrib["typeface"]

    if minor is not None:
        latin = minor.find("a:latin", NS)
        ea = minor.find("a:ea", NS)
        if latin is not None and latin.attrib.get("typeface"):
            fonts["minorLatin"] = latin.attrib["typeface"]
        if ea is not None and ea.attrib.get("typeface"):
            fonts["minorEastAsia"] = ea.attrib["typeface"]

    return fonts


def resolve_theme_typeface(face: str | None, theme_fonts: dict[str, str]) -> str | None:
    """Resolve theme font references like +mj-lt, +mn-ea."""
    if not face or not face.startswith("+"):
        return face
    code = face[1:]
    mapping = {
        "mj-lt": "majorLatin",
        "mn-lt": "minorLatin",
        "mj-ea": "majorEastAsia",
        "mn-ea": "minorEastAsia",
    }
    key = mapping.get(code)
    if key and key in theme_fonts:
        return theme_fonts[key]
    return face


def _get_typeface(rpr: ET.Element | None, tag: str) -> str | None:
    """Get typeface from a:latin / a:ea / a:cs child."""
    if rpr is None:
        return None
    elem = rpr.find(f"a:{tag}", NS)
    if elem is None:
        return None
    return elem.attrib.get("typeface") or None


def _resolve_color(rpr: ET.Element | None) -> str:
    """Extract solid fill color from run properties."""
    if rpr is None:
        return "#000000"
    solid = rpr.find("a:solidFill", NS)
    if solid is None:
        return "#000000"
    srgb = solid.find("a:srgbClr", NS)
    if srgb is not None:
        val = srgb.attrib.get("val", "000000")
        return f"#{val}"
    # scheme color — return placeholder, will be resolved later
    scheme = solid.find("a:schemeClr", NS)
    if scheme is not None:
        return f"scheme:{scheme.attrib.get('val', 'tx1')}"
    return "#000000"


def parse_text_frame(
    shape: ET.Element,
    slide_index: int,
    theme_fonts: dict[str, str],
    xfrm_data: dict | None = None,
) -> TextFrameRecord | None:
    """Parse a shape's txBody into a TextFrameRecord."""
    tx_body = shape.find(".//p:txBody", NS)
    if tx_body is None:
        tx_body = shape.find("p:txBody", NS)
    if tx_body is None:
        return None

    # Get shape name
    nv_sp_pr = shape.find("p:nvSpPr", NS)
    shape_name = ""
    if nv_sp_pr is not None:
        c_nv_pr = nv_sp_pr.find("p:cNvPr", NS)
        if c_nv_pr is not None:
            shape_name = c_nv_pr.attrib.get("name", "")

    # Get position from xfrm
    x_px = y_px = w_px = h_px = 0.0
    sp_pr = shape.find("p:spPr", NS)
    if sp_pr is not None:
        xfrm = sp_pr.find("a:xfrm", NS)
        if xfrm is not None:
            off = xfrm.find("a:off", NS)
            ext = xfrm.find("a:ext", NS)
            if off is not None:
                x_px = emu_to_px(int(off.attrib.get("x", "0")))
                y_px = emu_to_px(int(off.attrib.get("y", "0")))
            if ext is not None:
                w_px = emu_to_px(int(ext.attrib.get("cx", "0")))
                h_px = emu_to_px(int(ext.attrib.get("cy", "0")))

    if xfrm_data:
        x_px = xfrm_data.get("x", x_px)
        y_px = xfrm_data.get("y", y_px)
        w_px = xfrm_data.get("w", w_px)
        h_px = xfrm_data.get("h", h_px)

    # Body properties
    body_pr = tx_body.find("a:bodyPr", NS)
    anchor = "t"
    wrap = "square"
    inset_l = emu_to_px(DEFAULT_INSETS["l"])
    inset_t = emu_to_px(DEFAULT_INSETS["t"])
    inset_r = emu_to_px(DEFAULT_INSETS["r"])
    inset_b = emu_to_px(DEFAULT_INSETS["b"])

    if body_pr is not None:
        anchor = body_pr.attrib.get("anchor", "t")
        wrap = body_pr.attrib.get("wrap", "square")
        if "lIns" in body_pr.attrib:
            inset_l = emu_to_px(int(body_pr.attrib["lIns"]))
        if "tIns" in body_pr.attrib:
            inset_t = emu_to_px(int(body_pr.attrib["tIns"]))
        if "rIns" in body_pr.attrib:
            inset_r = emu_to_px(int(body_pr.attrib["rIns"]))
        if "bIns" in body_pr.attrib:
            inset_b = emu_to_px(int(body_pr.attrib["bIns"]))

    record = TextFrameRecord(
        slide_index=slide_index,
        shape_name=shape_name,
        x_px=x_px, y_px=y_px, w_px=w_px, h_px=h_px,
        anchor=anchor, wrap=wrap,
        inset_left_px=inset_l, inset_top_px=inset_t,
        inset_right_px=inset_r, inset_bottom_px=inset_b,
    )

    # Parse paragraphs
    full_text_parts = []
    for p_elem in tx_body.findall("a:p", NS):
        para_style, runs = _parse_paragraph(p_elem, theme_fonts)
        if runs:
            record.paragraphs.append((para_style, runs))
            for run in runs:
                full_text_parts.append("")  # placeholder for joining

    # Build full text
    texts = []
    for p_elem in tx_body.findall("a:p", NS):
        p_texts = []
        for r_elem in p_elem.findall("a:r", NS):
            t_elem = r_elem.find("a:t", NS)
            if t_elem is not None and t_elem.text:
                p_texts.append(t_elem.text)
        texts.append("".join(p_texts))
    record.full_text = "\n".join(texts).strip()

    if not record.full_text and not record.paragraphs:
        return None

    return record


def _parse_paragraph(
    p_elem: ET.Element,
    theme_fonts: dict[str, str],
) -> tuple[ParagraphStyle, list[TextRunStyle]]:
    """Parse a single <a:p> element."""
    para = ParagraphStyle()

    p_pr = p_elem.find("a:pPr", NS)
    if p_pr is not None:
        para.alignment = ALIGN_MAP.get(p_pr.attrib.get("algn", "l"), "left")
        try:
            para.level = int(p_pr.attrib.get("lvl", "0"))
        except ValueError:
            pass
        try:
            para.margin_left_pt = int(p_pr.attrib.get("marL", "0")) / 12700.0
        except ValueError:
            pass
        try:
            para.indent_pt = int(p_pr.attrib.get("indent", "0")) / 12700.0
        except ValueError:
            pass

        # Line spacing
        ln_spc = p_pr.find("a:lnSpc", NS)
        if ln_spc is not None:
            spc_pct = ln_spc.find("a:spcPct", NS)
            if spc_pct is not None:
                try:
                    para.line_spacing_ratio = float(spc_pct.attrib.get("val", "100000")) / 100000.0
                except ValueError:
                    pass

        # Space before/after
        spc_bef = p_pr.find("a:spcBef/a:spcPts", NS)
        if spc_bef is not None:
            try:
                para.space_before_pt = int(spc_bef.attrib.get("val", "0")) / 100.0
            except ValueError:
                pass
        spc_aft = p_pr.find("a:spcAft/a:spcPts", NS)
        if spc_aft is not None:
            try:
                para.space_after_pt = int(spc_aft.attrib.get("val", "0")) / 100.0
            except ValueError:
                pass

        # Bullet
        bu_char = p_pr.find("a:buChar", NS)
        if bu_char is not None:
            para.bullet = bu_char.attrib.get("char", "•")

    # Parse runs
    runs: list[TextRunStyle] = []
    end_rpr = p_elem.find("a:endParaRPr", NS)

    for r_elem in p_elem.findall("a:r", NS):
        t_elem = r_elem.find("a:t", NS)
        text = t_elem.text if t_elem is not None else ""
        if not text or not text.strip():
            continue

        rpr = r_elem.find("a:rPr", NS)
        run_style = _build_run_style(rpr, end_rpr, theme_fonts)
        runs.append(run_style)

    return para, runs


def _build_run_style(
    rpr: ET.Element | None,
    end_rpr: ET.Element | None,
    theme_fonts: dict[str, str],
) -> TextRunStyle:
    """Build a TextRunStyle from run properties."""
    style = TextRunStyle()

    # Font size
    sz = None
    for src in (rpr, end_rpr):
        if src is not None and "sz" in src.attrib:
            sz = src.attrib["sz"]
            break
    if sz:
        try:
            style.font_size_pt = int(sz) / 100.0
        except ValueError:
            pass

    # Bold / italic
    for src in (rpr, end_rpr):
        if src is not None:
            if "b" in src.attrib:
                style.bold = src.attrib["b"] == "1"
                break
    for src in (rpr, end_rpr):
        if src is not None:
            if "i" in src.attrib:
                style.italic = src.attrib["i"] == "1"
                break

    # Underline
    for src in (rpr, end_rpr):
        if src is not None:
            if "u" in src.attrib:
                style.underline = src.attrib["u"] not in ("none", "")
                break

    # Letter spacing
    for src in (rpr, end_rpr):
        if src is not None:
            if "spc" in src.attrib:
                try:
                    style.letter_spacing_pt = int(src.attrib["spc"]) / 100.0
                except ValueError:
                    pass
                break

    # Color
    style.color = _resolve_color(rpr) if rpr is not None else _resolve_color(end_rpr)

    # Font family
    latin = _get_typeface(rpr, "latin") or _get_typeface(end_rpr, "latin")
    ea = _get_typeface(rpr, "ea") or _get_typeface(end_rpr, "ea")

    latin = resolve_theme_typeface(latin, theme_fonts)
    ea = resolve_theme_typeface(ea, theme_fonts)

    parts = []
    if latin:
        parts.append(latin)
    if ea and ea != latin:
        parts.append(ea)
    if parts:
        style.font_family = ", ".join(parts)

    return style


def analyze_typography(text_frames: list[TextFrameRecord]) -> TypographyProfile:
    """Analyze all text frames and produce a typography profile."""
    profile = TypographyProfile(text_frames=text_frames)

    # Collect all run styles
    font_counter: Counter = Counter()
    size_counter: Counter = Counter()
    style_groups: defaultdict[tuple, int] = defaultdict(int)

    for frame in text_frames:
        for para_style, runs in frame.paragraphs:
            for run in runs:
                font_counter[run.font_family] += 1
                size_counter[run.font_size_pt] += 1
                key = (run.font_family, run.font_size_pt, run.bold, run.color)
                style_groups[key] += 1

    # Font families
    profile.font_families = [
        {"name": name, "count": count}
        for name, count in font_counter.most_common()
    ]

    # Font sizes
    profile.font_sizes = [
        {"size_pt": size, "count": count}
        for size, count in sorted(size_counter.items(), key=lambda x: -x[1])
    ]

    # Infer hierarchy by clustering (size + bold + position)
    profile.hierarchy = _infer_hierarchy(text_frames, style_groups)

    return profile


def _infer_hierarchy(
    text_frames: list[TextFrameRecord],
    style_groups: dict[tuple, int],
) -> list[dict]:
    """Infer typography hierarchy from usage patterns."""
    # Sort style groups by font size descending, then by frequency
    sorted_groups = sorted(
        style_groups.items(),
        key=lambda x: (-x[0][1], -x[1]),  # size desc, count desc
    )

    hierarchy = []
    seen_sizes: set[float] = set()

    for (font, size_pt, bold, color), count in sorted_groups:
        if count < 2:
            continue  # Skip one-off styles
        # Deduplicate by size bucket (within 1pt)
        bucket = round(size_pt)
        if bucket in seen_sizes:
            continue
        seen_sizes.add(bucket)

        # Determine role based on size and position
        role = _guess_role(size_pt, bold, text_frames)

        hierarchy.append({
            "role": role,
            "font_family": font,
            "font_size_pt": size_pt,
            "bold": bold,
            "color": color,
            "frequency": count,
        })

    return hierarchy[:8]  # Cap at 8 levels


def _guess_role(size_pt: float, bold: bool, frames: list[TextFrameRecord]) -> str:
    """Guess the semantic role based on font size."""
    if size_pt >= 36:
        return "cover_title"
    elif size_pt >= 28:
        return "slide_title" if bold else "subtitle"
    elif size_pt >= 22:
        return "section_title"
    elif size_pt >= 18:
        return "heading"
    elif size_pt >= 14:
        return "body"
    elif size_pt >= 11:
        return "caption"
    else:
        return "footnote"
