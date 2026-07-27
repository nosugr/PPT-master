# ppt_master_guide - Design Spec

> Human-readable design narrative — rationale, audience, style, color choices, content outline. Read once by downstream roles for context.
>
> Machine-readable execution contract: `spec_lock.md` (color / typography / icon / image short form). Executor re-reads `spec_lock.md` before every SVG page to resist context-compression drift. Keep both in sync; on divergence, `spec_lock.md` wins.

## I. Project Information

| Item | Value |
| ---- | ----- |
| **Project Name** | ppt_master_guide |
| **Canvas Format** | PPT 16:9 (1280×720) |
| **Page Count** | 4 |
| **Design Style** | A) General Versatile + minimalist |
| **Target Audience** | 想了解 PPT Master 用法的新用户 |
| **Use Case** | 项目使用流程介绍 |
| **Created Date** | 2026-05-09 |

---

## II. Canvas Specification

| Property | Value |
| -------- | ----- |
| **Format** | PPT 16:9 |
| **Dimensions** | 1280×720 |
| **viewBox** | `0 0 1280 720` |
| **Margins** | left/right 60px, top/bottom 50px |
| **Content Area** | 1160×620 |

---

## III. Visual Theme

### Theme Style

- **Style**: minimalist
- **Theme**: Light theme
- **Tone**: clean, modern, professional

### Color Scheme

| Role | HEX | Purpose |
| ---- | --- | ------- |
| **Background** | `#FFFFFF` | Page background |
| **Secondary bg** | `#F8FAFC` | Card background |
| **Primary** | `#2563EB` | Title decorations, key sections, icons |
| **Accent** | `#3B82F6` | Data highlights, key information |
| **Secondary accent** | `#DBEAFE` | Subtle backgrounds, tags |
| **Body text** | `#1F2937` | Main body text |
| **Secondary text** | `#6B7280` | Captions, annotations |
| **Tertiary text** | `#9CA3AF` | Supplementary info, footers |
| **Border/divider** | `#E5E7EB` | Card borders, divider lines |

---

## IV. Typography System

### Font Plan

**Typography direction**: modern CJK sans

| Role | Chinese | English | Fallback tail |
| ---- | ------- | ------- | ------------- |
| **Title** | `"Microsoft YaHei"` | `Arial` | `sans-serif` |
| **Body** | `"Microsoft YaHei"` | `Arial` | `sans-serif` |
| **Emphasis** | `"Microsoft YaHei"` | `Arial` | `sans-serif` |
| **Code** | — | `Consolas, "Courier New"` | `monospace` |

**Per-role font stacks**:

- Title: `"Microsoft YaHei", Arial, sans-serif`
- Body: `"Microsoft YaHei", Arial, sans-serif`
- Emphasis: `"Microsoft YaHei", Arial, sans-serif`
- Code: `Consolas, "Courier New", monospace`

### Font Size Hierarchy

**Baseline**: Body font size = 22px

| Purpose | Ratio to body | Example @ body=22 | Weight |
| ------- | ------------- | ----------------- | ------ |
| Cover title | 3x | 66px | Bold |
| Page title | 1.8x | 40px | Bold |
| Subtitle | 1.3x | 28px | SemiBold |
| **Body content** | **1x** | **22px** | Regular |
| Annotation | 0.75x | 16px | Regular |
| Page number | 0.55x | 12px | Regular |

---

## V. Layout Principles

### Page Structure

- **Header area**: 50px from top, page title
- **Content area**: 520px, main content
- **Footer area**: 50px from bottom, page number

### Layout Pattern Library

| Pattern | Suitable Scenarios |
| ------- | ----------------- |
| **Single column centered** | Covers, conclusions |
| **Three/four column cards** | Feature lists, parallel points |
| **Top-bottom split** | Processes, timelines |

### Spacing Specification

**Universal**:

| Element | Value |
| ------- | ----- |
| Safe margin from canvas edge | 60px |
| Content block gap | 32px |
| Icon-text gap | 12px |

---

## VI. Icon Usage Specification

### Source

- **Built-in icon library**: `templates/icons/`
- **Usage method**: SVG placeholder `<use data-icon="library/icon-name" .../>`

### Recommended Icon List

| Purpose | Icon Path | Page |
| ------- | --------- | ---- |
| 文件 | `tabler-outline/file-text` | Slide 02 |
| 设置 | `tabler-outline/settings` | Slide 02 |
| 流程 | `tabler-outline/arrow-right` | Slide 03 |
| 格式 | `tabler-outline/layout` | Slide 04 |
| 检查 | `tabler-outline/check` | Slide 03 |
| 导出 | `tabler-outline/download` | Slide 03 |

---

## VII. Visualization Reference List

无数据可视化页面，本节不适用。

---

## VIII. Image Resource List

无图片资源，本节不适用。

---

## IX. Content Outline

### Slide 01 - Cover

- **Layout**: Single column centered
- **Title**: PPT Master
- **Subtitle**: AI 生成原生可编辑 PPTX
- **Info**: 使用流程指南

### Slide 02 - What is PPT Master

- **Layout**: Three column cards
- **Title**: 什么是 PPT Master
- **Content**:
  - 真正的 PPT：每个元素可在 PowerPoint 中编辑
  - 数据不出本地：全流程在你的电脑上完成
  - 不锁定平台：支持多种 AI IDE 和模型

### Slide 03 - Usage Flow

- **Layout**: Top-bottom split / process steps
- **Title**: 使用流程
- **Content**:
  1. 提供源材料（PDF/DOCX/网址/文字）
  2. AI 自动处理（转格式 → 设计确认 → 生成 SVG）
  3. 获取成品（exports/ 目录下的 .pptx 文件）

### Slide 04 - Supported Formats & Closing

- **Layout**: Two column
- **Title**: 支持的格式
- **Content**:
  - 输入：PDF / DOCX / XLSX / PPTX / 网址 / Markdown
  - 输出：PPT 16:9 / 4:3 / 小红书 / 朋友圈等 10+ 种
  - 结语：准备好素材，开始创作吧

---

## X. Speaker Notes Requirements

One speaker note file per page, saved to `notes/`:

- **Filename**: match SVG name (e.g., `01_cover.md`)
- **Content**: script key points, timing cues, transition phrases

---

## XI. Technical Constraints Reminder

### SVG Generation Must Follow:

1. viewBox: `0 0 1280 720`
2. Background uses `<rect>` elements
3. Text wrapping uses `<tspan>` (`<foreignObject>` FORBIDDEN)
4. Transparency uses `fill-opacity` / `stroke-opacity`; `rgba()` FORBIDDEN
5. FORBIDDEN: `mask`, `<style>`, `class`, `foreignObject`
6. FORBIDDEN: `textPath`, `animate*`, `script`
7. Text characters: write typography & symbols as raw Unicode
8. `clipPath` conditionally allowed **only on `<image>` elements**
