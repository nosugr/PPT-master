"""Template management endpoints."""

from __future__ import annotations

import json
import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

import config

router = APIRouter()

_LAYOUTS_DIR = config.TEMPLATES_DIR / "layouts"
_LAYOUTS_INDEX = _LAYOUTS_DIR / "layouts_index.json"


def _load_layouts_index() -> dict:
    if not _LAYOUTS_INDEX.exists():
        return {}
    return json.loads(_LAYOUTS_INDEX.read_text(encoding="utf-8"))


@router.get("")
def list_templates():
    index = _load_layouts_index()
    templates = []
    seen_ids = set()

    def _find_svgs(template_dir: Path) -> list[Path]:
        """Find SVG files in template root or svg/ subdirectory."""
        svgs = list(template_dir.glob("*.svg"))
        svg_sub = template_dir / "svg"
        if svg_sub.exists():
            svgs.extend(svg_sub.glob("*.svg"))
        svg_flat = template_dir / "svg-flat"
        if svg_flat.exists():
            svgs.extend(svg_flat.glob("*.svg"))
        return svgs

    def _find_cover(template_dir: Path, svgs: list[Path]) -> str | None:
        for pattern in ["01_cover.svg", "001_cover.svg", "*cover*", "slide_01*"]:
            for svg in svgs:
                import fnmatch
                if fnmatch.fnmatch(svg.name, pattern):
                    # Return relative path from template_dir
                    try:
                        return str(svg.relative_to(template_dir)).replace("\\", "/")
                    except ValueError:
                        return svg.name
        return svgs[0].name if svgs else None

    # First: templates from the index
    for template_id, meta in index.items():
        template_dir = _LAYOUTS_DIR / template_id
        if not template_dir.exists():
            continue
        seen_ids.add(template_id)

        svgs = _find_svgs(template_dir)
        cover_svg = _find_cover(template_dir, svgs)

        templates.append({
            "id": template_id,
            "summary": meta.get("summary", ""),
            "keywords": meta.get("keywords", []),
            "svg_count": len(svgs),
            "cover_svg": cover_svg,
            "has_design_spec": (template_dir / "design_spec.md").exists(),
            "source": "official",
        })

    # Second: directories not in the index
    if _LAYOUTS_DIR.exists():
        for template_dir in sorted(_LAYOUTS_DIR.iterdir()):
            if not template_dir.is_dir():
                continue
            if template_dir.name.startswith("_"):
                continue
            if template_dir.name in seen_ids:
                continue

            svgs = _find_svgs(template_dir)
            if not svgs:
                continue

            cover_svg = _find_cover(template_dir, svgs)

            # Try to read summary from summary.md
            summary = ""
            summary_file = template_dir / "summary.md"
            if summary_file.exists():
                content = summary_file.read_text(encoding="utf-8")
                # Take first non-empty line as summary
                for line in content.splitlines():
                    line = line.strip().lstrip("#").strip()
                    if line:
                        summary = line[:100]
                        break

            templates.append({
                "id": template_dir.name,
                "summary": summary,
                "keywords": [],
                "svg_count": len(svgs),
                "cover_svg": cover_svg,
                "has_design_spec": (template_dir / "design_spec.md").exists(),
                "source": "user",
            })

    return templates


@router.get("/{template_id}")
def get_template(template_id: str):
    template_dir = _LAYOUTS_DIR / template_id
    if not template_dir.exists():
        raise HTTPException(404, f"Template not found: {template_id}")

    index = _load_layouts_index()
    meta = index.get(template_id, {})

    # Read design_spec.md if it exists
    design_spec = None
    spec_file = template_dir / "design_spec.md"
    if spec_file.exists():
        design_spec = spec_file.read_text(encoding="utf-8")

    # List SVG files (root + svg/ + svg-flat/)
    svgs = []
    for search_dir in [template_dir, template_dir / "svg", template_dir / "svg-flat"]:
        if not search_dir.exists():
            continue
        for svg_file in sorted(search_dir.glob("*.svg")):
            rel_path = str(svg_file.relative_to(template_dir)).replace("\\", "/")
            svgs.append({
                "name": svg_file.stem,
                "filename": rel_path,
                "size": svg_file.stat().st_size,
            })

    # List asset files (root + assets/)
    assets = []
    for search_dir in [template_dir, template_dir / "assets"]:
        if not search_dir.exists():
            continue
        for ext in ("*.png", "*.jpg", "*.jpeg"):
            for asset_file in sorted(search_dir.glob(ext)):
                assets.append({
                    "name": asset_file.name,
                    "size": asset_file.stat().st_size,
                })

    # Read summary if no design_spec
    summary = meta.get("summary", "")
    if not summary:
        summary_file = template_dir / "summary.md"
        if summary_file.exists():
            content = summary_file.read_text(encoding="utf-8")
            for line in content.splitlines():
                line = line.strip().lstrip("#").strip()
                if line:
                    summary = line[:200]
                    break

    return {
        "id": template_id,
        "summary": summary,
        "keywords": meta.get("keywords", []),
        "design_spec": design_spec,
        "svgs": svgs,
        "assets": assets,
    }


@router.get("/{template_id}/svg/{filename:path}")
def get_template_svg(template_id: str, filename: str):
    template_dir = _LAYOUTS_DIR / template_id
    svg_file = template_dir / filename
    if not svg_file.exists() or not filename.endswith(".svg"):
        raise HTTPException(404, f"SVG not found: {filename}")

    svg_content = svg_file.read_text(encoding="utf-8")

    # Replace relative image paths with API URLs so the browser can load them
    import re
    from urllib.parse import quote

    def replace_href(match):
        attr = match.group(1)  # href or xlink:href
        path = match.group(2)
        # Skip data URIs and absolute URLs
        if path.startswith("data:") or path.startswith("http"):
            return match.group(0)
        # Strip any leading ./ or ../
        clean = path.lstrip("./")
        # URL-encode the filename to handle Chinese characters and spaces
        encoded = quote(clean, safe="")
        return f'{attr}="/api/templates/{quote(template_id, safe="")}/assets/{encoded}"'

    svg_content = re.sub(
        r'((?:xlink:)?href)="([^"]+\.(png|jpg|jpeg|gif|webp|svg))"',
        replace_href,
        svg_content,
        flags=re.IGNORECASE,
    )

    return {"filename": filename, "svg": svg_content}


@router.get("/{template_id}/assets/{filename:path}")
def get_template_asset(template_id: str, filename: str):
    from fastapi.responses import FileResponse
    template_dir = _LAYOUTS_DIR / template_id
    # Search in root, assets/, and svg/ subdirectories
    for search_dir in [template_dir, template_dir / "assets", template_dir / "svg"]:
        asset_file = search_dir / filename
        if asset_file.exists():
            return FileResponse(str(asset_file))
    raise HTTPException(404, f"Asset not found: {filename}")


@router.delete("/{template_id}")
def delete_template(template_id: str):
    """Delete a user-uploaded template. Official templates (in layouts_index.json) are protected."""
    template_dir = _LAYOUTS_DIR / template_id
    if not template_dir.exists():
        raise HTTPException(404, f"Template not found: {template_id}")

    index = _load_layouts_index()
    if template_id in index:
        raise HTTPException(403, "Cannot delete official templates")

    shutil.rmtree(template_dir)
    return {"deleted": template_id}


@router.post("/upload")
async def upload_template(file: UploadFile = File(...)):
    """Upload a .pptx file and extract it as a template."""
    if not file.filename or not file.filename.lower().endswith(".pptx"):
        raise HTTPException(400, "Only .pptx files are accepted")

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir) / file.filename
        content = await file.read()
        tmp_path.write_bytes(content)

        output_dir = Path(tmp_dir) / "output"
        output_dir.mkdir()

        # Run pptx_template_import.py
        import sys

        sys.argv = [
            "pptx_template_import",
            str(tmp_path),
            "-o",
            str(output_dir),
            "--inheritance-mode",
            "flat",
        ]

        try:
            from pptx_template_import import main as import_main

            exit_code = import_main()
            if exit_code != 0:
                raise HTTPException(500, "Template import failed")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(500, f"Template import error: {e}")

        # Collect results
        manifest = None
        manifest_path = output_dir / "manifest.json"
        if manifest_path.exists():
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        svg_files = []
        svg_dir = output_dir / "svg-flat"
        if not svg_dir.exists():
            svg_dir = output_dir / "svg"
        if svg_dir.exists():
            for svg_file in sorted(svg_dir.glob("*.svg")):
                svg_files.append({
                    "name": svg_file.stem,
                    "filename": svg_file.name,
                    "size": svg_file.stat().st_size,
                })

        summary_md = None
        summary_path = output_dir / "summary.md"
        if summary_path.exists():
            summary_md = summary_path.read_text(encoding="utf-8")

        # Move result to a temp staging area (user must confirm registration)
        staging_dir = config.TEMPLATES_DIR / "_staging" / file.filename.rsplit(".", 1)[0]
        staging_dir.parent.mkdir(parents=True, exist_ok=True)
        if staging_dir.exists():
            shutil.rmtree(staging_dir)
        shutil.copytree(output_dir, staging_dir)

    return {
        "staging_id": staging_dir.name,
        "staging_path": str(staging_dir),
        "slide_count": len(svg_files),
        "svgs": svg_files,
        "summary": summary_md,
        "manifest": manifest,
    }


@router.post("/{staging_id}/register")
def register_template(staging_id: str):
    """Register a staged template import into the template library."""
    staging_dir = config.TEMPLATES_DIR / "_staging" / staging_id
    if not staging_dir.exists():
        raise HTTPException(404, f"Staging not found: {staging_id}")

    # Move to layouts directory
    target_dir = _LAYOUTS_DIR / staging_id
    if target_dir.exists():
        raise HTTPException(409, f"Template already exists: {staging_id}")

    shutil.copytree(staging_dir, target_dir)
    shutil.rmtree(staging_dir)

    # Try to register in the index
    try:
        import sys

        sys.argv = ["register_template", staging_id]
        from register_template import main as register_main

        register_main()
    except Exception:
        pass  # Registration is best-effort

    return {"registered": staging_id, "path": str(target_dir)}
