"""Project management endpoints."""

from __future__ import annotations

import json
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from pydantic import BaseModel

import config

router = APIRouter()

_PROJECTS_DIR = config.PROJECTS_DIR


class CreateProjectRequest(BaseModel):
    name: str
    canvas_format: str = "ppt169"


class RenameProjectRequest(BaseModel):
    name: str


class ImportUrlRequest(BaseModel):
    url: str


def _read_project_meta(project_path: Path) -> dict:
    """Read project.json if it exists, return {} otherwise."""
    meta_file = project_path / "project.json"
    if meta_file.exists():
        try:
            return json.loads(meta_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def _write_project_meta(project_path: Path, meta: dict) -> None:
    meta_file = project_path / "project.json"
    meta_file.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")


def _resolve_project(project_id: str) -> Path:
    """Resolve a project ID (directory name) to its full path."""
    matches = [d for d in _PROJECTS_DIR.iterdir() if d.is_dir() and d.name == project_id]
    if not matches:
        raise HTTPException(404, f"Project not found: {project_id}")
    return matches[0]


def _project_id(path: Path) -> str:
    return path.name


def _scan_projects() -> list[dict]:
    if not _PROJECTS_DIR.exists():
        return []
    projects = []
    for d in sorted(_PROJECTS_DIR.iterdir(), reverse=True):
        if not d.is_dir():
            continue
        svg_dir = d / "svg_output"
        svg_count = len(list(svg_dir.glob("*.svg"))) if svg_dir.exists() else 0
        has_spec = (d / "design_spec.md").exists()
        has_source = (d / "sources").exists() and any((d / "sources").iterdir()) if (d / "sources").exists() else False
        exports_dir = d / "exports"
        export_count = len(list(exports_dir.glob("*.pptx"))) if exports_dir.exists() else 0

        # Parse format from directory name (name_format_date)
        parts = d.name.rsplit("_", 2)
        canvas_format = parts[-2] if len(parts) >= 3 else "unknown"

        # Determine pipeline stage from filesystem state
        svg_final_dir = d / "svg_final"
        final_count = len(list(svg_final_dir.glob("*.svg"))) if svg_final_dir.exists() else 0
        if export_count > 0:
            stage = "exported"
        elif final_count > 0:
            stage = "finalized"
        elif svg_count > 0:
            stage = "svg_generated"
        elif has_spec:
            stage = "spec_ready"
        else:
            stage = "initialized"

        # Prefer display name from project.json, fall back to directory name parsing
        meta = _read_project_meta(d)
        display_name = meta.get("name") or (parts[0] if len(parts) >= 3 else d.name)

        projects.append({
            "id": d.name,
            "name": display_name,
            "path": str(d),
            "canvas_format": canvas_format,
            "svg_count": svg_count,
            "has_spec": has_spec,
            "has_source": has_source,
            "export_count": export_count,
            "stage": stage,
            "created_at": d.stat().st_mtime,
        })
    return projects


@router.get("")
def list_projects():
    return _scan_projects()


@router.post("")
def create_project(req: CreateProjectRequest):
    from project_manager import ProjectManager

    manager = ProjectManager(base_dir=str(_PROJECTS_DIR))
    try:
        project_path = manager.init_project(req.name, canvas_format=req.canvas_format)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except FileExistsError as e:
        raise HTTPException(409, str(e))

    return {"id": Path(project_path).name, "path": project_path}


@router.get("/{project_id}")
def get_project(project_id: str):
    project_path = _resolve_project(project_id)
    from project_manager import ProjectManager

    manager = ProjectManager()
    info = manager.get_project_info(str(project_path))
    info["id"] = project_id
    return info


@router.delete("/{project_id}")
def delete_project(project_id: str):
    project_path = _resolve_project(project_id)
    shutil.rmtree(project_path)
    return {"deleted": project_id}


@router.patch("/{project_id}")
def rename_project(project_id: str, req: RenameProjectRequest):
    project_path = _resolve_project(project_id)
    name = req.name.strip()
    if not name:
        raise HTTPException(400, "Name cannot be empty")
    meta = _read_project_meta(project_path)
    meta["name"] = name
    _write_project_meta(project_path, meta)
    return {"id": project_id, "name": name}


@router.post("/{project_id}/sources")
async def upload_sources(project_id: str, files: list[UploadFile] = File(...)):
    project_path = _resolve_project(project_id)
    from project_manager import ProjectManager

    manager = ProjectManager()
    saved_paths = []

    with tempfile.TemporaryDirectory() as tmp_dir:
        for f in files:
            tmp_path = Path(tmp_dir) / f.filename
            content = await f.read()
            tmp_path.write_bytes(content)
            saved_paths.append(str(tmp_path))

        summary = manager.import_sources(str(project_path), saved_paths, copy=True)

    return summary


@router.post("/{project_id}/sources/url")
def import_url(project_id: str, req: ImportUrlRequest):
    project_path = _resolve_project(project_id)
    from project_manager import ProjectManager

    manager = ProjectManager()
    try:
        summary = manager.import_sources(str(project_path), [req.url])
    except Exception as e:
        raise HTTPException(400, str(e))
    return summary


@router.get("/{project_id}/slides")
def list_slides(project_id: str):
    project_path = _resolve_project(project_id)
    svg_dir = project_path / "svg_output"
    if not svg_dir.exists():
        return []
    slides = []
    for svg_file in sorted(svg_dir.glob("*.svg")):
        slides.append({
            "name": svg_file.stem,
            "filename": svg_file.name,
            "size": svg_file.stat().st_size,
        })
    return slides


@router.get("/{project_id}/slides/{slide_name}")
def get_slide_svg(project_id: str, slide_name: str):
    project_path = _resolve_project(project_id)
    svg_dir = project_path / "svg_output"
    svg_file = svg_dir / f"{slide_name}.svg"
    if not svg_file.exists():
        raise HTTPException(404, f"Slide not found: {slide_name}")
    return {"name": slide_name, "svg": svg_file.read_text(encoding="utf-8")}


@router.get("/{project_id}/exports")
def list_exports(project_id: str):
    project_path = _resolve_project(project_id)
    exports_dir = project_path / "exports"
    if not exports_dir.exists():
        return []
    return [
        {
            "name": f.name,
            "size": f.stat().st_size,
            "created": f.stat().st_mtime,
        }
        for f in sorted(exports_dir.glob("*.pptx"), reverse=True)
    ]


@router.get("/{project_id}/exports/{filename}")
def download_export(project_id: str, filename: str):
    from fastapi.responses import FileResponse

    project_path = _resolve_project(project_id)
    file_path = project_path / "exports" / filename
    if not file_path.exists():
        raise HTTPException(404, f"Export not found: {filename}")
    return FileResponse(file_path, filename=filename, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")


@router.get("/{project_id}/sources")
def list_sources(project_id: str):
    project_path = _resolve_project(project_id)
    sources_dir = project_path / "sources"
    if not sources_dir.exists():
        return []
    return [
        {
            "name": f.name,
            "size": f.stat().st_size,
            "type": f.suffix,
        }
        for f in sorted(sources_dir.iterdir())
        if f.is_file()
    ]


@router.get("/{project_id}/files/{file_path:path}")
def serve_project_file(project_id: str, file_path: str):
    """Serve static files from a project directory (images, assets, etc.)."""
    from fastapi.responses import FileResponse
    import mimetypes

    project_path = _resolve_project(project_id)
    full_path = (project_path / file_path).resolve()

    # Prevent path traversal
    if not str(full_path).startswith(str(project_path.resolve())):
        raise HTTPException(403, "Access denied")
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(404, f"File not found: {file_path}")

    media_type = mimetypes.guess_type(str(full_path))[0] or "application/octet-stream"
    return FileResponse(full_path, media_type=media_type)


@router.delete("/{project_id}/slides/{slide_name}")
def delete_slide(project_id: str, slide_name: str):
    """Delete a single SVG slide from svg_output."""
    project_path = _resolve_project(project_id)
    svg_dir = project_path / "svg_output"
    svg_file = svg_dir / f"{slide_name}.svg"
    if not svg_file.exists():
        raise HTTPException(404, f"Slide not found: {slide_name}")
    svg_file.unlink()
    # Also remove from svg_final if present
    final_file = project_path / "svg_final" / f"{slide_name}.svg"
    if final_file.exists():
        final_file.unlink()
    # Remove notes file if present
    notes_file = project_path / "notes" / f"{slide_name}.md"
    if notes_file.exists():
        notes_file.unlink()
    return {"deleted": slide_name}


@router.get("/{project_id}/slides/{slide_name}/notes")
def get_slide_notes(project_id: str, slide_name: str):
    """Get speaker notes for a slide."""
    project_path = _resolve_project(project_id)
    notes_file = project_path / "notes" / f"{slide_name}.md"
    if notes_file.exists():
        return {"name": slide_name, "notes": notes_file.read_text(encoding="utf-8")}
    return {"name": slide_name, "notes": ""}


@router.post("/{project_id}/duplicate")
def duplicate_project(project_id: str):
    """Duplicate a project (copy all files to a new project directory)."""
    import time
    project_path = _resolve_project(project_id)
    meta = _read_project_meta(project_path)
    original_name = meta.get("name") or project_id.split("_")[0]

    # Parse canvas format from directory name
    parts = project_path.name.rsplit("_", 2)
    canvas_format = parts[-2] if len(parts) >= 3 else "ppt169"

    # Create new project directory
    timestamp = int(time.time())
    new_name = f"{original_name}_copy"
    new_dir_name = f"{new_name}_{canvas_format}_{timestamp}"
    new_path = _PROJECTS_DIR / new_dir_name
    if new_path.exists():
        raise HTTPException(409, "Duplicate project already exists")

    shutil.copytree(str(project_path), str(new_path))

    # Update project.json with new name
    new_meta = dict(meta)
    new_meta["name"] = new_name
    _write_project_meta(new_path, new_meta)

    return {"id": new_dir_name, "name": new_name, "path": str(new_path)}
