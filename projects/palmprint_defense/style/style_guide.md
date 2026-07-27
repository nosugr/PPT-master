# Style Guide — temp.pptx

> **STRICT SPECIFICATION**: When generating slides, you MUST follow these exact
> parameters. Do NOT deviate from the specified fonts, sizes, colors, or positions.
> This guide was extracted from actual slide measurements, not approximated.

## Canvas

- **Dimensions**: 1280 × 720 px
- **viewBox**: `0 0 1280 720`

## Margins (Content Safe Area)

- Left: **0.4px**
- Right: **0.2px**
- Top: **0.0px**
- Bottom: **0.0px**

## Typography

### Font Stack

- majorLatin: **汉仪旗黑-55简**
- minorLatin: **汉仪旗黑-55简**

### Size Hierarchy (MUST follow exactly)

| Role | Font | Size (pt) | Weight | Color |
|------|------|-----------|--------|-------|
| cover_title | 微软雅黑 | 36.0 | Bold | `#232A38` |
| slide_title | 微软雅黑 | 34.0 | Bold | `#232A38` |
| subtitle | 汉仪旗黑-55简 | 28.0 | Regular | `scheme:bg1` |
| section_title | Microsoft YaHei | 24.0 | Bold | `#232A38` |
| section_title | Microsoft YaHei | 22.0 | Bold | `scheme:accent5` |
| heading | 微软雅黑 | 20.0 | Bold | `#232A38` |
| body | Microsoft YaHei | 17.0 | Regular | `#232A38` |
| body | Microsoft YaHei | 16.0 | Bold | `#232A38` |

## Color Palette

### Theme Colors

- dk1: `#000000`
- lt1: `#FFFFFF`
- dk2: `#44546A`
- lt2: `#E7E6E6`
- accent1: `#5B9BD5`
- accent2: `#ED7D31`
- accent3: `#A5A5A5`
- accent4: `#FFC000`
- accent5: `#4472C4`
- accent6: `#70AD47`
- hlink: `#0563C1`
- folHlink: `#954F72`

### Actual Usage Palette (by frequency)

| Color | Usage % | Contexts |
|-------|---------|----------|
| `#232A38` | 51.5% | text_fill |
| `#2F4275` | 14.7% | shape_fill, text_fill, shape_stroke |
| `#14378B` | 9.9% | shape_fill |
| `#FFFFFF` | 8.7% | shape_fill, text_fill |
| `#AEBCDF` | 5.2% | shape_fill, shape_stroke |
| `#000000` | 4.2% | shape_fill, shape_stroke, text_fill |
| `#505866` | 4.0% | text_fill |
| `#4472C4` | 0.8% | text_fill |
| `#BE3C3C` | 0.6% | text_fill |
| `#005FAC` | 0.2% | shape_stroke |

## Layout Patterns

### Pattern: full_image (used 19 times)
_Full-bleed background image (regions: image, content)_

| Region | X | Y | Width | Height |
|--------|---|---|-------|--------|
| image | 353.6 | 177.0 | 436.1 | 258.8 |
| content | 477.0 | 256.5 | 325.3 | 58.2 |

### Pattern: text_only (used 5 times)
_Text-only content layout (regions: content)_

| Region | X | Y | Width | Height |
|--------|---|---|-------|--------|
| content | 359.7 | 343.5 | 562.0 | 52.1 |

## Structural Elements

### Header (appears on 73.1% of slides)
- Height: **91.6px**
- Y range: 0 → 91.6

### Spacing Rules

- **vertical_gap_5px**: 5.0px (between_elements)
- **vertical_gap_10px**: 10.0px (between_elements)
- **vertical_gap_40px**: 40.0px (between_elements)

### Content Density

- Average shapes per slide: **13.3**
- Average text elements per slide: **6.0**

### Recurring Decorative Elements

These elements appear consistently and SHOULD be reproduced:

- medium rect at top — position (0.0, 0.0, 349.9×225.7) — 73.1% of slides
- medium rect at center — position (990.5, 568.5, 289.5×151.5) — 73.1% of slides
- large image at top — position (-1.0, 3.3, 1279.6×720.0) — 73.1% of slides
- medium text (Project Background) at top — position (455.3, 56.8, 369.2×28.9) — 65.4% of slides
- medium text (项目背景) at top — position (455.3, 8.0, 369.3×42.9) — 53.8% of slides
