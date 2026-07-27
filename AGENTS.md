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

# Style extraction (pixel-accurate typography, colors, layout from existing PPTX)
python3 skills/ppt-master/scripts/extract_style.py <pptx_file_or_directory> -o <output_dir>

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

# [ppt-master] recent context, 2026-05-21 8:36pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (19,542t read) | 281,700t work | 93% savings

### May 18, 2026
644 12:40a 🟣 JSSDL PPT Part 2 Redesign Task Initiated
645 " ✅ Color Palette Normalized Across 5 JSSDL Slides
646 12:48a 🔵 PowerPoint presentation structure analyzed
647 12:52a 🟣 JSSDL PPT Part 2 Redesign Request (Slides 13–17+)
648 12:53a 🟣 New Slide Injected into JSSDL PPT via XML Manipulation
649 12:55a 🟣 Python Script for Slide25 XML Surgery (Shape Removal + Layout Fixes)
650 " 🔵 Slide25 Text Replacement Failed Due to String Mismatch
651 12:59a 🔵 Slide25 Layout Changes Confirmed; Bottom Bar Text Still Needs Manual Fix
652 " 🔴 Slide25 Bottom Bar Text Fixed via Direct XML Edit
653 1:00a 🔵 Slide27 Found: Contains Unmodified D1+D2 Mixed Content
654 1:04a ✅ JSSDL PPT Part 2 Slide Redesign Task Scoped
655 1:05a 🟣 Slide 27 XML Patch Script for Low-Rank Verification Layout
656 " ✅ Slide 27 XML Patch Executed Successfully — All 23 Shapes Removed, Layout Restructured
657 1:08a 🟣 JSSDL PPT v4 Packed from Modified jssdl_unpacked Directory
658 1:09a 🔵 LibreOffice Not Installed on D:\桌面 Workstation
659 1:10a ✅ JSSDL PPT Section 2 Modifications Complete — Full State Summary
S112 Modify PPT-master SKILL.md Step 3 template selection to require user confirmation instead of defaulting to skip (May 18, 1:10 AM)
660 2:17p ✅ PPT Skill Step 3 Template Selection Now Requires User Confirmation
661 " 🔵 PPT-Master Template Library Contains 17 Templates Across Diverse Domains
662 2:18p 🔵 Strategist Step Receives Pre-Confirmed Template — Pipeline Stage Dependency Mapped
S113 Redesign ppt-master SKILL.md Step 3 to make template selection mandatory and interactive (May 18, 2:18 PM)
663 2:28p 🔵 PPT-Master Template Selection: Strict Path-Only Trigger Rule
664 2:31p ✅ PPT-Master Step 3 Redesigned: Template Selection Now MANDATORY and BLOCKING
S114 Add a mandatory per-page slide structure confirmation step in PPT-Master SKILL.md Step 4, between the eight confirmations and design spec output (May 18, 2:31 PM)
665 2:39p 🟣 PPT Generation Flow: Pre-Generation Structure Confirmation Step
666 2:40p 🔵 PPT-Master SKILL.md: Step 4 Strategist Phase with Eight Confirmations
S115 Refine per-page slide structure confirmation: each page must specify concrete content extracted from source materials, not vague descriptions (May 18, 2:40 PM)
S116 Add mandatory per-page slide structure confirmation step to ppt-master Step 4, requiring concrete content per page before design spec is written (May 18, 2:44 PM)
667 2:45p 🟣 SKILL.md Updated: Page Structure Proposal Blocking Step Added to Step 4
668 2:46p ✅ Strategist Phase Complete Checklist Updated to Include Page Structure Confirmation
S117 Add minimum font size constraints to PPT generation: body text minimum 12pt, sub-headings minimum 14pt (May 18, 2:46 PM)
669 2:58p 🟣 PPT Font Size Constraints Added
670 " 🔵 Font Size References Spread Across 6 PPT Skill Files
671 " 🔵 executor-base.md Uses Typography Ramp Anchored on body Font Size
672 2:59p 🔵 shared-standards.md Contains SVG Font Size Examples with Specific Pixel Values
673 " 🔵 strategist.md Defines Font Size Ramp with Body Baseline Recommendations
674 3:00p 🔵 Full Font Size Ramp Table Found in strategist.md with Ratio Bands per Role
S118 Add minimum font size constraints to PPT generation: body text ≥ 12pt, sub-headings ≥ 14pt — COMPLETED (May 18, 3:00 PM)
675 3:03p 🟣 Minimum Font Size Constraint Added to strategist.md Font Size Ramp
676 3:06p 🟣 Minimum Font Size Constraint Added to shared-standards.md Basic SVG Rules
S119 User asked whether Claude can modify an existing PPT file (May 18, 3:06 PM)
S173 Product improvement analysis for ppt-master: identify prompt improvement opportunities across the Claude skill workflow and backend generator (May 18, 4:50 PM)
### May 21, 2026
828 5:01p 🔵 PPT Master Skill Architecture and Pipeline
829 5:02p 🔵 PPT Master Project Entry Point and Directory Structure
830 " 🔵 SVG Technical Standards and PPT Export Constraints
831 5:03p 🔵 Strategist Role: Eight Confirmations, spec_lock Generation, and Visualization Audit
832 " 🔵 Executor Role: Template Resolution, page_rhythm Discipline, and TTS-Safe Speaker Notes
833 5:04p 🔵 Three Executor Style Variants: General, Consultant, and Top Consulting
834 5:05p 🔵 Backend API Layer with Five Routers
835 " 🔵 Next.js Frontend with Dashboard, Projects, Templates, and Settings Pages
836 5:07p 🔵 Backend generator.py: Programmatic Pipeline Orchestrator Using LLM Client
837 " 🔵 FastAPI Pipeline Router: Generate, Finalize, Export Endpoints
838 5:08p 🔵 Backend Strategist Auto-Resolves Eight Confirmations with Delimiter-Based Output Parsing
839 " 🔵 Project Detail Page: Five-Stage Generation Pipeline with SVG Preview and i18n
840 " 🔵 LLM Client: OpenAI-Compatible Wrapper Supporting DeepSeek, OpenAI, and MIMO
841 " 🔵 Backend Executor: Per-Page LLM Calls with spec_lock Re-Injection and Four-Strategy Output Parsing
842 5:09p 🔵 Backend Generator Full Pipeline: Six-Stage Orchestration with SVG Retry and Quality Gate
S174 PPT Master产品改进：确定29项具体改进prompt和代码方案 (May 21, 5:14 PM)
846 5:19p 🔵 User Shared Abu Cowork as Product Quality Benchmark
848 " 🔵 Abu Cowork Product Architecture and Feature Set Documented

Access 282k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>