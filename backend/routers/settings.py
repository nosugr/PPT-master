"""Settings management endpoints for API configuration."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import config

router = APIRouter()

# ---------------------------------------------------------------------------
# Alternate key mapping: primary -> list of aliases to check when reading
# ---------------------------------------------------------------------------

_ALTERNATE_KEYS: dict[str, list[str]] = {
    "QWEN_API_KEY": ["DASHSCOPE_API_KEY"],
    "ZHIPU_API_KEY": ["BIGMODEL_API_KEY"],
    "VOLCENGINE_API_KEY": ["ARK_API_KEY"],
    "FAL_KEY": ["FAL_API_KEY"],
    "REPLICATE_API_KEY": ["REPLICATE_API_TOKEN"],
    "COSYVOICE_API_KEY": ["DASHSCOPE_API_KEY"],
    "OPENAI_API_KEY": ["DEEPSEEK_API_KEY", "MIMO_API_KEY"],
    "OPENAI_BASE_URL": ["DEEPSEEK_BASE_URL", "MIMO_BASE_URL"],
    "OPENAI_MODEL": ["DEEPSEEK_MODEL", "MIMO_MODEL"],
}

# Reverse map: alias -> primary (for quick lookup)
_ALIAS_TO_PRIMARY: dict[str, str] = {}
for _primary, _aliases in _ALTERNATE_KEYS.items():
    for _alias in _aliases:
        _ALIAS_TO_PRIMARY[_alias] = _primary

# ---------------------------------------------------------------------------
# Static provider schema — the frontend renders forms dynamically from this
#
# Structure (flat, provider-based):
#   categories: display grouping for the UI
#   providers:  flat dict keyed by provider id
#     - name / description: display text
#     - tags: which services this provider supports ("image", "tts", "search")
#     - env_key: which .env selector this maps to (e.g. "IMAGE_BACKEND")
#     - env_value: value to write to env_key (e.g. "gemini", or "openai" for
#                  OpenAI-compatible providers like MiMo/DeepSeek)
#     - fields: config fields (API key, base URL, model, etc.)
# ---------------------------------------------------------------------------

SETTINGS_SCHEMA: dict = {
    "categories": [
        {
            "id": "llm",
            "name": "PPT Generation Model",
            "description": "LLM for generating design specs and SVG slides (required)",
            "providers": ["llm_deepseek", "llm_openai", "llm_qwen", "llm_custom"],
        },
        {
            "id": "image",
            "name": "Image Generation",
            "description": "AI image generation for slide illustrations",
            "providers": ["mimo", "gemini", "openai", "qwen", "volcengine"],
        },
        {
            "id": "tts",
            "name": "TTS",
            "description": "Text-to-speech for narration",
            "providers": ["edge", "elevenlabs", "minimax"],
        },
        {
            "id": "search",
            "name": "Image Search",
            "description": "Stock image search",
            "providers": ["pexels", "pixabay"],
        },
    ],
    "providers": {
        # ── LLM (PPT Generation) ─────────────────────────────────────
        "llm_deepseek": {
            "name": "DeepSeek",
            "description": "DeepSeek Chat — affordable and capable",
            "tags": ["llm"],
            "env_key": "LLM_PROVIDER",
            "env_value": "deepseek",
            "fields": [
                {"key": "LLM_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "LLM_BASE_URL", "label": "Base URL", "type": "text", "required": False, "default": "https://api.deepseek.com/v1"},
                {"key": "LLM_MODEL", "label": "Model", "type": "text", "required": False, "default": "deepseek-chat"},
            ],
        },
        "llm_openai": {
            "name": "OpenAI",
            "description": "GPT-4o and compatible models",
            "tags": ["llm"],
            "env_key": "LLM_PROVIDER",
            "env_value": "openai",
            "fields": [
                {"key": "LLM_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "LLM_BASE_URL", "label": "Base URL", "type": "text", "required": False, "default": "https://api.openai.com/v1"},
                {"key": "LLM_MODEL", "label": "Model", "type": "text", "required": False, "default": "gpt-4o"},
            ],
        },
        "llm_qwen": {
            "name": "Qwen (Tongyi)",
            "description": "Alibaba Qwen chat models",
            "tags": ["llm"],
            "env_key": "LLM_PROVIDER",
            "env_value": "qwen",
            "fields": [
                {"key": "LLM_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "LLM_BASE_URL", "label": "Base URL", "type": "text", "required": False, "default": "https://dashscope.aliyuncs.com/compatible-mode/v1"},
                {"key": "LLM_MODEL", "label": "Model", "type": "text", "required": False, "default": "qwen-plus"},
            ],
        },
        "llm_custom": {
            "name": "Custom (OpenAI-compatible)",
            "description": "Any OpenAI-compatible API endpoint",
            "tags": ["llm"],
            "env_key": "LLM_PROVIDER",
            "env_value": "custom",
            "fields": [
                {"key": "LLM_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "LLM_BASE_URL", "label": "Base URL", "type": "text", "required": True},
                {"key": "LLM_MODEL", "label": "Model", "type": "text", "required": True},
            ],
        },

        # ── Image Generation ──────────────────────────────────────
        "gemini": {
            "name": "Google Gemini",
            "description": "Google's multimodal AI",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "gemini",
            "fields": [
                {"key": "GEMINI_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "GEMINI_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "GEMINI_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "openai": {
            "name": "OpenAI",
            "description": "OpenAI DALL-E and compatible APIs",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "openai",
            "fields": [
                {"key": "OPENAI_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "OPENAI_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "OPENAI_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "mimo": {
            "name": "MiMo (Xiaomi)",
            "description": "Xiaomi MiMo vision model (OpenAI-compatible)",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "mimo",
            "fields": [
                {"key": "MIMO_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "MIMO_BASE_URL", "label": "Base URL", "type": "text", "required": False, "default": "https://api.xiaomimimo.com/v1"},
                {"key": "MIMO_MODEL", "label": "Model", "type": "text", "required": False, "default": "mimo-v2-flash"},
            ],
        },
        "deepseek": {
            "name": "DeepSeek",
            "description": "DeepSeek AI vision model (OpenAI-compatible)",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "openai",
            "fields": [
                {"key": "DEEPSEEK_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "DEEPSEEK_BASE_URL", "label": "Base URL", "type": "text", "required": False, "default": "https://api.deepseek.com/v1"},
                {"key": "DEEPSEEK_MODEL", "label": "Model", "type": "text", "required": False, "default": "deepseek-chat"},
            ],
        },
        "qwen": {
            "name": "Qwen (Tongyi)",
            "description": "Alibaba DashScope / Tongyi",
            "tags": ["image", "tts"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "qwen",
            "fields": [
                {"key": "QWEN_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "QWEN_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "QWEN_MODEL", "label": "Model", "type": "text", "required": False},
                {"key": "QWEN_TTS_BASE_URL", "label": "TTS Base URL", "type": "text", "required": False},
            ],
        },
        "zhipu": {
            "name": "Zhipu (GLM)",
            "description": "Zhipu AI GLM-Image",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "zhipu",
            "fields": [
                {"key": "ZHIPU_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "ZHIPU_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "ZHIPU_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "volcengine": {
            "name": "Volcengine (Seedream)",
            "description": "ByteDance Volcengine Seedream",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "volcengine",
            "fields": [
                {"key": "VOLCENGINE_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "VOLCENGINE_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "VOLCENGINE_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "minimax": {
            "name": "MiniMax",
            "description": "MiniMax image & TTS",
            "tags": ["image", "tts"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "minimax",
            "fields": [
                {"key": "MINIMAX_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "MINIMAX_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "MINIMAX_MODEL", "label": "Model", "type": "text", "required": False},
                {"key": "MINIMAX_TTS_BASE_URL", "label": "TTS Base URL", "type": "text", "required": False},
            ],
        },
        "modelscope": {
            "name": "ModelScope",
            "description": "Alibaba ModelScope community models",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "modelscope",
            "fields": [
                {"key": "MODELSCOPE_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "MODELSCOPE_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "MODELSCOPE_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "siliconflow": {
            "name": "SiliconFlow",
            "description": "SiliconFlow multi-model platform",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "siliconflow",
            "fields": [
                {"key": "SILICONFLOW_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "SILICONFLOW_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "SILICONFLOW_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "openrouter": {
            "name": "OpenRouter",
            "description": "OpenRouter multi-model aggregation",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "openrouter",
            "fields": [
                {"key": "OPENROUTER_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "OPENROUTER_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "OPENROUTER_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "fal": {
            "name": "fal.ai",
            "description": "fal.ai serverless AI platform",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "fal",
            "fields": [
                {"key": "FAL_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "FAL_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "FAL_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "replicate": {
            "name": "Replicate",
            "description": "Replicate hosted AI models",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "replicate",
            "fields": [
                {"key": "REPLICATE_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "REPLICATE_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "REPLICATE_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "stability": {
            "name": "Stability AI",
            "description": "Stability AI Stable Diffusion",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "stability",
            "fields": [
                {"key": "STABILITY_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "STABILITY_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "STABILITY_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "bfl": {
            "name": "Black Forest Labs",
            "description": "FLUX image generation models",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "bfl",
            "fields": [
                {"key": "BFL_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "BFL_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "BFL_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },
        "ideogram": {
            "name": "Ideogram",
            "description": "Ideogram AI image generation",
            "tags": ["image"],
            "env_key": "IMAGE_BACKEND",
            "env_value": "ideogram",
            "fields": [
                {"key": "IDEOGRAM_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "IDEOGRAM_BASE_URL", "label": "Base URL", "type": "text", "required": False},
                {"key": "IDEOGRAM_MODEL", "label": "Model", "type": "text", "required": False},
            ],
        },

        # ── TTS Only ─────────────────────────────────────────────
        "edge": {
            "name": "Microsoft Edge TTS",
            "description": "Free, zero-configuration TTS",
            "tags": ["tts"],
            "env_key": "TTS_PROVIDER",
            "env_value": "edge",
            "fields": [],
        },
        "elevenlabs": {
            "name": "ElevenLabs",
            "description": "High-quality AI voice synthesis",
            "tags": ["tts"],
            "env_key": "TTS_PROVIDER",
            "env_value": "elevenlabs",
            "fields": [
                {"key": "ELEVENLABS_API_KEY", "label": "API Key", "type": "password", "required": True},
            ],
        },
        "cosyvoice": {
            "name": "CosyVoice",
            "description": "Alibaba CosyVoice TTS",
            "tags": ["tts"],
            "env_key": "TTS_PROVIDER",
            "env_value": "cosyvoice",
            "fields": [
                {"key": "COSYVOICE_API_KEY", "label": "API Key", "type": "password", "required": True},
                {"key": "COSYVOICE_TTS_BASE_URL", "label": "Base URL", "type": "text", "required": False},
            ],
        },

        # ── Image Search Only ────────────────────────────────────
        "pexels": {
            "name": "Pexels",
            "description": "Free stock photos API",
            "tags": ["search"],
            "env_key": None,
            "env_value": None,
            "fields": [
                {"key": "PEXELS_API_KEY", "label": "API Key", "type": "password", "required": True},
            ],
        },
        "pixabay": {
            "name": "Pixabay",
            "description": "Free images and media API",
            "tags": ["search"],
            "env_key": None,
            "env_value": None,
            "fields": [
                {"key": "PIXABAY_API_KEY", "label": "API Key", "type": "password", "required": True},
            ],
        },
        "openverse": {
            "name": "Openverse",
            "description": "Open-source media search (free)",
            "tags": ["search"],
            "env_key": None,
            "env_value": None,
            "fields": [],
        },
        "wikimedia": {
            "name": "Wikimedia Commons",
            "description": "Wikimedia media repository (free)",
            "tags": ["search"],
            "env_key": None,
            "env_value": None,
            "fields": [],
        },
    },
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_MASK_RE = re.compile(r"^\*{4,}")


def _mask(value: str) -> str:
    """Mask an API key, showing only the last 4 characters."""
    if not value or len(value) <= 4:
        return value
    return "*" * (len(value) - 4) + value[-4:]


def _is_masked(value: str) -> bool:
    """Check whether a value looks like a masked key."""
    return bool(_MASK_RE.match(value))


def _read_env_as_dict(path: Path) -> dict[str, str]:
    """Parse a .env file into a dict (keys are upper-cased)."""
    result: dict[str, str] = {}
    if not path.exists():
        return result
    with path.open("r", encoding="utf-8") as fh:
        for raw_line in fh:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("export "):
                line = line[7:].lstrip()
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = config.strip_env_quotes(value.strip())
            if key:
                result[key] = value
    return result


def _write_env(path: Path, data: dict[str, str]) -> None:
    """Write a dict as a .env file, preserving insertion order."""
    path.parent.mkdir(parents=True, exist_ok=True)
    lines: list[str] = []
    for key, value in data.items():
        if value:
            lines.append(f"{key}={value}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def _resolve_with_alternates(raw: dict[str, str]) -> dict[str, str]:
    """
    Resolve alternate key names: for each primary key that has aliases,
    if the primary is empty but an alias has a value, copy the alias value
    under the primary key so the frontend sees it.
    """
    resolved = dict(raw)
    for primary, aliases in _ALTERNATE_KEYS.items():
        if not resolved.get(primary):
            for alias in aliases:
                if resolved.get(alias):
                    resolved[primary] = resolved[alias]
                    break
    return resolved


def _mask_sensitive(raw: dict[str, str]) -> dict[str, str]:
    """Mask all values that look like API keys/tokens."""
    masked: dict[str, str] = {}
    for k, v in raw.items():
        if v and (k.endswith("_API_KEY") or k.endswith("_API_TOKEN") or k == "FAL_KEY"):
            masked[k] = _mask(v)
        else:
            masked[k] = v
    return masked


# ---------------------------------------------------------------------------
# Request model
# ---------------------------------------------------------------------------

class SettingsUpdate(BaseModel):
    selectors: dict[str, str] = {}  # e.g. {"IMAGE_BACKEND": "openai", "TTS_PROVIDER": "edge"}
    values: dict[str, str] = {}     # field key -> value


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/schema")
def get_settings_schema():
    """Return the full provider schema for the frontend to render forms."""
    return SETTINGS_SCHEMA


@router.get("")
def get_settings():
    """Read current .env config with API keys masked."""
    env_path = config.resolve_env_path()
    if not env_path.exists():
        return {
            "exists": False,
            "path": str(env_path),
            "values": {},
            "image_backend": "",
            "tts_provider": "",
        }
    raw = _read_env_as_dict(env_path)
    resolved = _resolve_with_alternates(raw)
    masked = _mask_sensitive(resolved)
    raw_masked = _mask_sensitive(raw)
    return {
        "exists": True,
        "path": str(env_path),
        "values": masked,
        "raw_values": raw_masked,
        "image_backend": raw.get("IMAGE_BACKEND", ""),
        "tts_provider": raw.get("TTS_PROVIDER", ""),
        "llm_provider": raw.get("LLM_PROVIDER", ""),
    }


@router.post("/test")
async def test_llm_connection():
    """Test the configured LLM by making a minimal chat completion call."""
    env_path = config.resolve_env_path()
    raw = _read_env_as_dict(env_path)
    resolved = _resolve_with_alternates(raw)

    api_key = resolved.get("LLM_API_KEY", "")
    base_url = resolved.get("LLM_BASE_URL", "") or None
    model = resolved.get("LLM_MODEL", "") or "gpt-4o"

    if not api_key:
        raise HTTPException(status_code=400, detail="No LLM API key configured")

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key, base_url=base_url, timeout=15.0)
        resp = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Hi"}],
            max_tokens=1,
        )
        return {"ok": True, "model": resp.model or model}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("")
def update_settings(body: SettingsUpdate):
    """Write settings to ~/.ppt-master/.env (user-level config)."""
    target = config.USER_ENV_FILE
    existing = _read_env_as_dict(target) if target.exists() else {}

    # Merge selector keys (IMAGE_BACKEND, TTS_PROVIDER, etc.)
    for k, v in body.selectors.items():
        if v:
            existing[k] = v
        elif k in existing:
            del existing[k]

    # Merge field values
    for k, v in body.values.items():
        if v and not _is_masked(v):
            existing[k] = v
        elif not v and k in existing:
            del existing[k]

    _write_env(target, existing)
    return {"ok": True, "path": str(target)}


@router.get("/system-info")
def get_system_info():
    """Return system information: Python version, projects dir, disk usage."""
    import sys
    import shutil as _shutil

    python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    projects_dir = str(config.PROJECTS_DIR)

    # Disk usage of projects directory
    disk_usage_bytes = 0
    if config.PROJECTS_DIR.exists():
        for f in config.PROJECTS_DIR.rglob("*"):
            if f.is_file():
                try:
                    disk_usage_bytes += f.stat().st_size
                except OSError:
                    pass

    def _fmt_size(b: int) -> str:
        if b < 1024:
            return f"{b} B"
        if b < 1024 ** 2:
            return f"{b / 1024:.1f} KB"
        if b < 1024 ** 3:
            return f"{b / 1024 ** 2:.1f} MB"
        return f"{b / 1024 ** 3:.2f} GB"

    return {
        "python_version": python_version,
        "projects_dir": projects_dir,
        "disk_usage_bytes": disk_usage_bytes,
        "disk_usage_human": _fmt_size(disk_usage_bytes),
    }


@router.delete("/clear-all-projects")
def clear_all_projects():
    """Delete all projects. Irreversible."""
    import shutil as _shutil
    if not config.PROJECTS_DIR.exists():
        return {"cleared": 0}
    count = 0
    for d in list(config.PROJECTS_DIR.iterdir()):
        if d.is_dir():
            _shutil.rmtree(d)
            count += 1
    return {"cleared": count}


@router.delete("/reset-env")
def reset_env():
    """Remove the user-level .env file (reset all API settings)."""
    target = config.USER_ENV_FILE
    if target.exists():
        target.unlink()
    return {"ok": True}
