"""Canvas format query endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

import config

router = APIRouter()


@router.get("")
def list_formats():
    return [
        {"id": key, **info}
        for key, info in config.CANVAS_FORMATS.items()
    ]


@router.get("/{format_id}")
def get_format(format_id: str):
    info = config.CANVAS_FORMATS.get(format_id)
    if not info:
        raise HTTPException(404, f"Unknown format: {format_id}")
    return {"id": format_id, **info}
