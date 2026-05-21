# AGENTS.md

This file is the project entry point for general AI agents.

Before any PPT generation task, **you MUST first read [`skills/ppt-master/SKILL.md`](skills/ppt-master/SKILL.md)** — the authoritative workflow for project creation, role switching, serial execution, quality gates, post-processing, and export.

## Project Overview

PPT Master is an AI-driven presentation generation system. Multi-role collaboration (Strategist → Image_Generator → Executor) converts source documents (PDF/DOCX/URL/Markdown) into natively editable PPTX with real PowerPoint shapes (DrawingML).

**Core Pipeline**: `Source Document → Create Project → [Template] → Strategist Eight Confirmations → [Image_Generator] → Executor → Quality Check → Post-processing → Export PPTX`

> Topic-only requests with no source material: run the standalone [`topic-research`](skills/ppt-master/workflows/topic-research.md) workflow before SKILL.md Step 1 to gather web materials.
>
> Phase B resumption (split-mode execution): when the user opens a fresh chat and says "继续生成 projects/<x>" or similar, run the standalone [`resume-execute`](skills/ppt-master/workflows/resume-execute.md) workflow to enter Phase B (SVG generation + export) without re-running Phase A.
>
> Decks containing data charts: run the standalone [`verify-charts`](skills/ppt-master/workflows/verify-charts.md) workflow between the executor and post-processing steps to calibrate chart coordinates.
>
> Recorded narration / video export: run the standalone [`generate-audio`](skills/ppt-master/workflows/generate-audio.md) workflow after post-processing.
>
> Post-export iteration: whenever the user asks to change anything on a generated slide ("改一下", "调字号", "那里看着不对", "把图片换大点"), the [`visual-edit`](skills/ppt-master/workflows/visual-edit.md) workflow is available — surface it as an option. If the user describes the change with enough specificity to apply directly ("第 3 页副标题字号改 32"), edit the SVG directly instead; if they're vaguely pointing at "somewhere" on the deck, run the workflow.

## Execution Requirements

- Read [`skills/ppt-master/SKILL.md`](skills/ppt-master/SKILL.md) before starting a PPT task.
- For standalone template creation, read [`skills/ppt-master/workflows/create-template.md`](skills/ppt-master/workflows/create-template.md).
- Role-specific rules live in [`skills/ppt-master/references/`](skills/ppt-master/references/).
- Technical SVG/PPT constraints live in [`skills/ppt-master/references/shared-standards.md`](skills/ppt-master/references/shared-standards.md).
- Canvas choices live in [`skills/ppt-master/references/canvas-formats.md`](skills/ppt-master/references/canvas-formats.md).
- Icon library details live in [`skills/ppt-master/templates/icons/README.md`](skills/ppt-master/templates/icons/README.md).
- Before editing prompt files under `skills/ppt-master/references/` or Python under `skills/ppt-master/scripts/`, consult the matching style rule in [`docs/rules/`](docs/rules/).

## Compatibility Boundary

- This repository is a workflow/skill package, not an app or service scaffold.
- Do NOT assume conventions like `.worktrees/`, `tests/`, or mandatory branch setup unless the user explicitly requests them.
- On conflict with a generic coding skill, prioritize [`skills/ppt-master/SKILL.md`](skills/ppt-master/SKILL.md) and this file inside this repository.

## Command Quick Reference

Convenience summary only — full workflow in [`skills/ppt-master/SKILL.md`](skills/ppt-master/SKILL.md).

```bash
# Source content conversion
python3 skills/ppt-master/scripts/source_to_md/pdf_to_md.py <PDF_file>
python3 skills/ppt-master/scripts/source_to_md/doc_to_md.py <DOCX_or_other_file>
python3 skills/ppt-master/scripts/source_to_md/excel_to_md.py <XLSX_or_XLSM_file>
python3 skills/ppt-master/scripts/source_to_md/ppt_to_md.py <PPTX_file>
python3 skills/ppt-master/scripts/source_to_md/web_to_md.py <URL>

# Project management
python3 skills/ppt-master/scripts/project_manager.py init <project_name> --format ppt169
python3 skills/ppt-master/scripts/project_manager.py import-sources <project_path> <source_files_or_URLs...> --move
python3 skills/ppt-master/scripts/project_manager.py validate <project_path>

# Image tools and SVG quality check
python3 skills/ppt-master/scripts/analyze_images.py <project_path>/images
python3 skills/ppt-master/scripts/image_gen.py "prompt" --aspect_ratio 16:9 --image_size 1K -o <project_path>/images
python3 skills/ppt-master/scripts/svg_quality_checker.py <project_path>

# Post-processing pipeline: run sequentially, one command at a time
python3 skills/ppt-master/scripts/total_md_split.py <project_path>
python3 skills/ppt-master/scripts/finalize_svg.py <project_path>
python3 skills/ppt-master/scripts/svg_to_pptx.py <project_path>
```

## Core Directories

- `skills/ppt-master/SKILL.md` — main workflow authority.
- `skills/ppt-master/references/` — role definitions and technical specifications.
- `skills/ppt-master/scripts/` — runnable tool scripts.
- `skills/ppt-master/scripts/docs/` — topic-focused script docs.
- `skills/ppt-master/templates/` — layout templates, chart templates, icon library.
- `examples/` — example projects.
- `projects/` — user project workspace.


<claude-mem-context>
# Memory Context

# [ppt-master] recent context, 2026-05-15 4:52pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (17,371t read) | 319,651t work | 95% savings

### May 12, 2026
S72 Frontend/Backend startup methods inquiry + PPT viewer UI enhancements (SVG image paths, dialog preview, keyboard navigation) (May 12, 7:30 PM)
S76 关闭多个终端监听进程 / Kill multiple terminal listeners on Windows (May 12, 10:48 PM)
S77 跟进进程清理 / Follow-up on killing stale listener processes and restarting dev server (May 12, 11:30 PM)
S78 等待用户重启开发服务器 / Waiting for user to confirm dev server restart (May 12, 11:33 PM)
S91 User asked whether the ppt-master project calls any external APIs and whether API configuration can be done visually through the frontend UI. (May 12, 11:33 PM)
### May 14, 2026
S92 PPT Master 项目新增前端可视化 API 配置页面，替代手动编辑 .env 文件 (May 14, 2:35 PM)
S93 用户询问项目是否有API调用，以及前端是否可以进行API配置和自定义调用 (May 14, 4:25 PM)
S94 PPT-Master全栈功能实现：后端生成管道 + 前端进度UI — 用户电脑意外关机后确认上一步操作并完成后续实施 (May 14, 4:40 PM)
S95 Five backend and frontend fixes for ppt-master: API key isolation, slide preview sizing, back button, LLM output parsing resilience, and template selection flow (May 14, 7:33 PM)
395 8:05p 🟣 TypeScript SettingsData Interface Updated to Include raw_values Field
396 8:06p 🔴 Settings Page configuredKeys Now Uses raw_values for Provider Badge Status
397 8:07p 🔴 llm_client.py Now Resolves DEEPSEEK_* and MIMO_* Keys Natively Without Alias Mapping
398 " 🔴 pipeline.py Generation Pre-Check Now Accepts DEEPSEEK_API_KEY and MIMO_API_KEY
399 8:08p ✅ Task #9 Completed: API Key Independence Fix Fully Shipped
400 8:09p 🟣 Project Detail Page: Adding Back Navigation and Slide Preview Fix (Tasks #10 and #11 Started)
401 8:10p 🟣 Back Navigation Button Added to Project Detail Page Header
402 " 🔴 Project Slide Preview Replaced Dialog with Full-Screen Overlay — Tasks #10 and #11 Complete
403 8:12p ✅ Project Detail Page Cleanup: Dialog Imports and dialogRef Removed
404 8:17p 🔵 Session Interrupted by Unexpected Computer Shutdown
405 " 🟣 Frontend Preview and Back Button Changes Completed — TypeScript Clean
406 8:18p 🔵 Backend Generator Strategist Stage: Eight Confirmations Auto-Resolution Pattern
407 " 🔵 Generator.py: Strategist Output Parsing, File Writing, and Image Generation Stage Entry
408 " 🔴 Strategist Output Parsing: Replaced Hard Failure with 4-Strategy Fallback Chain
409 8:19p 🟣 Added `_extract_minimal_spec_lock()` Helper to Synthesize Fallback spec_lock.md
410 " 🔵 Executor Stage Still Hard-Fails on Missing SVG Section — No Fallback Yet
411 8:20p 🔴 Executor SVG Parsing: Added 3-Strategy Fallback Chain and Per-Page Debug Logging
412 8:21p 🔵 Stale `svg_content = svg_match.group(1).strip()` Line Left After Executor Refactor — Latent Bug
413 " 🔵 Confirmed: Stale `svg_content = svg_match.group(1).strip()` at Line 446 Will Cause AttributeError
414 " 🔴 Removed Stale `svg_content = svg_match.group(1).strip()` Line from Executor Loop
415 8:22p 🔵 Backend Pipeline Router: GenerateRequest Model and Project Resolution
416 " 🟣 Added `template_id` Field to GenerateRequest in pipeline.py
417 8:23p 🔵 Template Library Uses Staging Directory Pattern; No `get_template` Function Exists
418 " 🔵 Template Library Directory Structure: layouts/ with Index JSON and _staging/ Promotion Path
419 " 🟣 Template ID Support Wired into `start_generation` Endpoint — Copies Layout to Project
420 " 🟣 Frontend API Client Updated to Support `template_id` in Generate Call
421 8:24p 🟣 Project Detail Page Imports Templates API and Template Type for Template Selection UI
422 " 🟣 Project Detail Page Adds Dialog, Input, Upload, and Search Imports for Template Picker UI
423 8:25p 🟣 Template Picker Dialog State Added to Project Detail Page
424 " 🟣 Template Picker Dialog Logic Implemented: openGenDialog, startGeneration, handleUploadTemplate
425 8:27p 🟣 Template Selection Dialog JSX Added to Project Detail Page — Feature Complete
426 8:28p 🔵 Missing i18n Keys for Template Dialog in en.ts Locale File
427 " 🟣 Added 5 Missing i18n Keys for Template Dialog to English Locale File
428 " 🟣 Template Dialog i18n Keys Added to zh-CN and zh-TW Locale Files
429 8:30p 🟣 Template Selection Feature Passes TypeScript Type Check — All Changes Valid
430 " 🔵 templates.upload() Return Type is Untyped `any` — staging_id vs id Ambiguity in handleUploadTemplate
431 8:31p 🔵 templates.register() Returns `{"registered": staging_id, "path": ...}` — Not `id` or `staging_id` Field
432 " 🔵 Upload Endpoint Does Not Return a Field Containing "staging" — Upload Response Shape Unknown from Grep
433 " 🔵 Upload Endpoint Returns `staging_id` Field — handleUploadTemplate Fallback Correct
### May 15, 2026
447 4:10p 🟣 JSSDL Project PPT Generation Task Initiated
448 " 🔵 JSSDL-Reproduction Project Image Assets Catalogued
449 " 🔵 Blue Minimalist PPT Template Import Structure Confirmed
450 " 🔵 ppt-master Full Pipeline and Workflow Architecture Loaded
451 4:11p 🔵 JSSDL Document Folder Contains Four Key Source Files Including PPT-Ready Report
452 " 🔵 PowerShell $_ Pipeline Variable Fails When Invoked via Bash Wrapper
453 4:38p ⚖️ GitHub Upload Strategy with API Key Protection via .gitignore
454 4:39p 🔵 ppt-master Project Git State: Remote Configured, Backend Untracked, API Files at Risk
455 4:47p 🔵 User Learning GitHub Repository Creation Workflow
456 " 🔵 PPT Master Project Structure and AI Pipeline Discovered
457 " 🔵 PPT Master Strict Serial Execution Rules and Conversion Scripts Documented
S96 Upload ppt-master project to GitHub — guidance on repository description and creation options (May 15, 4:47 PM)
**Investigated**: Read CLAUDE.md and first 50 lines of skills/ppt-master/SKILL.md to understand the project's purpose, architecture, and technical stack in order to compose an accurate GitHub repository description.

**Learned**: The ppt-master project at D:\Agent_Project\ppt-master is an AI-driven presentation generation system using a multi-role LLM pipeline (Strategist → Image_Generator → Executor) that converts PDF/DOCX/URL/Markdown source documents into natively editable PPTX via DrawingML/SVG. The project has strict serial execution discipline enforced in SKILL.md (412 lines), dedicated Python conversion scripts, and multiple standalone workflows. It contains .env files with API keys and user project workspaces in projects/ that should not be committed.

**Completed**: Provided a ready-to-use GitHub repository description in English (under 350 characters). Recommended repository creation settings: Public visibility, no auto-generated README, Python .gitignore template, MIT License. Warned about three categories of sensitive/generated files that need .gitignore entries: .env (API keys), exports/ (generated PPTX), and projects/ (user workspaces).

**Next Steps**: User is filling in the GitHub "Create repository" form with the recommended settings and clicking "Create repository". After that, the session will proceed to configure .gitignore and run git push to upload the local project to the new remote repository.


Access 320k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>