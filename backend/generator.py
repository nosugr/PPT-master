"""Background pipeline orchestrator for full PPT generation."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import config
from llm_client import generate_text

_SCRIPTS_DIR = config.SCRIPTS_DIR
_REFERENCES_DIR = config.REFERENCES_DIR
_TEMPLATES_DIR = config.TEMPLATES_DIR

_STYLE_MAP = {
    "general": "executor-general.md",
    "consultant": "executor-consultant.md",
    "consultant_top": "executor-consultant-top.md",
}

# Content-analysis keyword sets for auto-inference
_STYLE_KEYWORDS = {
    "consultant_top": [
        "战略", "投资", "董事会", "决策", "roadmap", "strategic", "board",
        "C-suite", "CEO", "CFO", "investor", "路演", "融资", "IPO",
        "金字塔", "SCQA", "MECE", "麦肯锡", "BCG", "贝恩", "MBB",
    ],
    "consultant": [
        "数据", "KPI", "指标", "增长率", "分析", "报告", "运营", "财务",
        "dashboard", "metrics", "performance", "review", "quarterly",
        "市场调研", "竞品", "份额", "营收", "利润", "ROI", "转化率",
        "政府", "汇报", "总结", "年度报告", "工作总结",
    ],
}
_INDUSTRY_KEYWORDS = {
    "finance": ["金融", "银行", "证券", "基金", "保险", "投资", "finance", "bank", "insurance"],
    "healthcare": ["医疗", "健康", "医药", "医院", "临床", "healthcare", "medical", "pharma"],
    "technology": ["科技", "互联网", "软件", "AI", "算法", "云计算", "tech", "software", "SaaS"],
    "education": ["教育", "培训", "学校", "课程", "教学", "education", "training", "university"],
    "government": ["政府", "政务", "公务", "机关", "党委", "gov", "public sector"],
    "retail": ["零售", "电商", "消费", "品牌", "marketing", "retail", "e-commerce"],
    "energy": ["能源", "电力", "环保", "碳", "新能源", "energy", "renewable"],
    "manufacturing": ["制造", "工厂", "产线", "供应链", "manufacturing", "supply chain"],
}
_CJK_PATTERN = re.compile(r"[一-鿿㐀-䶿]")
_JP_KR_PATTERN = re.compile(r"[぀-ゟ゠-ヿ가-힯]")


# ---------------------------------------------------------------------------
# Status helpers
# ---------------------------------------------------------------------------

def _update_status(project_path: Path, **kwargs) -> None:
    status_file = project_path / "generation_status.json"
    data = {}
    if status_file.exists():
        try:
            data = json.loads(status_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    data.update(kwargs)
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    status_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _read_sources(project_path: Path) -> str:
    """Concatenate all .md files in sources/."""
    sources_dir = project_path / "sources"
    if not sources_dir.exists():
        return ""
    parts: list[str] = []
    for md in sorted(sources_dir.glob("*.md")):
        parts.append(f"---\n## {md.stem}\n\n{md.read_text(encoding='utf-8')}")
    return "\n\n".join(parts)


def _detect_canvas_format(project_path: Path) -> str:
    """Extract canvas format key from project directory name (e.g. 'ppt169')."""
    name = project_path.name.lower()
    for key in config.CANVAS_FORMATS:
        if key in name:
            return key
    return "ppt169"  # default


# ---------------------------------------------------------------------------
# Source content analysis (auto-inference for Eight Confirmations)
# ---------------------------------------------------------------------------

def _analyze_sources(sources_md: str) -> dict:
    """Analyze source content to infer style, industry, and language.

    Returns dict with keys: style, industry, language, page_estimate, reason.
    """
    text_lower = sources_md.lower()
    result: dict = {"style": None, "industry": None, "language": "zh", "page_estimate": 10, "reason": ""}

    # --- Language detection ---
    cjk_count = len(_CJK_PATTERN.findall(sources_md))
    jp_kr_count = len(_JP_KR_PATTERN.findall(sources_md))
    latin_count = len(re.findall(r"[a-zA-Z]+", sources_md))
    total_chars = max(len(sources_md), 1)

    if cjk_count > total_chars * 0.15:
        result["language"] = "zh"
    elif jp_kr_count > total_chars * 0.05:
        result["language"] = "ja"
    elif latin_count > 50:
        result["language"] = "en"

    # --- Style inference ---
    top_scores: list[tuple[str, int]] = []
    for style_key, keywords in _STYLE_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw.lower() in text_lower)
        if score > 0:
            top_scores.append((style_key, score))

    if top_scores:
        top_scores.sort(key=lambda x: -x[1])
        best_style = top_scores[0][0]
        result["style"] = best_style
        matched_kws = [kw for kw in _STYLE_KEYWORDS[best_style] if kw.lower() in text_lower]
        result["reason"] = f"Matched keywords: {', '.join(matched_kws[:5])}"
    else:
        result["style"] = "general"
        result["reason"] = "No domain keywords matched; defaulting to General Versatile"

    # --- Industry inference ---
    industry_scores: list[tuple[str, int]] = []
    for ind_key, keywords in _INDUSTRY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw.lower() in text_lower)
        if score > 0:
            industry_scores.append((ind_key, score))

    if industry_scores:
        industry_scores.sort(key=lambda x: -x[1])
        result["industry"] = industry_scores[0][0]

    # --- Page count estimate ---
    word_count = len(sources_md)
    # ~800-1200 chars per content page for Chinese, ~500 words for English
    if result["language"] == "zh":
        content_pages = max(4, min(20, word_count // 800))
    else:
        word_tokens = len(sources_md.split())
        content_pages = max(4, min(20, word_tokens // 300))
    result["page_estimate"] = content_pages + 3  # +3 for cover/toc/ending

    return result


# ---------------------------------------------------------------------------
# Strategist
# ---------------------------------------------------------------------------

def _build_strategist_prompt() -> str:
    parts = []
    for f in ("strategist.md", "shared-standards.md", "canvas-formats.md"):
        p = _REFERENCES_DIR / f
        if p.exists():
            parts.append(p.read_text(encoding="utf-8"))
    ref = _TEMPLATES_DIR / "design_spec_reference.md"
    if ref.exists():
        parts.append(ref.read_text(encoding="utf-8"))
    # Embed charts index summary (not full file — too large)
    charts_index = _TEMPLATES_DIR / "charts" / "charts_index.json"
    if charts_index.exists():
        try:
            data = json.loads(charts_index.read_text(encoding="utf-8"))
            summary_lines = []
            for entry in data if isinstance(data, list) else data.get("charts", []):
                if isinstance(entry, dict):
                    name = entry.get("name", entry.get("key", ""))
                    summary = entry.get("summary", "")
                    if name and summary:
                        summary_lines.append(f"- {name}: {summary}")
            if summary_lines:
                parts.append("## Chart Template Catalog Summary\n\n" + "\n".join(summary_lines[:80]))
        except Exception:
            pass
    return "\n\n---\n\n".join(parts)


def _extract_minimal_spec_lock(design_spec: str, canvas_format: str) -> str:
    """Generate a minimal spec_lock.md from design_spec.md as fallback."""
    canvas_info = config.CANVAS_FORMATS.get(canvas_format, config.CANVAS_FORMATS["ppt169"])

    # Extract colors from design_spec
    colors = re.findall(r"`(#[0-9A-Fa-f]{6})`", design_spec)
    primary = colors[0] if colors else "#1565C0"
    accent = colors[1] if len(colors) > 1 else "#FF6B35"
    bg = colors[2] if len(colors) > 2 else "#FFFFFF"
    text_color = colors[3] if len(colors) > 3 else "#1A1A2E"

    # Count pages from P markers
    pages = re.findall(r"P(\d{2})", design_spec)
    total = max(int(p) for p in pages) if pages else 10

    # Build rhythm: cover=anchor, toc=anchor, last=anchor, rest=dense
    rhythm_lines = []
    for i in range(1, total + 1):
        if i == 1 or i == total:
            rhythm_lines.append(f"P{i:02d}: anchor")
        elif i == 2 and total > 6:
            rhythm_lines.append(f"P{i:02d}: anchor")
        else:
            rhythm_lines.append(f"P{i:02d}: dense")

    return f"""# spec_lock.md

## color_palette
| role | hex |
|------|-----|
| background | `{bg}` |
| primary | `{primary}` |
| accent | `{accent}` |
| body_text | `{text_color}` |
| secondary_text | `#6B7280` |
| border | `#E5E7EB` |

## font_family
- title: Microsoft YaHei, sans-serif
- body: Microsoft YaHei, sans-serif

## font_sizes
- title: 36px
- subtitle: 24px
- body: 18px
- caption: 14px

## icon_inventory
- library: tabler-filled

## image_list
(none)

## page_rhythm
{chr(10).join(rhythm_lines)}

## page_layouts
(free design)
"""


def _run_strategist(
    project_path: Path,
    sources_md: str,
    canvas_format: str,
    style: str | None,
    page_count: int | None,
) -> None:
    _update_status(project_path, stage="strategist", message="Running Strategist analysis...")

    canvas_info = config.CANVAS_FORMATS.get(canvas_format, config.CANVAS_FORMATS["ppt169"])
    system_prompt = _build_strategist_prompt()

    # --- Auto-infer from source content ---
    analysis = _analyze_sources(sources_md)
    inferred_style = style or analysis["style"]
    inferred_page_count = page_count or analysis["page_estimate"]

    # Map style key to Strategist mode description
    style_mode_map = {
        "general": "A) General Versatile — visual impact first, public/clients/trainees",
        "consultant": "B) General Consulting — data clarity first, teams/management",
        "consultant_top": "C) Top Consulting — logical persuasion first, executives/board",
    }
    style_desc = style_mode_map.get(inferred_style, style_mode_map["general"])

    # Industry color recommendation
    industry_hint = ""
    if analysis["industry"]:
        ind_colors = config.INDUSTRY_COLORS.get(analysis["industry"], {})
        if ind_colors:
            industry_hint = (
                f"\nDetected industry: {ind_colors['name']} "
                f"(recommended primary: {ind_colors['primary']}, "
                f"accent: {ind_colors['accent']})"
            )

    # Font recommendation based on language
    lang = analysis["language"]
    if lang == "zh":
        font_hint = 'Concord style: "Microsoft YaHei", "PingFang SC", sans-serif (title and body same family, weight contrast)'
    elif lang == "ja":
        font_hint = 'Concord style: "Yu Gothic", "Hiragino Sans", "Microsoft YaHei", sans-serif'
    else:
        font_hint = 'Contrast style: Georgia, serif (title) vs Arial, sans-serif (body)'

    user_message = f"""You are a presentation strategist. Analyze the source material and produce the Eight Confirmations, Page Structure Proposal, Design Specification, and Execution Lock.

=== EIGHT CONFIRMATIONS (you MUST output these as a formatted table) ===

The following are RECOMMENDED based on content analysis. You MUST validate each recommendation against the actual source content and adjust if needed. Output the final decisions as a markdown table.

a. Canvas Format: {canvas_info['name']} ({canvas_info['dimensions']}) — confirmed
b. Page Count: Recommend {inferred_page_count} pages based on content volume ({analysis['page_estimate']} content pages + structural pages). Adjust if the source material warrants it.
c. Target Audience: Infer from source document content and tone
d. Style: {style_desc}
   Reasoning: {analysis['reason']}
e. Color Scheme: Select based on content domain. Use 60-30-10 rule (primary 60%, secondary 30%, accent 10%).{industry_hint}
f. Icon Usage: C) Built-in icon library — choose ONE stylistic library (chunk-filled / tabler-filled / tabler-outline / phosphor-duotone) based on visual style
g. Typography: {font_hint}. Body baseline: 18px (dense) or 24px (relaxed). Minimum body 12pt, subtitle 14pt.
h. Image Usage: Auto — recommend where images add value (cover background, section dividers, data illustration)

=== PAGE STRUCTURE PROPOSAL (you MUST output this) ===

List EVERY page as a numbered table:
| Page | Type | Content (specific names, data points, methods from source) |
|------|------|-------------------------------------------------------------|
| P01 | cover | Project title + subtitle + date |
| P02 | toc | Chapter navigation |
| ... | ... | ... |

"Specific content" means actual substance: method names, data values, conclusions, case names. NOT generic labels like "introduce background".

=== SOURCE MATERIAL ===

{sources_md}

=== OUTPUT FORMAT ===

You MUST output FOUR sections using these EXACT delimiters:

===CONFIRMATIONS_START===
(Eight Confirmations table + reasoning)
===CONFIRMATIONS_END===

===PAGE_STRUCTURE_START===
(Page-by-page content outline table)
===PAGE_STRUCTURE_END===

===DESIGN_SPEC_START===
(Full design_spec.md — follow templates/design_spec_reference.md 11-section structure exactly)
===DESIGN_SPEC_END===

===SPEC_LOCK_START===
(Full spec_lock.md — machine-readable execution lock. MUST include page_rhythm with anchor/dense/breathing per page, page_layouts if using templates, page_charts for chart pages)
===SPEC_LOCK_END===

CRITICAL RULES:
- spec_lock.md page_rhythm: P01/P_last = anchor, content pages = dense, chapter transitions/hero quotes/big numbers = breathing
- spec_lock.md must use strict format: "P01: anchor", "P02: dense", etc.
- Every color in spec_lock must be HEX (#RRGGBB)
- Font stacks must end with a pre-installed font (Microsoft YaHei / Arial / Times New Roman)
- Do NOT include any text outside the four delimiter sections"""

    response = generate_text(system_prompt, user_message, max_tokens=32000, role="strategist")

    # Log raw response for debugging
    (project_path / "llm_debug_strategist.txt").write_text(response, encoding="utf-8")

    # --- Parse four-section output ---
    confirmations_text = None
    page_structure_text = None
    spec_text = None
    lock_text = None

    # Parse CONFIRMATIONS
    conf_match = re.search(
        r"===CONFIRMATIONS_START===\s*\n(.*?)\n\s*===CONFIRMATIONS_END===",
        response, re.DOTALL,
    )
    if conf_match:
        confirmations_text = conf_match.group(1).strip()

    # Parse PAGE_STRUCTURE
    ps_match = re.search(
        r"===PAGE_STRUCTURE_START===\s*\n(.*?)\n\s*===PAGE_STRUCTURE_END===",
        response, re.DOTALL,
    )
    if ps_match:
        page_structure_text = ps_match.group(1).strip()

    # Parse DESIGN_SPEC
    spec_match = re.search(
        r"===DESIGN_SPEC_START===\s*\n(.*?)\n\s*===DESIGN_SPEC_END===",
        response, re.DOTALL,
    )
    if spec_match:
        spec_text = spec_match.group(1).strip()

    # Parse SPEC_LOCK
    lock_match = re.search(
        r"===SPEC_LOCK_START===\s*\n(.*?)\n\s*===SPEC_LOCK_END===",
        response, re.DOTALL,
    )
    if lock_match:
        lock_text = lock_match.group(1).strip()

    # --- Fallback strategies for design_spec ---
    if not spec_text:
        code_blocks = re.findall(r"```(?:markdown)?\s*\n(.*?)```", response, re.DOTALL)
        if len(code_blocks) >= 2:
            spec_text = code_blocks[0].strip()
            if not lock_text:
                lock_text = code_blocks[1].strip()
        elif len(code_blocks) == 1:
            spec_text = code_blocks[0].strip()

    if not spec_text and not lock_text:
        parts = re.split(r"(?=^#\s*spec_lock)", response, maxsplit=1, flags=re.MULTILINE)
        if len(parts) == 2:
            spec_text = parts[0].strip()
            lock_text = parts[1].strip()

    if not spec_text:
        spec_text = response.strip()

    if not lock_text:
        lock_text = _extract_minimal_spec_lock(spec_text, canvas_format)

    # --- Save all artifacts ---
    (project_path / "design_spec.md").write_text(spec_text, encoding="utf-8")
    (project_path / "spec_lock.md").write_text(lock_text, encoding="utf-8")

    if confirmations_text:
        (project_path / "confirmations.md").write_text(confirmations_text, encoding="utf-8")
    if page_structure_text:
        (project_path / "page_structure.md").write_text(page_structure_text, encoding="utf-8")

    # Save analysis metadata
    meta = {
        "inferred_style": inferred_style,
        "inferred_page_count": inferred_page_count,
        "industry": analysis["industry"],
        "language": analysis["language"],
        "analysis_reason": analysis["reason"],
    }
    (project_path / "analysis_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# Image generation
# ---------------------------------------------------------------------------

def _parse_image_resource_table(spec_text: str) -> list[dict]:
    """Parse §VIII Image Resource List into structured rows."""
    rows: list[dict] = []

    # Locate §VIII section
    section_match = re.search(
        r"(?:^|\n)#+\s*(?:VIII|8)\.?\s*Image.*?(?=\n#+\s*(?:IX|9)|\Z)",
        spec_text, re.DOTALL | re.IGNORECASE,
    )
    if not section_match:
        # Fallback: search entire spec for table rows with image extensions
        section_text = spec_text
    else:
        section_text = section_match.group(0)

    # Parse table rows: | filename | ... | acquire_via | ... | reference |
    # Handle variable column counts
    table_lines = [
        line.strip() for line in section_text.split("\n")
        if line.strip().startswith("|") and not re.match(r"^\|\s*-+", line.strip())
    ]

    if len(table_lines) < 2:
        return rows

    # Find header to identify column positions
    header = table_lines[0]
    headers = [h.strip().lower() for h in header.split("|") if h.strip()]

    filename_col = None
    acquire_col = None
    reference_col = None
    for i, h in enumerate(headers):
        if "filename" in h or "file" in h:
            filename_col = i
        elif "acquire" in h or "via" in h or "source" in h:
            acquire_col = i
        elif "reference" in h or "description" in h or "prompt" in h:
            reference_col = i

    if filename_col is None or acquire_col is None:
        # Fallback: try the old regex approach
        for match in re.finditer(
            r"\|\s*(\S+\.(?:jpg|png|jpeg|webp))\s*\|([^|]*\|){1,3}\s*(ai|web)\s*\|([^|]*\|)?\s*([^|]*)\s*\|",
            section_text, re.IGNORECASE,
        ):
            rows.append({
                "filename": match.group(1).strip(),
                "acquire_via": match.group(3).strip().lower(),
                "reference": match.group(5).strip(),
            })
        return rows

    for line in table_lines[1:]:  # skip header
        cols = [c.strip() for c in line.split("|") if c.strip()]
        if len(cols) <= max(filename_col, acquire_col):
            continue
        filename = cols[filename_col] if filename_col < len(cols) else ""
        acquire_via = cols[acquire_col] if acquire_col < len(cols) else ""
        reference = cols[reference_col] if reference_col is not None and reference_col < len(cols) else ""

        # Validate filename has image extension
        if not re.search(r"\.(jpg|png|jpeg|webp)$", filename, re.IGNORECASE):
            continue

        acquire_via = acquire_via.strip().lower()
        if acquire_via not in ("ai", "web", "user", "placeholder"):
            continue

        rows.append({
            "filename": filename,
            "acquire_via": acquire_via,
            "reference": reference.strip(),
        })

    return rows


def _run_image_generation(project_path: Path, image_mode: str) -> None:
    if image_mode == "skip":
        _update_status(project_path, stage="images", message="Image generation skipped")
        return

    _update_status(project_path, stage="images", message="Generating images...")
    images_dir = project_path / "images"
    images_dir.mkdir(exist_ok=True)

    spec_file = project_path / "design_spec.md"
    if not spec_file.exists():
        return

    spec_text = spec_file.read_text(encoding="utf-8")
    image_rows = _parse_image_resource_table(spec_text)

    generated_count = 0
    failed_rows: list[str] = []

    for row in image_rows:
        filename = row["filename"]
        acquire_via = row["acquire_via"]
        reference = row["reference"]

        if acquire_via in ("user", "placeholder"):
            continue
        if not reference:
            continue

        try:
            if acquire_via == "ai":
                args = [
                    sys.executable, str(_SCRIPTS_DIR / "image_gen.py"),
                    reference, "--aspect_ratio", "16:9", "--image_size", "1K",
                    "-o", str(images_dir), "-f", Path(filename).stem,
                ]
                result = subprocess.run(
                    args, cwd=str(_SCRIPTS_DIR), capture_output=True, text=True, timeout=120,
                )
                if result.returncode == 0:
                    generated_count += 1
                else:
                    failed_rows.append(f"{filename}: {result.stderr[:200]}")

            elif acquire_via == "web":
                args = [
                    sys.executable, str(_SCRIPTS_DIR / "image_search.py"),
                    reference, "--filename", filename,
                    "-o", str(images_dir),
                ]
                result = subprocess.run(
                    args, cwd=str(_SCRIPTS_DIR), capture_output=True, text=True, timeout=60,
                )
                if result.returncode == 0:
                    generated_count += 1
                else:
                    failed_rows.append(f"{filename}: {result.stderr[:200]}")

        except subprocess.TimeoutExpired:
            failed_rows.append(f"{filename}: timeout")
        except Exception as e:
            failed_rows.append(f"{filename}: {e}")

    status_msg = f"Image generation: {generated_count}/{len([r for r in image_rows if r['acquire_via'] in ('ai', 'web')])} generated"
    if failed_rows:
        status_msg += f", {len(failed_rows)} failed"
    _update_status(project_path, stage="images", message=status_msg)

    if failed_rows:
        (project_path / "image_gen_failures.log").write_text(
            "\n".join(failed_rows), encoding="utf-8",
        )


# ---------------------------------------------------------------------------
# Executor
# ---------------------------------------------------------------------------

def _build_executor_prompt(style: str) -> str:
    parts = []
    base = _REFERENCES_DIR / "executor-base.md"
    if base.exists():
        parts.append(base.read_text(encoding="utf-8"))

    style_file = _STYLE_MAP.get(style, _STYLE_MAP["general"])
    sf = _REFERENCES_DIR / style_file
    if sf.exists():
        parts.append(sf.read_text(encoding="utf-8"))

    shared = _REFERENCES_DIR / "shared-standards.md"
    if shared.exists():
        parts.append(shared.read_text(encoding="utf-8"))

    return "\n\n---\n\n".join(parts)


def _parse_spec_lock_sections(spec_lock_text: str) -> dict:
    """Parse spec_lock.md into structured sections.

    Returns dict with keys:
      - pages: list of {num, name, rhythm, layout, chart}
      - colors: dict of role->hex
      - typography: dict with font_family, body, title_family, etc.
      - icons: dict with library, inventory
    """
    result: dict = {"pages": [], "colors": {}, "typography": {}, "icons": {}}

    # --- Parse page_rhythm section ---
    rhythm_map: dict[int, str] = {}
    rhythm_section = re.search(
        r"##\s*page_rhythm\s*\n(.*?)(?=\n##|\Z)", spec_lock_text, re.DOTALL,
    )
    if rhythm_section:
        for m in re.finditer(r"P(\d+)\s*:\s*(\w+)", rhythm_section.group(1)):
            rhythm_map[int(m.group(1))] = m.group(2).strip().lower()

    # --- Parse page_layouts section ---
    layout_map: dict[int, str] = {}
    layout_section = re.search(
        r"##\s*page_layouts\s*\n(.*?)(?=\n##|\Z)", spec_lock_text, re.DOTALL,
    )
    if layout_section:
        for m in re.finditer(r"P(\d+)\s*:\s*(\S+)", layout_section.group(1)):
            layout_map[int(m.group(1))] = m.group(2).strip()

    # --- Parse page_charts section ---
    chart_map: dict[int, str] = {}
    chart_section = re.search(
        r"##\s*page_charts\s*\n(.*?)(?=\n##|\Z)", spec_lock_text, re.DOTALL,
    )
    if chart_section:
        for m in re.finditer(r"P(\d+)\s*:\s*(\S+)", chart_section.group(1)):
            chart_map[int(m.group(1))] = m.group(2).strip()

    # --- Build page list from rhythm (most reliable source) ---
    if rhythm_map:
        for num in sorted(rhythm_map.keys()):
            result["pages"].append({
                "num": num,
                "name": f"page_{num:02d}",
                "rhythm": rhythm_map.get(num, "dense"),
                "layout": layout_map.get(num, ""),
                "chart": chart_map.get(num, ""),
            })
    else:
        # Fallback: scan for any P\d+ patterns
        all_page_nums = set()
        for m in re.finditer(r"P(\d+)", spec_lock_text):
            all_page_nums.add(int(m.group(1)))
        for num in sorted(all_page_nums):
            result["pages"].append({
                "num": num,
                "name": f"page_{num:02d}",
                "rhythm": "dense",
                "layout": "",
                "chart": "",
            })

    # --- Parse color_palette section ---
    color_section = re.search(
        r"##\s*color_palette\s*\n(.*?)(?=\n##|\Z)", spec_lock_text, re.DOTALL,
    )
    if color_section:
        for m in re.finditer(r"\|\s*(\w+)\s*\|\s*(#[0-9A-Fa-f]{6})\s*\|", color_section.group(1)):
            result["colors"][m.group(1).strip()] = m.group(2).strip()

    # --- Parse font_family / typography section ---
    font_section = re.search(
        r"##\s*(?:font_family|typography)\s*\n(.*?)(?=\n##|\Z)", spec_lock_text, re.DOTALL,
    )
    if font_section:
        text = font_section.group(1)
        for m in re.finditer(r"(\w+):\s*(.+?)(?:\n|$)", text):
            key = m.group(1).strip()
            val = m.group(2).strip()
            result["typography"][key] = val

    # --- Parse icon_inventory section ---
    icon_section = re.search(
        r"##\s*icon_inventory\s*\n(.*?)(?=\n##|\Z)", spec_lock_text, re.DOTALL,
    )
    if icon_section:
        text = icon_section.group(1)
        lib_match = re.search(r"library:\s*(\S+)", text)
        if lib_match:
            result["icons"]["library"] = lib_match.group(1).strip()

    return result


def _parse_spec_lock_pages(spec_lock_text: str) -> list[dict]:
    """Parse page list from spec_lock.md — returns list of {num, name, rhythm, layout, chart}."""
    return _parse_spec_lock_sections(spec_lock_text)["pages"]


def _parse_design_spec_page_count(design_spec_text: str) -> int:
    """Try to extract page count from design_spec."""
    m = re.search(r"Page Count\*\*\s*\|\s*(\d+)", design_spec_text)
    if m:
        return int(m.group(1))
    # Count P markers
    p_matches = re.findall(r"P(\d{2})", design_spec_text)
    if p_matches:
        return max(int(p) for p in p_matches)
    return 10  # default


def _run_executor(
    project_path: Path,
    canvas_format: str,
    style: str,
    page_count: int | None,
) -> None:
    _update_status(project_path, stage="executing", message="Starting SVG generation...")

    svg_dir = project_path / "svg_output"
    svg_dir.mkdir(exist_ok=True)

    notes_dir = project_path / "notes"
    notes_dir.mkdir(exist_ok=True)

    spec_lock_text = (project_path / "spec_lock.md").read_text(encoding="utf-8")
    design_spec_text = (project_path / "design_spec.md").read_text(encoding="utf-8")

    system_prompt = _build_executor_prompt(style)
    canvas_info = config.CANVAS_FORMATS.get(canvas_format, config.CANVAS_FORMATS["ppt169"])

    # Parse spec_lock into structured sections
    lock_sections = _parse_spec_lock_sections(spec_lock_text)
    pages = lock_sections["pages"]

    if not pages:
        total = page_count or _parse_design_spec_page_count(design_spec_text)
        pages = [{"num": i, "name": f"page_{i:02d}", "rhythm": "dense", "layout": "", "chart": ""}
                 for i in range(1, total + 1)]

    total_pages = len(pages)
    all_notes: list[str] = []

    # Batch-read template SVGs if any exist
    template_svgs: dict[str, str] = {}
    tmpl_dir = project_path / "templates"
    if tmpl_dir.exists():
        for svg_file in tmpl_dir.glob("*.svg"):
            template_svgs[svg_file.stem] = svg_file.read_text(encoding="utf-8")

    # Batch-read chart SVGs referenced in page_charts
    chart_svgs: dict[str, str] = {}
    charts_dir = _TEMPLATES_DIR / "charts"
    for page in pages:
        chart_ref = page.get("chart", "")
        if chart_ref and chart_ref not in chart_svgs:
            chart_path = charts_dir / f"{chart_ref}.svg"
            if chart_path.exists():
                chart_svgs[chart_ref] = chart_path.read_text(encoding="utf-8")

    # Build common context prefix (stays in cache across pages)
    colors_summary = ""
    if lock_sections["colors"]:
        colors_summary = "\n".join(
            f"  {role}: {hex_val}" for role, hex_val in lock_sections["colors"].items()
        )

    typography_summary = ""
    if lock_sections["typography"]:
        typography_summary = "\n".join(
            f"  {k}: {v}" for k, v in lock_sections["typography"].items()
        )

    icon_library = lock_sections["icons"].get("library", "tabler-filled")

    # --- Design Parameter Confirmation (output once before first page) ---
    confirmation_text = f"""## Design Parameter Confirmation
- Canvas: {canvas_info['dimensions']} ({canvas_info.get('aspect_ratio', '16:9')})
- ViewBox: {canvas_info.get('viewbox', '0 0 1280 720')}
- Body font size: {lock_sections['typography'].get('body', '18px')}
- Colors:
{colors_summary or '  (from spec_lock.md)'}
- Typography:
{typography_summary or '  (from spec_lock.md)'}
- Icon library: {icon_library}
- Total pages: {total_pages}
- Style: {style}
"""
    _update_status(project_path, stage="executing", message=confirmation_text)

    for idx, page in enumerate(pages, start=1):
        page_num = page["num"]
        page_name = page["name"]
        page_rhythm = page.get("rhythm", "dense")
        page_layout = page.get("layout", "")
        page_chart = page.get("chart", "")

        _update_status(
            project_path,
            stage="executing",
            current_page=idx,
            total_pages=total_pages,
            message=f"Generating SVG page {idx}/{total_pages}: {page_name} (rhythm: {page_rhythm})",
        )

        # --- Build per-page context ---
        context_parts = [
            f"=== SPEC_LOCK.md (re-read before every page) ===\n{spec_lock_text}",
            f"\n=== DESIGN_SPEC.md (page {page_num} brief in §IX) ===\n{design_spec_text}",
            f"\n=== CANVAS FORMAT ===\n{canvas_info['name']} ({canvas_info['dimensions']})",
        ]

        if template_svgs:
            ctx = "\n\n=== TEMPLATE SVGs (batch-loaded) ===\n"
            for name, svg in template_svgs.items():
                ctx += f"\n--- {name}.svg ---\n{svg}\n"
            context_parts.append(ctx)

        if chart_svgs:
            ctx = "\n\n=== CHART TEMPLATE SVGs ===\n"
            for name, svg in chart_svgs.items():
                ctx += f"\n--- {name}.svg ---\n{svg}\n"
            context_parts.append(ctx)

        # --- Build per-page rhythm/layout/chart directives ---
        rhythm_directive = ""
        if page_rhythm == "anchor":
            rhythm_directive = """
RHYTHM: anchor — This is a structural page (cover/chapter/TOC/ending).
Follow the matching template verbatim if a page_layout is specified.
Use large titles, decorative elements, and breathing whitespace."""
        elif page_rhythm == "breathing":
            rhythm_directive = """
RHYTHM: breathing — This is a low-density impact page.
AVOID multi-card grid layouts (no 3-card rows, no 4-card KPI grids, no 2x2 matrices).
Use ONE of these forms instead:
- Hero quote: large centered text with attribution
- Single big number: one dominant metric with one-line interpretation
- Full-bleed image with floating caption
- Section transition with a single sentence
Proportions follow information weight, not preset ratios."""
        else:
            rhythm_directive = """
RHYTHM: dense — Information-heavy content page.
Card grids, multi-column layouts, KPI dashboards, tables, and charts are all permitted.
This is the baseline behavior."""

        layout_directive = ""
        if page_layout and page_layout in template_svgs:
            layout_directive = f"""
TEMPLATE: Inherit the structure of {page_layout}.svg (already in context above).
Preserve background, decorative elements, header/footer, and layout structure.
Replace placeholder content with this page's actual content from design_spec.md §IX."""
        else:
            layout_directive = """
TEMPLATE: None (free design). Design this page per the Design Spec.
Use the page layout patterns from strategist.md §4 as reference."""

        chart_directive = ""
        if page_chart:
            if page_chart in chart_svgs:
                chart_directive = f"""
CHART: Adapt the {page_chart} template (already in context above).
Apply project colors and typography. Preserve the visualization type.
EVERY chart page MUST include a plot-area marker comment:
  Rectangular: <!-- chart-plot-area: x_min,y_min,x_max,y_max -->
  Pie/Donut:   <!-- chart-plot-area: pie | center: cx,cy | radius: r -->"""
            else:
                chart_directive = f"""
CHART: Design a {page_chart} visualization from scratch.
Use design_spec.md §VII for guidance on data and layout.
Include plot-area marker comment if applicable."""

        # --- Build the full user message ---
        user_message = "\n".join(context_parts) + f"""

=== PER-PAGE DIRECTIVES (P{page_num:02d}: {page_name}) ===
{rhythm_directive}
{layout_directive}
{chart_directive}

=== EXECUTION RULES (MANDATORY) ===

1. SPEC_LOCK RE-READ: All colors, fonts, icons, images MUST come from spec_lock.md above. Do NOT invent values.
2. ELEMENT GROUPING: Wrap logically related elements in <g id="descriptive-name">. Aim for 3-8 top-level content groups per slide. Chrome groups (background, header, footer, decorations) excluded from animation count.
3. KEY INFO HIGHLIGHTING: Use <tspan fill="primary_color" font-weight="bold"> for:
   - Numerical results (percentages, amounts, multipliers)
   - Contrasts (gain/loss, before/after, target/actual)
   - 1-2 load-bearing nouns per sentence
   Do NOT highlight: connectives, common verbs, structural text (footers, page numbers, legends).
4. FONT STACKS: Every font-family MUST end with a pre-installed font (Microsoft YaHei / SimSun / Arial / Times New Roman / Consolas).
5. CHART MARKERS: If this page has a chart, include <!-- chart-plot-area: ... --> marker after axis lines, before data elements.
6. MINIMUM FONT SIZES: Body text >= 16px, subtitle >= 19px, all headings larger than subtitle.
7. NO BANNED FEATURES: No <mask>, <style>, class, foreignObject, textPath, @font-face, <animate>, <script>, rgba(), group opacity.

=== OUTPUT FORMAT ===

Output the SVG code using these exact delimiters:

===SVG_START===
(Complete SVG with viewBox="{canvas_info.get('viewbox', '0 0 1280 720')}")
===SVG_END===

===NOTES_START===
(Speaker notes: 2-5 natural sentences, pure spoken narration for TTS. No bracketed markers, no "Key points:", no "Duration:" lines.)
===NOTES_END===
"""

        # --- Retry loop (up to 2 attempts) ---
        svg_content = None
        notes_text = ""
        for attempt in range(2):
            try:
                response = generate_text(system_prompt, user_message, max_tokens=16000, role="executor")
            except Exception as e:
                if attempt == 0:
                    _update_status(project_path, message=f"Page {idx} LLM call failed, retrying...")
                    continue
                _update_status(project_path, message=f"Page {idx} skipped (LLM error: {e})")
                break

            # Log raw response
            debug_dir = project_path / "llm_debug"
            debug_dir.mkdir(exist_ok=True)
            (debug_dir / f"page_{idx:02d}.txt").write_text(response, encoding="utf-8")

            # Parse SVG — try delimiters first, then fallback
            svg_match = re.search(
                r"===SVG_START===\s*\n(.*?)\n\s*===SVG_END===",
                response, re.DOTALL,
            )
            if svg_match:
                svg_content = svg_match.group(1).strip()

            # Fallback: extract from ```xml or ```svg code block
            if not svg_content:
                code_match = re.search(r"```(?:xml|svg)?\s*\n(<svg.*?</svg>)", response, re.DOTALL)
                if code_match:
                    svg_content = code_match.group(1).strip()

            # Fallback: extract raw <svg>...</svg>
            if not svg_content:
                raw_svg = re.search(r"(<svg[^>]*>.*?</svg>)", response, re.DOTALL)
                if raw_svg:
                    svg_content = raw_svg.group(1).strip()

            if svg_content:
                # Parse notes
                notes_match = re.search(
                    r"===NOTES_START===\s*\n(.*?)\n\s*===NOTES_END===",
                    response, re.DOTALL,
                )
                if notes_match:
                    notes_text = notes_match.group(1).strip()
                else:
                    after_svg = re.split(r"===SVG_END===|</svg>", response, maxsplit=1)
                    if len(after_svg) > 1:
                        candidate = after_svg[1].strip()
                        candidate = re.sub(r"===NOTES_(START|END)===", "", candidate).strip()
                        if candidate and len(candidate) > 10:
                            notes_text = candidate[:500]
                break  # success
            else:
                if attempt == 0:
                    _update_status(project_path, message=f"Page {idx} format error, retrying...")
                    user_message += "\n\nYOU FAILED TO OUTPUT SVG. Output ONLY the SVG code between ===SVG_START=== and ===SVG_END=== delimiters. No tool calls, no bash commands."
                else:
                    _update_status(project_path, message=f"Page {idx} skipped (could not extract SVG)")

        if svg_content:
            svg_filename = f"{page_num:02d}_{page_name}.svg"
            (svg_dir / svg_filename).write_text(svg_content, encoding="utf-8")
            if notes_text:
                # Use format compatible with total_md_split.py: # NN_name
                all_notes.append(f"# {page_num:02d}_{page_name}\n\n{notes_text}")

    # Write combined notes
    (notes_dir / "total.md").write_text("\n\n---\n\n".join(all_notes), encoding="utf-8")


# ---------------------------------------------------------------------------
# Post-processing
# ---------------------------------------------------------------------------

def _run_script(args: list[str]) -> tuple[int, str, str]:
    result = subprocess.run(
        args, cwd=str(_SCRIPTS_DIR),
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    return result.returncode, result.stdout, result.stderr


def _run_post_processing(project_path: Path) -> None:
    _update_status(project_path, stage="post_processing", message="Splitting speaker notes...")
    _run_script([sys.executable, str(_SCRIPTS_DIR / "total_md_split.py"), str(project_path)])

    _update_status(project_path, stage="post_processing", message="Finalizing SVGs...")
    code, _, stderr = _run_script([sys.executable, str(_SCRIPTS_DIR / "finalize_svg.py"), str(project_path)])
    if code != 0:
        raise RuntimeError(f"SVG finalization failed: {stderr}")

    _update_status(project_path, stage="post_processing", message="Exporting PPTX...")
    code, _, stderr = _run_script([sys.executable, str(_SCRIPTS_DIR / "svg_to_pptx.py"), str(project_path)])
    if code != 0:
        raise RuntimeError(f"PPTX export failed: {stderr}")


def _run_quality_check_with_retry(
    project_path: Path,
    system_prompt: str,
    canvas_info: dict,
    max_retries: int = 2,
) -> list[str]:
    """Run quality check, and if errors found, ask LLM to fix SVGs and retry.

    Returns list of remaining error messages (empty if all fixed).
    """
    svg_dir = project_path / "svg_output"
    if not svg_dir.exists() or not list(svg_dir.glob("*.svg")):
        return []

    for attempt in range(max_retries + 1):
        code, stdout, stderr = _run_script([
            sys.executable, str(_SCRIPTS_DIR / "svg_quality_checker.py"), str(svg_dir),
        ])

        if code == 0:
            return []  # all good

        errors = [line for line in stdout.splitlines() if "[ERROR]" in line]
        warnings = [line for line in stdout.splitlines() if "[WARNING]" in line]

        if not errors:
            return []  # only warnings, no errors

        if attempt == max_retries:
            # Last attempt, return remaining errors
            return errors

        _update_status(
            project_path,
            stage="quality_check",
            message=f"Quality check found {len(errors)} error(s), attempting auto-fix (attempt {attempt + 1}/{max_retries})...",
        )

        # Try to fix the offending SVGs
        errors_by_file: dict[str, list[str]] = {}
        for err_line in errors:
            # Extract filename from error line like "[ERROR] 03_page.svg: ..."
            file_match = re.search(r"(\d{2}_\S+\.svg)", err_line)
            if file_match:
                fname = file_match.group(1)
                errors_by_file.setdefault(fname, []).append(err_line)

        fixed_count = 0
        for fname, file_errors in errors_by_file.items():
            svg_path = svg_dir / fname
            if not svg_path.exists():
                continue

            svg_content = svg_path.read_text(encoding="utf-8")
            error_summary = "\n".join(file_errors[:5])

            fix_prompt = f"""The following SVG has quality check errors. Fix ONLY the errors listed below. Output the corrected SVG code.

=== ERRORS ===
{error_summary}

=== ORIGINAL SVG ===
{svg_content}

=== RULES ===
- Fix only the reported errors. Do NOT change layout, colors, or content.
- Keep the same viewBox: {canvas_info.get('viewbox', '0 0 1280 720')}
- No <mask>, <style>, class, foreignObject, textPath, @font-face, <animate>, <script>
- No rgba() — use fill-opacity instead
- No group opacity — set opacity on individual elements
- Every font-family must end with a pre-installed font

Output ONLY the corrected SVG code between delimiters:
===FIXED_SVG_START===
(corrected SVG)
===FIXED_SVG_END==="""

            try:
                response = generate_text(system_prompt, fix_prompt, max_tokens=16000, role="executor")
                fixed_match = re.search(
                    r"===FIXED_SVG_START===\s*\n(.*?)\n\s*===FIXED_SVG_END===",
                    response, re.DOTALL,
                )
                if fixed_match:
                    fixed_svg = fixed_match.group(1).strip()
                    if fixed_svg and "<svg" in fixed_svg:
                        svg_path.write_text(fixed_svg, encoding="utf-8")
                        fixed_count += 1
                else:
                    # Fallback: try to extract raw <svg>
                    raw_match = re.search(r"(<svg[^>]*>.*?</svg>)", response, re.DOTALL)
                    if raw_match:
                        svg_path.write_text(raw_match.group(1).strip(), encoding="utf-8")
                        fixed_count += 1
            except Exception:
                pass

        if fixed_count == 0:
            # Couldn't fix anything, no point retrying
            return errors

    return errors


# ---------------------------------------------------------------------------
# Main entry
# ---------------------------------------------------------------------------

def run_generation_pipeline(
    project_path: Path,
    *,
    style: str | None = None,
    page_count: int | None = None,
    image_mode: str = "auto",
) -> None:
    """Run the full generation pipeline (called from a background thread)."""
    started = datetime.now(timezone.utc).isoformat()
    _update_status(
        project_path,
        status="running",
        stage="strategist",
        message="Starting generation pipeline...",
        error=None,
        started_at=started,
    )

    try:
        canvas_format = _detect_canvas_format(project_path)
        resolved_style = (style or "general").replace("_", " ")
        canvas_info = config.CANVAS_FORMATS.get(canvas_format, config.CANVAS_FORMATS["ppt169"])

        # 1. Read sources
        sources_md = _read_sources(project_path)
        if not sources_md.strip():
            raise ValueError("No source content found in sources/ directory")

        # 2. Strategist (with content analysis + eight confirmations + page structure)
        _run_strategist(project_path, sources_md, canvas_format, style, page_count)

        # 3. Images
        _run_image_generation(project_path, image_mode)

        # 4. Executor (with per-page spec_lock re-read, rhythm, layout, chart directives)
        _run_executor(project_path, canvas_format, style or "general", page_count)

        # 5. Quality check with auto-fix retry
        _update_status(project_path, stage="quality_check", message="Running quality check...")
        system_prompt = _build_executor_prompt(style or "general")
        remaining_errors = _run_quality_check_with_retry(
            project_path, system_prompt, canvas_info, max_retries=2,
        )
        if remaining_errors:
            # Log errors but don't abort — continue with post-processing
            (project_path / "quality_errors.log").write_text(
                "\n".join(remaining_errors), encoding="utf-8",
            )
            _update_status(
                project_path,
                stage="quality_check",
                message=f"Quality check: {len(remaining_errors)} error(s) remain after auto-fix. Continuing with post-processing.",
            )

        # 6. Post-processing
        _run_post_processing(project_path)

        _update_status(project_path, status="completed", stage="done", message="Generation complete!")

    except Exception as e:
        _update_status(
            project_path,
            status="error",
            message=f"Generation failed: {e}",
            error=str(e),
        )
