# SpiRob Midterm Report - Design Spec

> Human-readable design narrative for the SpiRob bio-inspired spiral soft robot midterm presentation.
>
> Machine-readable execution contract: `spec_lock.md`

## I. Project Information

| Item | Value |
| ---- | ----- |
| **Project Name** | SpiRob Midterm Report |
| **Canvas Format** | PPT 16:9 (1280x720) |
| **Page Count** | 22 |
| **Design Style** | A) General Versatile + Academic Blue Simple |
| **Target Audience** | Robot course midterm defense review committee |
| **Use Case** | Classroom midterm presentation defense |
| **Created Date** | 2026-05-10 |

---

## II. Canvas Specification

| Property | Value |
| -------- | ----- |
| **Format** | PPT 16:9 |
| **Dimensions** | 1280x720 |
| **viewBox** | `0 0 1280 720` |
| **Margins** | left/right 40px, top/bottom 30px |
| **Content Area** | 1200x660 |

---

## III. Visual Theme

### Theme Style

- **Style**: Academic blue simple defense
- **Theme**: Light theme
- **Tone**: Clean, structured, academic, blue-toned

### Color Scheme

| Role | HEX | Purpose |
| ---- | --- | ------- |
| **Background** | `#FFFFFF` | Page background |
| **Primary** | `#324274` | Corner triangles, chapter blocks, icons, borders |
| **Accent** | `#6096E6` | Connecting lines, emphasis elements |
| **Highlight** | `#F4C542` | SpiRob key highlights, accent yellow |
| **Body text** | `#0D0D0D` | Main body text |
| **Secondary text** | `#404040` | Descriptive text, annotations |
| **Tertiary text** | `#6C7785` | Footers, supplementary info |
| **Border/divider** | `#D8DEE8` | Card borders, divider lines |
| **Light bg** | `#EAF1F8` | Light blue background panels |

---

## IV. Typography System

### Font Plan

**Typography direction**: Modern CJK sans, academic clean

| Role | Chinese | English | Fallback tail |
| ---- | ------- | ------- | ------------- |
| **Title** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |
| **Body** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |

**Per-role font stacks**:

- Title: `"Microsoft YaHei", "PingFang SC", Arial, sans-serif`
- Body: `"Microsoft YaHei", "PingFang SC", Arial, sans-serif`

### Font Size Hierarchy

**Baseline**: Body font size = 20px

| Purpose | Ratio to body | Size | Weight |
| ------- | ------------- | ---- | ------ |
| Cover title | 2.6x | 52px | Bold |
| Chapter opener | 2.0x | 40px | Bold |
| Page title | 1.6x | 32px | Bold |
| Subtitle | 1.3x | 26px | SemiBold |
| **Body content** | **1x** | **20px** | Regular |
| Annotation | 0.7x | 14px | Regular |
| Page number | 0.6x | 12px | Regular |

---

## V. Layout Principles

### Page Structure

- **Header area**: 30px from top, page title + subtitle
- **Content area**: 80px-660px vertical, main content
- **Footer area**: 660px-690px, page number + branding

### Signature Design Elements (from blue_simple_defense template)

- **Four-corner right triangles**: `#324274` triangles at each corner, ~271x271px
- **White inner frame**: Main content area at x=25.8 y=23.4 1228.4x673.2, `#324274` border
- **Circle icon containers**: `#324274` filled ellipses for numbering, rx/ry ~35-55px
- **Rounded rect cards**: `#324274` bordered rounded rects for content, rx ~13-47px

### Layout Patterns Used

| Pattern | Suitable Scenarios |
| ------- | ----------------- |
| **Single column centered** | Cover, chapter dividers, ending |
| **Three-column cards** | Feature overviews, parallel points |
| **Left flow + right cards** | System architecture, process flows |
| **Dual-column comparison** | Before/after, problems vs solutions |
| **Image + text side-by-side** | Hardware photos, experiment results |
| **Vertical timeline** | Roadmaps, phased plans |
| **Table layout** | Parameter tables, comparison matrices |

---

## VI. Icon Usage Specification

### Source

- **Built-in icon library**: `tabler-outline`
- **Stroke width**: 2px

### Recommended Icon List

| Purpose | Icon Path | Page |
| ------- | --------- | ---- |
| Robot / SpiRob | `tabler-outline/robot` | P04, P05, P08 |
| Motor / Drive | `tabler-outline/circuit-motor` | P09, P13 |
| Embedded / CPU | `tabler-outline/cpu` | P12, P15 |
| Target / Goal | `tabler-outline/target` | P06 |
| Vision / Eye | `tabler-outline/eye` | P21 |
| Microphone / Voice | `tabler-outline/microphone` | P21 |
| Settings / System | `tabler-outline/settings` | P10, P11 |
| Layers / Architecture | `tabler-outline/layers` | P10, P12 |
| Cube / 3D Print | `tabler-outline/cube` | P12 |
| Bolt / Power | `tabler-outline/bolt` | P13 |
| Tools / Hardware | `tabler-outline/tools` | P13 |
| Chart / Results | `tabler-outline/chart-bar` | P19, P20 |
| Check / Verified | `tabler-outline/circle-check` | P19 |
| Flag / Milestone | `tabler-outline/flag` | P21 |
| Rocket / Future | `tabler-outline/rocket` | P21 |
| Bulb / Innovation | `tabler-outline/bulb` | P08 |
| Clipboard / List | `tabler-outline/clipboard-list` | P21 |
| Users / Team | `tabler-outline/users` | P01, P22 |
| Arrow Right / Flow | `tabler-outline/arrow-right` | P05, P06 |
| Plug / Connection | `tabler-outline/plug` | P13 |

---

## VII. Visualization Reference List

**Read-audit**:

```
Catalog read: 70 templates / 10 categories
Runners-up considered: process_flow (rejected: P10 needs layered view not linear flow), numbered_steps (rejected: P17 needs sequential timeline not step list), consulting_table (rejected: P11 needs architecture layers not consulting format)
```

| Visualization Type | Reference Template | Used In |
| ------------------ | ------------------ | ------- |
| layered_architecture | `templates/charts/layered_architecture.svg` | P10 |
| consulting_table | `templates/charts/consulting_table.svg` | P11 |
| timeline | `templates/charts/timeline.svg` | P21 |

---

## VIII. Image Resource List

| Filename | Dimensions | Ratio | Purpose | Type | Status | Generation Description |
| -------- | --------- | ----- | ------- | ---- | ------ | --------------------- |
| slide_05_image_05.jpg | 161371 bytes | landscape | System concept diagram | Diagram | Existing | From template PPTX |
| slide_06_image_16.jpg | 202648 bytes | landscape | 3D SpiRob photo | Photography | Existing | From template PPTX |
| slide_06_image_17.jpg | 399590 bytes | landscape | 3D SpiRob photo 2 | Photography | Existing | From template PPTX |
| slide_07_image_18.png | 23949 bytes | landscape | SpiRob hardware photo | Photography | Existing | From template PPTX |
| slide_12_image_28.png | 22798 bytes | square | SpiRob body photo | Photography | Existing | From SpiRob PPTX |
| slide_12_image_29.png | 22273 bytes | square | SpiRob body photo 2 | Photography | Existing | From SpiRob PPTX |
| slide_12_image_30.jpg | 34341 bytes | landscape | SpiRob body photo 3 | Photography | Existing | From SpiRob PPTX |
| slide_13_image_33.png | 15210 bytes | square | Circuit diagram | Diagram | Existing | From SpiRob PPTX |
| slide_17_image_41.jpg | 34656 bytes | landscape | Grasping sequence | Photography | Existing | From SpiRob PPTX |
| slide_19_image_42.jpg | 26143 bytes | landscape | Grasp result 1 | Photography | Existing | From SpiRob PPTX |
| slide_19_image_43.jpg | 27235 bytes | landscape | Grasp result 2 | Photography | Existing | From SpiRob PPTX |
| slide_19_image_44.jpg | 9493 bytes | landscape | Grasp result 3 | Photography | Existing | From SpiRob PPTX |
| slide_20_image_45.jpg | 8082 bytes | landscape | Multi-target demo 1 | Photography | Existing | From SpiRob PPTX |
| slide_20_image_46.jpg | 24851 bytes | landscape | Multi-target demo 2 | Photography | Existing | From SpiRob PPTX |
| slide_20_image_47.jpg | 28923 bytes | landscape | Multi-target demo 3 | Photography | Existing | From SpiRob PPTX |
| slide_20_image_48.jpg | 11061 bytes | landscape | Multi-target demo 4 | Photography | Existing | From SpiRob PPTX |

---

## IX. Content Outline

### Part 1: Project Background and Research Motivation

#### Slide 01 - Cover

- **Layout**: Full template cover
- **Title**: 仿生对数螺旋软体机器人（SpiRob）手持式柔性机器夹爪系统 中期汇报
- **Subtitle**: 机器人学课程 2026年5月
- **Info**: 答辩人：机器人第7小组

#### Slide 02 - Table of Contents

- **Layout**: Template TOC with 4 circle-numbered sections
- **Sections**: 01 项目背景与研究动机 / 02 系统设计与实现 / 03 实验结果展示 / 04 不足与后期规划

#### Slide 03 - Chapter: Part 1

- **Layout**: Template chapter divider
- **Title**: 项目背景与研究动机
- **Subtitle**: Research Background and Motivation

#### Slide 04 - Overview Cards

- **Layout**: Three-column cards (template 004_content)
- **Title**: 01. 项目背景与研究动机
- **Content**: Three cards: 开题方案回顾 / 项目路线调整 / 中期研究主线, with brief descriptions

#### Slide 05 - Initial Proposal Review

- **Layout**: Complex grid with image + flow
- **Title**: 开题方案回顾：面向果蔬自动抓取与分拣的整机系统
- **Content**: Five modules (果槽工位 / 顶视视觉 / XYZ龙门平台 / SpiRob夹爪 / 目标分拣框) + closed-loop workflow

#### Slide 06 - Route Adjustment

- **Layout**: Image + text comparison
- **Title**: 项目路线调整：从整机平台转向核心夹爪控制
- **Content**: 3D too complex -> 2D gripper control decision, with comparison photos

#### Slide 07 - Mid-term Research Mainline

- **Layout**: Three-column with icons
- **Title**: 01. 中期研究主线
- **Content**: Three pillars: 硬件 / 嵌入式 / 控制, each with key description

#### Slide 08 - Bio-inspiration & Design Goals

- **Layout**: Grid with images + text
- **Title**: 01. SpiRob 仿生原理与设计目标
- **Content**: Bio-inspiration from octopus, logarithmic spiral principle, design objectives

### Part 2: System Design and Implementation

#### Slide 09 - Chapter: Part 2

- **Layout**: Template chapter divider
- **Title**: 系统设计与实现
- **Subtitle**: System Design and Implementation

#### Slide 10 - System Architecture Overview

- **Layout**: Three-column cards with icons
- **Title**: 02. 系统总体架构
- **Content**: Three architecture views: 执行层 / 驱动层 / 嵌入式层

#### Slide 11 - Architecture Layer Table

- **Layout**: Table layout
- **Title**: 02. 系统总体架构 - 层级结构
- **Content**: Five-layer table: 执行层/驱动层/控制层/电源层/结构层 with 组成 and 功能

#### Slide 12 - Hardware: Body & Shell

- **Layout**: Image grid + text descriptions
- **Title**: 02. 硬件 - 机器人本体与3D打印外壳
- **Content**: SpiRob body (discrete units, logarithmic spiral) + PETG shell design + photos

#### Slide 13 - Hardware: Motor Circuit

- **Layout**: Image + parameter cards
- **Title**: 02. 硬件 - 步进电机控制电路
- **Content**: 24V power, DM422 drivers, stepper motors, circuit diagram

#### Slide 14 - Chapter: Embedded Control

- **Layout**: Template chapter divider (sub-chapter)
- **Title**: 嵌入式控制系统
- **Subtitle**: Embedded Control System

#### Slide 15 - Three-Layer Software Architecture

- **Layout**: Three-column cards
- **Title**: 02. 嵌入式 - 三层软件架构
- **Content**: Layer 1 (底层电机接口) / Layer 2 (中层运动接口) / Layer 3 (高层组合动作)

#### Slide 16 - Pulse Control & Cable Conversion

- **Layout**: Parameter cards + formula
- **Title**: 02. 嵌入式 - 脉冲控制与拉线换算
- **Content**: Key parameters (1600 pulses/rev, 1MHz timer, 5mm spool) + conversion formula

#### Slide 17 - Four-Stage Grasping Process

- **Layout**: Horizontal timeline/sequence
- **Title**: 02. 嵌入式 - 四阶段仿生抓取流程
- **Content**: Packing -> Reaching -> Wrapping -> Grasping with parameter table

### Part 3: Experimental Results

#### Slide 18 - Chapter: Part 3

- **Layout**: Template chapter divider
- **Title**: 实验结果展示
- **Subtitle**: Experimental Results

#### Slide 19 - Grasping Capability Verification

- **Layout**: Image comparison + conclusion
- **Title**: 03. 实验结果 - 抓取能力验证
- **Content**: Three target types (flat object / umbrella / tape roll) + experimental conclusions

#### Slide 20 - Multi-target Adaptability Demo

- **Layout**: Four-image grid
- **Title**: 03. 实验结果 - 多目标适应性展示
- **Content**: Body structure / dual driver / tape roll wrapping / bottle grasping photos

### Part 4: Limitations and Future Plans

#### Slide 21 - Problems & Future Roadmap

- **Layout**: Dual-column (problems left, roadmap right)
- **Title**: 04. 当前不足与后期规划
- **Content**: Left: 4 problems (no home position / fixed freq / open loop / messy wiring). Right: 5-phase roadmap (structure -> motion -> vision -> voice -> integration)

### Ending

#### Slide 22 - Thank You

- **Layout**: Template ending
- **Title**: 感谢观看
- **Info**: 答辩人：机器人第7小组 / 机器人学课程 2026年5月

---

## X. Speaker Notes Requirements

- **Filename**: match SVG name (e.g., `01_cover.md`)
- **Notes style**: Formal academic, concise key points
- **Duration**: ~15-20 minutes total
- **Purpose**: Inform and report on midterm progress

---

## XI. Technical Constraints Reminder

### SVG Generation Must Follow:

1. viewBox: `0 0 1280 720`
2. Background uses `<rect>` elements
3. Text wrapping uses `<tspan>` (`<foreignObject>` FORBIDDEN)
4. Transparency uses `fill-opacity` / `stroke-opacity`; `rgba()` FORBIDDEN
5. FORBIDDEN: `mask`, `<style>`, `class`, `foreignObject`
6. FORBIDDEN: `textPath`, `animate*`, `script`
7. Text: raw Unicode for symbols; HTML named entities FORBIDDEN
8. `clipPath` only on `<image>` elements

### PPT Compatibility Rules:

- `<g opacity="...">` FORBIDDEN; set on each child element individually
- Image transparency uses overlay mask layer
- Inline styles only; external CSS FORBIDDEN
