# Style Guide — JSSDL论文复现.pptx

> **STRICT SPECIFICATION**: When generating slides, you MUST follow these exact
> parameters. Do NOT deviate from the specified fonts, sizes, colors, or positions.
> This guide was extracted from actual slide measurements, not approximated.

## Canvas

- **Dimensions**: 1280 × 720 px
- **viewBox**: `0 0 1280 720`

## Margins (Content Safe Area)

- Left: **54.8px**
- Right: **63.1px**
- Top: **54.1px**
- Bottom: **47.5px**

## Typography

### Font Stack

- majorLatin: **Arial**
- majorEastAsia: **微软雅黑**
- minorLatin: **Arial**
- minorEastAsia: **微软雅黑**

### Size Hierarchy (MUST follow exactly)

| Role | Font | Size (pt) | Weight | Color |
|------|------|-----------|--------|-------|
| cover_title | MiSans Normal | 66.0 | Regular | `scheme:tx2` |
| cover_title | MiSans Normal | 60.0 | Bold | `scheme:tx2` |
| cover_title | MiSans Normal | 54.0 | Bold | `scheme:tx2` |
| cover_title | MiSans Normal | 40.0 | Bold | `scheme:tx2` |
| slide_title | 微软雅黑 | 30.0 | Bold | `#6C7785` |
| subtitle | MiSans Normal | 28.0 | Regular | `scheme:tx1` |
| section_title | 微软雅黑 | 24.0 | Bold | `#183B6E` |
| section_title | 微软雅黑 | 22.0 | Bold | `#1F3454` |

## Color Palette

### Theme Colors

- dk1: `#000000`
- lt1: `#FFFFFF`
- dk2: `#0F1423`
- lt2: `#FFFFFF`
- accent1: `#6096E6`
- accent2: `#58B6E5`
- accent3: `#56CA95`
- accent4: `#FFBA55`
- accent5: `#F18870`
- accent6: `#EC5F74`
- hlink: `#0563C1`
- folHlink: `#954D72`

### Actual Usage Palette (by frequency)

| Color | Usage % | Contexts |
|-------|---------|----------|
| `#2D3748` | 46.8% | text_fill, shape_fill, shape_stroke |
| `#0F1423` | 16.8% | text_fill, shape_fill, shape_stroke |
| `#FFFFFF` | 10.0% | text_fill, shape_fill |
| `#2A5F9A` | 5.8% | text_fill, shape_fill, shape_stroke |
| `#183B6E` | 5.2% | text_fill, shape_fill, shape_stroke |
| `#4A5568` | 2.9% | text_fill, shape_fill, shape_stroke |
| `#C05020` | 2.5% | text_fill, shape_fill |
| `#D8DEE8` | 3.7% | text_fill, shape_fill, shape_stroke |
| `#6C7785` | 1.8% | text_fill, shape_fill, shape_stroke |
| `#666666` | 1.3% | text_fill |

## Layout Patterns

### Pattern: two_column (used 16 times)
_Two-column layout with balanced content (regions: content, footer_area, title_area, image)_

| Region | X | Y | Width | Height |
|--------|---|---|-------|--------|
| content | 435.8 | 343.9 | 389.5 | 56.0 |
| footer_area | 426.2 | 640.8 | 541.0 | 28.7 |
| title_area | 94.4 | 53.4 | 1031.5 | 40.2 |
| image | 350.9 | 218.6 | 489.3 | 293.0 |

### Pattern: image_text (used 14 times)
_Image and text combination (regions: content, image, title_area, footer_area)_

| Region | X | Y | Width | Height |
|--------|---|---|-------|--------|
| content | 304.6 | 312.5 | 582.1 | 83.6 |
| image | 369.6 | 227.0 | 599.4 | 277.8 |
| title_area | 94.1 | 53.3 | 1019.6 | 39.7 |
| footer_area | 461.3 | 644.2 | 404.3 | 26.8 |

### Pattern: text_only (used 7 times)
_Text-only content layout (regions: content, title_area)_

| Region | X | Y | Width | Height |
|--------|---|---|-------|--------|
| content | 342.8 | 311.2 | 538.6 | 76.1 |
| title_area | 98.3 | 53.3 | 1058.3 | 40.9 |

## Structural Elements

### Header (appears on 78.4% of slides)
- Height: **100.2px**
- Y range: 0 → 100.2

### Spacing Rules

- **vertical_gap_30px**: 30.0px (between_elements)
- **vertical_gap_5px**: 5.0px (between_elements)
- **vertical_gap_10px**: 10.0px (between_elements)

### Content Density

- Average shapes per slide: **19.9**
- Average text elements per slide: **6.8**

### Recurring Decorative Elements

These elements appear consistently and SHOULD be reproduced:

- medium rect at top — position (0.1, -0.1, 271.3×271.4) — 100.0% of slides
- medium rect at left — position (0.1, 448.6, 271.3×271.4) — 100.0% of slides
- medium rect at top — position (1008.7, -0.1, 271.3×271.4) — 100.0% of slides
- medium rect at center — position (1008.7, 448.7, 271.3×271.4) — 100.0% of slides
- large rect at top — position (25.8, 23.4, 1228.4×673.3) — 100.0% of slides
- small rect at top — position (74.7, 53.0, 13.2×37.8) — 75.7% of slides
