"""Thin wrapper around OpenAI-compatible chat completion API.

Supports per-role model configuration (strategist vs executor),
timeout, and exponential backoff retry.
"""

from __future__ import annotations

import os
import time

import config  # on sys.path via main.py

# Ensure .env vars are loaded before we read them
config.load_prefixed_env_file(prefixes=("LLM", "OPENAI", "DEEPSEEK", "MIMO"))


def _resolve_key(role: str = "default") -> tuple[str, str, str]:
    """Resolve API key, base URL, and model from env.

    Checks role-specific overrides first (LLM_STRATEGIST_*, LLM_EXECUTOR_*),
    then LLM_*, then falls back to OPENAI_*, DEEPSEEK_*, MIMO_*.

    Args:
        role: "strategist", "executor", or "default"
    """
    # Role-specific overrides (e.g. LLM_STRATEGIST_MODEL, LLM_EXECUTOR_MODEL)
    role_upper = role.upper() if role != "default" else ""
    if role_upper:
        role_key = os.environ.get(f"LLM_{role_upper}_API_KEY", "")
        if role_key:
            base = os.environ.get(f"LLM_{role_upper}_BASE_URL", os.environ.get("LLM_BASE_URL", "https://api.deepseek.com/v1"))
            model = os.environ.get(f"LLM_{role_upper}_MODEL", os.environ.get("LLM_MODEL", "deepseek-chat"))
            return role_key, base, model
        # Fall through to shared LLM_* config with role-specific model override
        role_model = os.environ.get(f"LLM_{role_upper}_MODEL", "")

    # Primary: dedicated LLM config
    llm_key = os.environ.get("LLM_API_KEY", "")
    if llm_key:
        base = os.environ.get("LLM_BASE_URL", "https://api.deepseek.com/v1")
        model = os.environ.get("LLM_MODEL", "deepseek-chat")
        # Apply role-specific model override if set
        if role_upper:
            role_model_override = os.environ.get(f"LLM_{role_upper}_MODEL", "")
            if role_model_override:
                model = role_model_override
        return llm_key, base, model

    # Fallback: legacy provider-specific keys
    for prefix in ("OPENAI", "DEEPSEEK", "MIMO"):
        key = os.environ.get(f"{prefix}_API_KEY", "")
        if key:
            base = os.environ.get(f"{prefix}_BASE_URL", "https://api.openai.com/v1")
            model = os.environ.get(f"{prefix}_MODEL", "gpt-4o")
            return key, base, model
    return "", "https://api.openai.com/v1", "gpt-4o"


def generate_text(
    system_prompt: str,
    user_message: str,
    *,
    temperature: float = 0.7,
    max_tokens: int = 16000,
    model: str | None = None,
    role: str = "default",
    timeout: float = 180.0,
    max_retries: int = 3,
) -> str:
    """Send a chat completion request and return the assistant text.

    Args:
        system_prompt: System message.
        user_message: User message.
        temperature: Sampling temperature.
        max_tokens: Maximum response tokens.
        model: Explicit model override (bypasses env resolution).
        role: "strategist", "executor", or "default" — selects model config.
        timeout: Request timeout in seconds.
        max_retries: Maximum retry attempts on transient errors.

    Reads API keys from env (.env). Supports role-specific model configs:
      LLM_STRATEGIST_MODEL, LLM_STRATEGIST_API_KEY, LLM_STRATEGIST_BASE_URL
      LLM_EXECUTOR_MODEL, LLM_EXECUTOR_API_KEY, LLM_EXECUTOR_BASE_URL
    """
    import openai  # lazy to keep import time low

    api_key, base_url, resolved_model = _resolve_key(role)
    if model:
        resolved_model = model

    if not api_key:
        raise ValueError(
            "No LLM API key configured. "
            "Set LLM_API_KEY (or OPENAI_API_KEY / DEEPSEEK_API_KEY / MIMO_API_KEY) "
            "in the Settings page or in ~/.ppt-master/.env"
        )

    client = openai.OpenAI(api_key=api_key, base_url=base_url)

    last_error: Exception | None = None
    for attempt in range(max_retries):
        try:
            resp = client.chat.completions.create(
                model=resolved_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=timeout,
            )
            return resp.choices[0].message.content or ""
        except openai.RateLimitError as e:
            last_error = e
            wait = min(2 ** attempt * 5, 60)  # 5s, 10s, 20s, cap 60s
            time.sleep(wait)
        except openai.APITimeoutError as e:
            last_error = e
            if attempt < max_retries - 1:
                time.sleep(2)
        except openai.APIConnectionError as e:
            last_error = e
            if attempt < max_retries - 1:
                time.sleep(3)
        except openai.APIStatusError as e:
            if e.status_code >= 500:
                last_error = e
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
            else:
                raise

    raise RuntimeError(
        f"LLM request failed after {max_retries} attempts: {last_error}"
    )
