"""Pipeline operation endpoints (finalize, export, quality check, generate)."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import shutil
import threading
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import config

router = APIRouter()

_SCRIPTS_DIR = config.SCRIPTS_DIR
_PROJECTS_DIR = config.PROJECTS_DIR


class ExportRequest(BaseModel):
    transition: str = "fade"
    transition_duration: float = 0.5
    animation: str | None = None
    animation_duration: float = 0.4
    only: str = "native"  # "native" or "legacy"
    export_path: str | None = None  # custom output directory


class FinalizeRequest(BaseModel):
    compress: bool = False
    max_dimension: int = 2000


class GenerateRequest(BaseModel):
    style: str | None = None       # "general", "consultant", "consultant_top"
    page_count: int | None = None  # override auto-detected page count
    image_mode: str = "auto"       # "auto", "skip", "placeholder"
    template_id: str | None = None # template to apply (from template library)


class StrategistRequest(BaseModel):
    style: str | None = None
    page_count: int | None = None
    template_id: str | None = None


class ConfirmRequest(BaseModel):
    confirmations: str | None = None   # user-edited confirmations.md content
    page_structure: str | None = None  # user-edited page_structure.md content
    style: str | None = None
    page_count: int | None = None
    image_mode: str = "auto"


class ExecutorRequest(BaseModel):
    style: str | None = None
    page_count: int | None = None
    image_mode: str = "auto"


def _resolve_project(project_id: str) -> Path:
    matches = [d for d in _PROJECTS_DIR.iterdir() if d.is_dir() and d.name == project_id]
    if not matches:
        raise HTTPException(404, f"Project not found: {project_id}")
    return matches[0]


def _run_script(args: list[str], cwd: str | None = None) -> tuple[int, str, str]:
    """Run a Python script and return (exit_code, stdout, stderr)."""
    result = subprocess.run(
        args,
        cwd=cwd or str(_SCRIPTS_DIR),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return result.returncode, result.stdout, result.stderr


@router.post("/{project_id}/finalize")
def finalize_svg(project_id: str, req: FinalizeRequest | None = None):
    project_path = _resolve_project(project_id)
    args = [sys.executable, str(_SCRIPTS_DIR / "finalize_svg.py"), str(project_path), "--quiet"]
    if req and req.compress:
        args.extend(["--compress", "--max-dimension", str(req.max_dimension)])

    code, stdout, stderr = _run_script(args)
    if code != 0:
        raise HTTPException(500, detail=stderr or stdout or "Finalize failed")
    return {"status": "ok", "output": stdout.strip()}


@router.post("/{project_id}/split-notes")
def split_notes(project_id: str):
    project_path = _resolve_project(project_id)
    args = [sys.executable, str(_SCRIPTS_DIR / "total_md_split.py"), str(project_path), "--quiet"]

    code, stdout, stderr = _run_script(args)
    if code != 0:
        raise HTTPException(500, detail=stderr or stdout or "Notes split failed")
    return {"status": "ok", "output": stdout.strip()}


@router.post("/{project_id}/export")
def export_pptx(project_id: str, req: ExportRequest | None = None):
    project_path = _resolve_project(project_id)
    req = req or ExportRequest()

    args = [
        sys.executable,
        str(_SCRIPTS_DIR / "svg_to_pptx.py"),
        str(project_path),
        "--only",
        req.only,
        "-t",
        req.transition,
        "--transition-duration",
        str(req.transition_duration),
        "-q",
    ]
    if req.animation:
        args.extend(["-a", req.animation, "--animation-duration", str(req.animation_duration)])

    code, stdout, stderr = _run_script(args)
    if code != 0:
        raise HTTPException(500, detail=stderr or stdout or "Export failed")

    # Find the latest export
    exports_dir = project_path / "exports"
    pptx_files = sorted(exports_dir.glob("*.pptx"), key=lambda f: f.stat().st_mtime, reverse=True)
    latest = pptx_files[0] if pptx_files else None

    # Copy to custom export path if specified
    if latest and req.export_path:
        try:
            custom_dir = Path(req.export_path)
            custom_dir.mkdir(parents=True, exist_ok=True)
            dest = custom_dir / latest.name
            shutil.copy2(str(latest), str(dest))
        except Exception as e:
            pass  # non-blocking, original export still succeeded

    return {
        "status": "ok",
        "output": stdout.strip(),
        "export": {
            "name": latest.name if latest else None,
            "size": latest.stat().st_size if latest else 0,
        } if latest else None,
    }


@router.post("/{project_id}/quality-check")
def quality_check(project_id: str):
    project_path = _resolve_project(project_id)
    svg_dir = project_path / "svg_output"

    if not svg_dir.exists() or not list(svg_dir.glob("*.svg")):
        return {"status": "no_svgs", "errors": [], "warnings": []}

    args = [sys.executable, str(_SCRIPTS_DIR / "svg_quality_checker.py"), str(svg_dir)]
    code, stdout, stderr = _run_script(args)

    return {
        "status": "ok" if code == 0 else "issues_found",
        "output": stdout.strip(),
        "errors": [line for line in stdout.splitlines() if "[ERROR]" in line],
        "warnings": [line for line in stdout.splitlines() if "[WARN]" in line],
    }


@router.get("/{project_id}/design-spec")
def get_design_spec(project_id: str):
    """Return design_spec.md content."""
    project_path = _resolve_project(project_id)
    spec_file = project_path / "design_spec.md"
    if not spec_file.exists():
        raise HTTPException(404, "design_spec.md not found. Run Strategist first.")
    return {"content": spec_file.read_text(encoding="utf-8")}


@router.get("/{project_id}/spec-lock")
def get_spec_lock(project_id: str):
    """Return spec_lock.md content."""
    project_path = _resolve_project(project_id)
    lock_file = project_path / "spec_lock.md"
    if not lock_file.exists():
        raise HTTPException(404, "spec_lock.md not found. Run Strategist first.")
    return {"content": lock_file.read_text(encoding="utf-8")}


@router.get("/{project_id}/quality-report")
def get_quality_report(project_id: str):
    """Return quality check results."""
    project_path = _resolve_project(project_id)

    errors_file = project_path / "quality_errors.log"
    errors = []
    if errors_file.exists():
        errors = [line.strip() for line in errors_file.read_text(encoding="utf-8").splitlines() if line.strip()]

    status_file = project_path / "generation_status.json"
    status_data = {}
    if status_file.exists():
        try:
            status_data = json.loads(status_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass

    return {
        "errors": errors,
        "stage": status_data.get("stage"),
        "message": status_data.get("message", ""),
    }


@router.get("/{project_id}/status")
def project_status(project_id: str):
    project_path = _resolve_project(project_id)

    svg_dir = project_path / "svg_output"
    svg_count = len(list(svg_dir.glob("*.svg"))) if svg_dir.exists() else 0

    svg_final_dir = project_path / "svg_final"
    final_count = len(list(svg_final_dir.glob("*.svg"))) if svg_final_dir.exists() else 0

    exports_dir = project_path / "exports"
    export_count = len(list(exports_dir.glob("*.pptx"))) if exports_dir.exists() else 0

    notes_dir = project_path / "notes"
    note_count = len(list(notes_dir.glob("*.md"))) if notes_dir.exists() else 0

    has_spec = (project_path / "design_spec.md").exists()

    # Determine pipeline stage
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

    # Read display name from project.json if available
    meta_file = project_path / "project.json"
    display_name = None
    if meta_file.exists():
        try:
            import json as _json
            display_name = _json.loads(meta_file.read_text(encoding="utf-8")).get("name")
        except Exception:
            pass

    return {
        "id": project_id,
        "name": display_name,
        "stage": stage,
        "svg_count": svg_count,
        "final_count": final_count,
        "export_count": export_count,
        "note_count": note_count,
        "has_spec": has_spec,
    }


@router.post("/{project_id}/generate")
def start_generation(project_id: str, req: GenerateRequest | None = None):
    """Start full PPT generation pipeline in a background thread."""
    project_path = _resolve_project(project_id)

    # Check no generation already running
    status_file = project_path / "generation_status.json"
    if status_file.exists():
        try:
            existing = json.loads(status_file.read_text(encoding="utf-8"))
            if existing.get("status") == "running":
                raise HTTPException(409, "Generation already in progress")
        except (json.JSONDecodeError, OSError):
            pass

    # Prerequisites: sources must exist
    sources_dir = project_path / "sources"
    if not sources_dir.exists() or not any(sources_dir.iterdir()):
        raise HTTPException(400, "No source materials found. Upload sources first.")

    # Check LLM config — LLM_API_KEY or any of OPENAI/DEEPSEEK/MIMO key works
    config.load_prefixed_env_file(prefixes=("LLM", "OPENAI", "DEEPSEEK", "MIMO"))
    has_key = os.environ.get("LLM_API_KEY") or any(os.environ.get(f"{p}_API_KEY") for p in ("OPENAI", "DEEPSEEK", "MIMO"))
    if not has_key:
        raise HTTPException(
            400,
            "No LLM API key configured. Set a PPT Generation Model in the Settings page first.",
        )

    # Copy template to project if specified
    template_id = req.template_id if req else None
    if template_id:
        import shutil
        tmpl_src = config.TEMPLATES_DIR / "layouts" / template_id
        if not tmpl_src.exists():
            raise HTTPException(404, f"Template not found: {template_id}")
        tmpl_dst = project_path / "templates"
        if tmpl_dst.exists():
            shutil.rmtree(tmpl_dst)
        shutil.copytree(tmpl_src, tmpl_dst)

    # Start background thread
    from generator import run_generation_pipeline

    thread = threading.Thread(
        target=run_generation_pipeline,
        args=(project_path,),
        kwargs={
            "style": req.style if req else None,
            "page_count": req.page_count if req else None,
            "image_mode": req.image_mode if req else "auto",
        },
        daemon=True,
    )
    thread.start()

    return {"status": "started", "project_id": project_id}


@router.get("/{project_id}/generation-status")
def generation_status(project_id: str):
    """Get real-time generation progress."""
    project_path = _resolve_project(project_id)
    status_file = project_path / "generation_status.json"

    if not status_file.exists():
        return {"status": "idle"}

    try:
        return json.loads(status_file.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {"status": "idle"}


@router.post("/{project_id}/generate/strategist")
def generate_strategist(project_id: str, req: StrategistRequest | None = None):
    """Run only the Strategist phase. Returns intermediate artifacts for review."""
    project_path = _resolve_project(project_id)

    # Check no generation already running
    status_file = project_path / "generation_status.json"
    if status_file.exists():
        try:
            existing = json.loads(status_file.read_text(encoding="utf-8"))
            if existing.get("status") == "running":
                raise HTTPException(409, "Generation already in progress")
        except (json.JSONDecodeError, OSError):
            pass

    # Prerequisites
    sources_dir = project_path / "sources"
    if not sources_dir.exists() or not any(sources_dir.iterdir()):
        raise HTTPException(400, "No source materials found. Upload sources first.")

    config.load_prefixed_env_file(prefixes=("LLM", "OPENAI", "DEEPSEEK", "MIMO"))
    has_key = os.environ.get("LLM_API_KEY") or any(os.environ.get(f"{p}_API_KEY") for p in ("OPENAI", "DEEPSEEK", "MIMO"))
    if not has_key:
        raise HTTPException(400, "No LLM API key configured. Set a PPT Generation Model in the Settings page first.")

    # Copy template if specified
    template_id = req.template_id if req else None
    if template_id:
        tmpl_src = config.TEMPLATES_DIR / "layouts" / template_id
        if not tmpl_src.exists():
            raise HTTPException(404, f"Template not found: {template_id}")
        tmpl_dst = project_path / "templates"
        if tmpl_dst.exists():
            shutil.rmtree(tmpl_dst)
        shutil.copytree(tmpl_src, tmpl_dst)

    from generator import run_strategist_only

    try:
        result = run_strategist_only(
            project_path,
            style=req.style if req else None,
            page_count=req.page_count if req else None,
        )
        return {"status": "ok", **result}
    except Exception as e:
        raise HTTPException(500, detail=str(e))


@router.post("/{project_id}/generate/confirm")
def confirm_and_generate(project_id: str, req: ConfirmRequest):
    """User confirms/edits Strategist output, then runs Executor + post-processing."""
    project_path = _resolve_project(project_id)

    # Check no generation already running
    status_file = project_path / "generation_status.json"
    if status_file.exists():
        try:
            existing = json.loads(status_file.read_text(encoding="utf-8"))
            if existing.get("status") == "running":
                raise HTTPException(409, "Generation already in progress")
        except (json.JSONDecodeError, OSError):
            pass

    # Prerequisites: spec_lock must exist
    if not (project_path / "spec_lock.md").exists():
        raise HTTPException(400, "spec_lock.md not found. Run Strategist first.")

    config.load_prefixed_env_file(prefixes=("LLM", "OPENAI", "DEEPSEEK", "MIMO"))
    has_key = os.environ.get("LLM_API_KEY") or any(os.environ.get(f"{p}_API_KEY") for p in ("OPENAI", "DEEPSEEK", "MIMO"))
    if not has_key:
        raise HTTPException(400, "No LLM API key configured.")

    from generator import run_confirm_and_generate

    thread = threading.Thread(
        target=run_confirm_and_generate,
        args=(project_path,),
        kwargs={
            "confirmations": req.confirmations,
            "page_structure": req.page_structure,
            "style": req.style,
            "page_count": req.page_count,
            "image_mode": req.image_mode,
        },
        daemon=True,
    )
    thread.start()

    return {"status": "started", "project_id": project_id, "phase": "executor"}


@router.post("/{project_id}/generate/executor")
def generate_executor(project_id: str, req: ExecutorRequest | None = None):
    """Run only Executor + post-processing. Assumes spec_lock.md exists."""
    project_path = _resolve_project(project_id)

    # Check no generation already running
    status_file = project_path / "generation_status.json"
    if status_file.exists():
        try:
            existing = json.loads(status_file.read_text(encoding="utf-8"))
            if existing.get("status") == "running":
                raise HTTPException(409, "Generation already in progress")
        except (json.JSONDecodeError, OSError):
            pass

    # Prerequisites
    if not (project_path / "spec_lock.md").exists():
        raise HTTPException(400, "spec_lock.md not found. Run Strategist first.")

    config.load_prefixed_env_file(prefixes=("LLM", "OPENAI", "DEEPSEEK", "MIMO"))
    has_key = os.environ.get("LLM_API_KEY") or any(os.environ.get(f"{p}_API_KEY") for p in ("OPENAI", "DEEPSEEK", "MIMO"))
    if not has_key:
        raise HTTPException(400, "No LLM API key configured.")

    from generator import run_executor_only

    thread = threading.Thread(
        target=run_executor_only,
        args=(project_path,),
        kwargs={
            "style": req.style if req else None,
            "page_count": req.page_count if req else None,
            "image_mode": req.image_mode if req else "auto",
        },
        daemon=True,
    )
    thread.start()

    return {"status": "started", "project_id": project_id, "phase": "executor"}
