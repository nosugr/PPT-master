# Adaptive Multimode Process Monitoring - Design Spec

> Human-readable design narrative for an academic/technical presentation.

## I. Project Information

| Item | Value |
| ---- | ----- |
| **Project Name** | Adaptive Multimode Process Monitoring (JMSDL) |
| **Canvas Format** | PPT 16:9 (1280×720) |
| **Page Count** | 15 |
| **Design Style** | B) General Consulting + Technical/Academic |
| **Target Audience** | Researchers, engineers, and graduate students in process control, machine learning, and industrial automation |
| **Use Case** | Academic presentation, research group meeting, conference talk |
| **Created Date** | 2024-05-24 |

---

## II. Canvas Specification

| Property | Value |
| -------- | ----- |
| **Format** | PPT 16:9 |
| **Dimensions** | 1280×720 |
| **viewBox** | `0 0 1280 720` |
| **Margins** | Left/Right: 60px, Top: 80px (header), Bottom: 50px (footer) |
| **Content Area** | 1160×590 (from x=60, y=80 to x=1220, y=670) |

---

## III. Visual Theme

### Theme Style

- **Style**: Technical/Academic, clean and structured
- **Theme**: Light theme
- **Tone**: Professional, rigorous, innovative

### Color Scheme

| Role | HEX | Purpose |
| ---- | --- | ------- |
| **Background** | `#FFFFFF` | Page background |
| **Secondary bg** | `#F5F7FA` | Card background, section background |
| **Primary** | `#1565C0` | Title decorations, key sections, icons |
| **Accent** | `#FF6F00` | Data highlights, key information, links |
| **Secondary accent** | `#455A64` | Secondary emphasis, gradient transitions |
| **Body text** | `#333333` | Main body text |
| **Secondary text** | `#666666` | Captions, annotations |
| **Tertiary text** | `#999999` | Supplementary info, footers |
| **Border/divider** | `#E0E0E0` | Card borders, divider lines |
| **Success** | `#2E7D32` | Positive indicators (FDR high) |
| **Warning** | `#C62828` | Issue markers (FAR high, catastrophic forgetting) |

### Gradient Scheme

```xml
<!-- Title gradient -->
<linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stop-color="#1565C0"/>
  <stop offset="100%" stop-color="#455A64"/>
</linearGradient>

<!-- Background decorative gradient -->
<radialGradient id="bgDecor" cx="80%" cy="20%" r="50%">
  <stop offset="0%" stop-color="#1565C0" stop-opacity="0.08"/>
  <stop offset="100%" stop-color="#1565C0" stop-opacity="0"/>
</radialGradient>
```

---

## IV. Typography System

### Font Plan

**Typography direction**: Modern CJK sans-serif for readability, consistent across all roles.

| Role | Chinese | English | Fallback tail |
| ---- | ------- | ------- | ------------- |
| **Title** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |
| **Body** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |
| **Emphasis** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |
| **Code** | `"Microsoft YaHei", "PingFang SC"` | `Consolas, "Courier New"` | `monospace` |

**Per-role font stacks**:
- Title: `Arial, "Microsoft YaHei", "PingFang SC", sans-serif`
- Body: `Arial, "Microsoft YaHei", "PingFang SC", sans-serif`
- Emphasis: same as Body
- Code: `Consolas, "Courier New", monospace`

### Font Size Hierarchy

**Baseline**: Body font size = **18px** (dense content).

| Purpose | Ratio to body | Example @ body=18 | Weight |
| ------- | ------------- | ----------------- | ------ |
| Cover title (hero headline) | 3x | 54px | Bold |
| Page title | 1.75x | 32px | Bold |
| Subtitle | 1.3x | 23px | SemiBold |
| **Body content** | **1x** | **18px** | Regular |
| Annotation / caption | 0.8x | 14px | Regular |
| Page number / footnote | 0.6x | 11px | Regular |

---

## V. Layout Principles

### Page Structure

- **Header area**: 80px (page title + accent line)
- **Content area**: 590px (from y=80 to y=670)
- **Footer area**: 50px (page number + source info)

### Layout Pattern Library

| Pattern | Suitable Scenarios |
| ------- | ----------------- |
| **Single column centered** | Cover, TOC, Thank You |
| **Asymmetric split (3:7)** | Problem statement, Method overview (text left, diagram right) |
| **Top-bottom split** | Results comparison, Table + chart |
| **Three-column cards** | Related work comparison, Future work |
| **Full-bleed + floating text** | Catastrophic forgetting illustration, Roasting process photo |

### Spacing Specification

| Element | Current Project |
| ------- | --------------- |
| Safe margin from canvas edge | 60px |
| Content block gap | 30px |
| Icon-text gap | 12px |
| Card gap | 24px |
| Card padding | 24px |
| Card border radius | 8px |

---

## VI. Icon Usage Specification

### Source

- **Built-in icon library**: `templates/icons/`
- **Chosen library**: `tabler-filled`

### Recommended Icon List

| Purpose | Icon Path | Page |
| ------- | --------- | ---- |
| Factory/Industry | `tabler-filled/building-factory` | P03, P10 |
| Database/Data | `tabler-filled/database` | P03, P08 |
| Brain/Learning | `tabler-filled/brain` | P04, P05 |
| Gear/Settings | `tabler-filled/settings` | P06 |
| Chart/Graph | `tabler-filled/chart-bar` | P08, P09, P11 |
| Check/Verify | `tabler-filled/circle-check` | P11 |
| Alert/Warning | `tabler-filled/alert-triangle` | P03, P04 |
| Lightbulb/Idea | `tabler-filled/lightbulb` | P05, P12 |
| Users/Team | `tabler-filled/users` | P14 |
| Home | `tabler-filled/home` | P01 |
| List/Agenda | `tabler-filled/list` | P02 |

---

## VII. Visualization Reference List

**Read-audit**:
```
Catalog read: 24 templates / 8 categories
Runners-up considered: process_flow (rejected: JMSDL is not a sequential process but an optimization loop), comparison_table (rejected: results are better shown as grouped bar + table combo), timeline (rejected: no temporal progression in method)
```

| Visualization Type | Reference Template | Used In |
| ------------------ | ------------------ | ------- |
| grouped_bar_chart | `templates/charts/grouped_bar_chart.svg` | P08, P09, P10 |
| comparison_table | `templates/charts/comparison_table.svg` | P04, P11 |

---

## VIII. Image Resource List

| Filename | Dimensions | Ratio | Purpose | Type | Status | Generation Description |
| -------- | --------- | ----- | ------- | ---- | ------ | --------------------- |
| cover_bg.png | 1280×720 | 1.78 | Cover background | Background | Pending | Abstract blue circuit-board pattern with data flow lines, deep navy (#0D47A1) to tech blue (#1565C0) gradient, clean center area for title overlay |
| catastrophic_forgetting.png | 640×480 | 1.33 | Illustrate catastrophic forgetting | Illustration | Pending | A split-screen diagram: Left side shows a model "brain" happily representing Mode 1 data; right side shows the same brain with data from Mode 1, 2, 3 falling out of its head (forgetting), with a red "X" and a memory graph showing a sharp drop. Style: clean flat vector, blue/orange color scheme. |
| jmsdl_framework.png | 800×500 | 1.6 | JMSDL method overview | Diagram | Pending | A flowchart showing: "Old Dictionary Do" + "New Mode Data Xn" → "JMSDL Optimization" → "New Dictionary Dn". Two branches from Dn: "Mode Matching (low reconstruction error)" and "Similarity Preserving (high ds)". Style: flat diagram, blue (#1565C0) and grey (#455A64) nodes, orange (#FF6F00) highlights. |
| roasting_plant.jpg | 1280×720 | 1.78 | Real-world application photo | Photography | Web | A professional editorial photograph of a zinc smelting plant's roasting furnace area, showing large industrial equipment, pipes, and control panels, clean composition, natural industrial lighting. |

---

## IX. Content Outline

### Part 1: Introduction & Problem

#### Slide 01 - Cover
- **Layout**: Full-screen background image + centered title
- **Title**: Adaptive Multimode Process Monitoring Based on Mode-Matching and Similarity-Preserving Dictionary Learning
- **Subtitle**: Keke Huang, Zui Tao, Yishun Liu, et al. | IEEE Trans. Cybernetics, 2023
- **Info**: Central South University

#### Slide 02 - Table of Contents
- **Layout**: Three-column cards
- **Title**: Outline
- **Content**:
  - 1. Problem & Motivation
  - 2. Methodology: JMSDL
  - 3. Experiments: Numerical, CSTH, Roasting
  - 4. Conclusion & Future Work

#### Slide 03 - Problem Statement
- **Layout**: Asymmetric split (3:7)
- **Title**: The Challenge of Multimode Process Monitoring
- **Visualization**: comparison_table
- **Content**:
  - **Left (Text)**: Real industrial processes (e.g., zinc roasting) have multiple modes (efficient, healthy, over-decomposition, under-oxidation). New modes emerge continuously.
  - **Right (Visual)**: A diagram showing data from 4 different modes with different distributions (scatter plot style), highlighting the "model mismatch" problem.
  - **Key Point**: "Model mismatch" + "Catastrophic forgetting" = poor monitoring performance.

#### Slide 04 - Related Work & Gap
- **Layout**: Three-column cards
- **Title**: Existing Methods and Their Limitations
- **Visualization**: comparison_table
- **Content**:
  - **Card 1 (Multiple Models)**: e.g., mPCA. Limitation: High complexity, model count grows.
  - **Card 2 (Global Modeling)**: e.g., LCDL. Limitation: Statistical averaging, poor per-mode accuracy.
  - **Card 3 (Online Updating)**: e.g., ODL. Limitation: Catastrophic forgetting.
  - **Bottom Takeaway**: No existing method solves both problems simultaneously.

---

### Part 2: Methodology

#### Slide 05 - Proposed Method: JMSDL Overview
- **Layout**: Top-bottom split
- **Title**: Jointly Mode-Matching and Similarity-Preserving Dictionary Learning (JMSDL)
- **Visualization**: jmsdl_framework.png
- **Content**:
  - **Top**: Framework diagram (image).
  - **Bottom**: Two core components.
    - **Mode Matching**: Minimize ||Xn - DnW||²_F (learn new mode).
    - **Similarity Preserving**: Minimize tr(I - D_o^T D_n) (keep old knowledge).
  - **Workflow**: K-SVD (Mode 1) → JMSDL (Mode 2) → ... → JMSDL (Mode N).

#### Slide 06 - Method Detail: Optimization
- **Layout**: Single column centered
- **Title**: JMSDL Optimization Problem
- **Content**:
  - **Objective Function**:
    `min ||Xn - DnW||²_F + λ1·tr(I - D_o^T D_n) + λ2||W||₁`
  - **Explanation**:
    - **Term 1 (Reconstruction)**: Ensures Dn can represent new mode data Xn.
    - **Term 2 (Preservation)**: Forces Dn to be similar to Do (diagonal of similarity matrix → 1).
    - **Term 3 (Sparsity)**: Ensures sparse representation.
  - **Key Insight**: The `tr(I - D_o^T D_n)` term is the core novelty. It prevents catastrophic forgetting without needing old data.

#### Slide 07 - Method Detail: Algorithm & Online Monitoring
- **Layout**: Asymmetric split (3:7)
- **Title**: Optimization Algorithm & Online Monitoring
- **Content**:
  - **Left (Algorithm Steps)**:
    1. Fix W, update Dn via matrix decomposition.
    2. Fix Dn, update W via OMP.
    3. Iterate until convergence.
  - **Right (Online Monitoring)**:
    - **Step 1**: Calculate control limit R_tr from training data using KDE.
    - **Step 2**: For new data x_new, compute IRE = ||x_new - D_c w_new||².
    - **Decision**: IRE > R_tr → Fault; else → Normal.

---

### Part 3: Experiments

#### Slide 08 - Experiment 1: Numerical Simulation
- **Layout**: Top-bottom split
- **Title**: Numerical Simulation Results
- **Visualization**: grouped_bar_chart
- **Content**:
  - **Setup**: 4 modes, 20-dim data, +4 bias fault.
  - **Top (Chart)**: Grouped bar chart comparing FDR of mPCA, DL, LCDL, ODL, JMSDL across 4 modes.
  - **Bottom (Key Finding)**: JMSDL achieves highest average FDR and lowest FAR. No catastrophic forgetting (MRE for mode 1 stays low after learning modes 2-4).

#### Slide 09 - Experiment 2: CSTH Process
- **Layout**: Top-bottom split
- **Title**: CSTH Process Benchmark Results
- **Visualization**: grouped_bar_chart + comparison_table
- **Content**:
  - **Setup**: 3 modes, 3 fault cases (bias on level, multiplicative on temp, multiplicative on flow).
  - **Top (Chart)**: Grouped bar chart of FDR for each method on each fault.
  - **Bottom (Table)**: MRE of D1, D2, D3 for each mode (showing D3 has low MRE for all 3 modes).

#### Slide 10 - Experiment 3: Real Roasting Process
- **Layout**: Top-bottom split
- **Title**: Industrial Roasting Process Results
- **Visualization**: grouped_bar_chart
- **Content**:
  - **Top (Image)**: Photo of the roasting plant.
  - **Bottom (Chart)**: FDR/FAR comparison. JMSDL outperforms all others. DL fails on mode 4 (catastrophic forgetting). ODL has high FAR.

#### Slide 11 - Results Summary
- **Layout**: Single column centered
- **Title**: Summary of Results
- **Visualization**: comparison_table
- **Content**:
  - **Table**: Method | FDR (Avg) | FAR (Avg) | Catastrophic Forgetting?
    - mPCA: Medium | Medium | N/A
    - DL: Low | High | Yes
    - LCDL: Low | Low | No
    - ODL: Medium | High | Yes
    - **JMSDL**: **High** | **Low** | **No**
  - **Limitation**: JMSDL is supervised (requires mode labels).

---

### Part 4: Conclusion

#### Slide 12 - Conclusion & Future Work
- **Layout**: Two-column cards
- **Title**: Conclusion & Future Work
- **Content**:
  - **Left (Conclusion)**:
    - JMSDL solves model mismatch via mode-matching term.
    - JMSDL solves catastrophic forgetting via similarity-preserving term.
    - Outperforms state-of-the-art on 3 benchmarks.
  - **Right (Future Work)**:
    - Fine-grained similarity (different weights per atom).
    - Unsupervised/semi-supervised mode identification.

#### Slide 13 - Key References
- **Layout**: Single column centered
- **Title**: Key References
- **Content**:
  - [14] K-SVD (Aharon, 2006)
  - [32] ODL (Huang, 2021)
  - [30] LCDL (Ning, 2015)
  - [29] mPCA (Xu, 2014)

#### Slide 14 - Thank You
- **Layout**: Single column centered
- **Title**: Thank You
- **Subtitle**: Questions? | Keke Huang, Central South University

---

## X. Speaker Notes Requirements

- **File naming**: `notes/01_cover.md`, `notes/02_toc.md`, etc.
- **Total duration**: ~20 minutes (1.5 min per slide average)
- **Notes style**: Formal, concise, data-driven
- **Presentation purpose**: Inform and persuade (inform about JMSDL, persuade of its superiority)

---

## XI. Technical Constraints Reminder

### SVG Generation Must Follow:

1. viewBox: `0 0 1280 720`
2. Background uses `<rect>` elements
3. Text wrapping uses `<tspan>` (`<foreignObject>` FORBIDDEN)
4. Transparency uses `fill-opacity` / `stroke-opacity`; `rgba()` FORBIDDEN
5. FORBIDDEN: `mask`, `<style>`, `class`, `foreignObject`
6. FORBIDDEN: `textPath`, `animate*`, `script`
7. Text characters: write typography & symbols as raw Unicode (em dash `—`, en dash `–`, `©`, `®`, `→`, NBSP, etc.); HTML named entities (`&nbsp;`, `&mdash;`, `&copy;`, `&reg;` …) are FORBIDDEN. XML reserved chars in text MUST be escaped as `&amp;` `&lt;` `&gt;` `&quot;` `&apos;` (e.g. `R&amp;D`, `error &lt; 5%`).
8. `marker-start` / `marker-end` conditionally allowed.
9. `clipPath` conditionally allowed **only on `<image>` elements**.

### PPT Compatibility Rules:

- `<g opacity="...">` FORBIDDEN; set on each child element individually.
- Image transparency uses overlay mask layer.
- Inline styles only; external CSS and `@font-face` FORBIDDEN.