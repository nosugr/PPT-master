# adaptive_paper - Design Spec

## I. Project Information

| Item | Value |
| ---- | ----- |
| **Project Name** | adaptive_paper |
| **Canvas Format** | PPT 16:9 (1280×720) |
| **Page Count** | 31 |
| **Design Style** | B) General Consulting + academic defense |
| **Target Audience** | 学术答辩评委、研究生同学 |
| **Use Case** | 论文复现答辩演示 |
| **Created Date** | 2026-05-21 |

---

## II. Canvas Specification

| Property | Value |
| -------- | ----- |
| **Format** | PPT 16:9 |
| **Dimensions** | 1280×720 |
| **viewBox** | `0 0 1280 720` |
| **Margins** | left 55px, right 63px, top 54px, bottom 48px |
| **Content Area** | 1162×618 |

---

## III. Visual Theme

### Theme Style

- **Style**: academic defense + consulting data clarity
- **Theme**: Light theme
- **Tone**: professional, clean, data-driven

### Color Scheme

| Role | HEX | Purpose |
| ---- | --- | ------- |
| **Background** | `#FFFFFF` | 页面白色背景 |
| **Secondary bg** | `#F7F8FA` | 卡片背景、区块底色 |
| **Primary** | `#2D3748` | 标题装饰、关键区块、图标（46.8%主色） |
| **Accent** | `#2A5F9A` | 数据高亮、章节标记、重点信息 |
| **Secondary accent** | `#183B6E` | 深蓝强调、章节标题 |
| **Body text** | `#2D3748` | 正文文字 |
| **Secondary text** | `#4A5568` | 注释、说明文字 |
| **Tertiary text** | `#6C7785` | 页码、脚注 |
| **Border/divider** | `#D8DEE8` | 卡片边框、分隔线 |
| **Success** | `#56CA95` | 正面指标（绿色） |
| **Warning** | `#F18870` | 问题标记（红色） |

### Gradient Scheme

```xml
<!-- 章节页顶部装饰条 -->
<linearGradient id="sectionBar" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%" stop-color="#183B6E"/>
  <stop offset="100%" stop-color="#2A5F9A"/>
</linearGradient>
```

---

## IV. Typography System

### Font Plan

**Typography direction**: modern CJK sans (微软雅黑为主)

| Role | Chinese | English | Fallback tail |
| ---- | ------- | ------- | ------------- |
| **Title** | `微软雅黑` | `Arial` | `sans-serif` |
| **Body** | `微软雅黑` | `Arial` | `sans-serif` |
| **Emphasis** | `微软雅黑` | `Arial` | `sans-serif` |
| **Code** | — | `Consolas, "Courier New"` | `monospace` |

**Per-role font stacks**:

- Title: `"Microsoft YaHei", Arial, sans-serif`
- Body: `"Microsoft YaHei", Arial, sans-serif`
- Emphasis: `"Microsoft YaHei", Arial, sans-serif`
- Code: `Consolas, "Courier New", monospace`

### Font Size Hierarchy

**Baseline**: Body font size = 20px

| Purpose | Ratio to body | px Value | Weight |
| ------- | ------------- | -------- | ------ |
| Cover title | 3x | 60px | Bold |
| Chapter opener | 2.2x | 44px | Bold |
| Page title | 1.5x | 30px | Bold |
| Subtitle | 1.2x | 24px | SemiBold |
| **Body content** | **1x** | **20px** | Regular |
| Annotation | 0.75x | 15px | Regular |
| Page number | 0.55x | 11px | Regular |

---

## V. Layout Principles

### Page Structure

- **Header area**: 100px — 页面标题 + 装饰条
- **Content area**: 500px — 主要内容区域
- **Footer area**: 40px — 页码 + 装饰

### Layout Pattern Library

| Pattern | Suitable Scenarios |
| ------- | ----------------- |
| Single column centered | 封面、感谢页、章节分隔页 |
| Symmetric split (5:5) | 对比分析（PCA vs RPCA） |
| Asymmetric split (3:7) | 图表为主 + 简要说明 |
| Top-bottom split | 流程图 + 文字说明 |
| Three-column cards | 并列要点、三步流程 |
| Matrix grid (2×2) | 四象限对比、方法对比 |

### Spacing Specification

**Universal**:

| Element | Value |
| ------- | ----- |
| Safe margin from canvas edge | 55px |
| Content block gap | 30px |
| Icon-text gap | 10px |

---

## VI. Icon Usage Specification

### Source

- **Built-in icon library**: `chunk-filled`（填充式、直线几何、专业感强）
- **Usage method**: SVG placeholder `<use data-icon="chunk-filled/icon-name" .../>`

### Recommended Icon List

| Purpose | Icon Path | Page |
| ------- | --------- | ---- |
| 工业/工厂 | `chunk-filled/factory` | P05 |
| 数据/图表 | `chunk-filled/chart-bar` | P07, P18-P23 |
| 算法/流程 | `chunk-filled/settings` | P10-P17 |
| 检测/监测 | `chunk-filled/shield-check` | P15, P18 |
| 问题/警告 | `chunk-filled/alert-triangle` | P25-P27 |
| 总结/完成 | `chunk-filled/checkmark` | P29-P30 |

---

## VII. Visualization Reference List

本PPT包含数据可视化页面，主要为实验结果对比图表。

| Visualization Type | Reference Template | Used In |
| ------------------ | ------------------ | ------- |
| bar_chart | 自定义柱状图 | P21 (FAR/FDR对比) |
| line_chart | 自定义折线图 | P19 (λ₁敏感性) |
| heatmap | 自定义热力图 | P16 (字典可视化) |

---

## VIII. Image Resource List

| Filename | Dimensions | Purpose | Type | Status | Acquire Via |
| -------- | --------- | ------- | ---- |-------- | ----------- |
| paper_p2_0.jpeg | 983×449 | 单模态vs多模态数据可视化 (Fig.1) | Diagram | Existing | user |
| paper_p3_0.jpeg | 978×596 | ODL灾难性遗忘现象 (Fig.2) | Diagram | Existing | user |
| paper_p5_0.jpeg | 1987×820 | JMSDL框架图 (Fig.3) | Diagram | Existing | user |
| paper_p6_0.jpeg | 1954×1093 | 字典更新步骤 (Fig.4) | Diagram | Existing | user |
| paper_p8_0.jpeg | 975×721 | λ₁对ds的影响 (Fig.5) | Diagram | Existing | user |
| paper_p8_1.jpeg | 997×516 | Do-Dn热力图 (Fig.6) | Diagram | Existing | user |
| paper_p9_0.jpeg | 1983×923 | 数据表示效果对比 (Fig.7) | Diagram | Existing | user |
| paper_p9_1.jpeg | 984×681 | MRE指标 (Fig.8) | Diagram | Existing | user |
| paper_p10_0.jpeg | 990×1153 | 数值仿真监测结果 (Fig.9) | Diagram | Existing | user |
| paper_p10_1.jpeg | 992×779 | CSTH过程示意图 (Fig.10) | Diagram | Existing | user |
| paper_p11_0.jpeg | 1917×514 | CSTH表示效果 (Fig.11) | Diagram | Existing | user |
| paper_p11_1.jpeg | 972×393 | CSTH MRE表格 (Table II) | Diagram | Existing | user |
| paper_p11_2.jpeg | 1000×1160 | CSTH监测结果 (Fig.12) | Diagram | Existing | user |
| paper_p12_0.jpeg | 1006×1144 | 焙烧过程结构 (Fig.13) | Diagram | Existing | user |
| paper_p12_1.jpeg | 997×690 | 焙烧过程表示效果 (Fig.14) | Diagram | Existing | user |
| paper_p12_2.jpeg | 1017×775 | 焙烧过程MRE (Fig.15) | Diagram | Existing | user |

---

## IX. Content Outline

### Part 1: 工业背景与基线模型

#### Slide 01 - Cover

- **Layout**: 全屏背景 + 居中标题
- **Title**: 自适应多模态过程监测
- **Subtitle**: 基于模式匹配与相似性保持的字典学习
- **Info**: Adaptive Multimode Process Monitoring Based on Mode-Matching and Similarity-Preserving Dictionary Learning

#### Slide 02 - 目录

- **Layout**: 五部分导航卡片
- **Title**: 目录
- **Content**: Part 1-5 导航

#### Slide 03 - Part分隔页

- **Layout**: 章节分隔页（居中）
- **Title**: PART.01 工业背景与基线模型
- **Subtitle**: Industrial Background and Baseline Model

#### Slide 04 - 章节概述

- **Layout**: 三步逻辑流程图
- **Title**: 工业背景与基线模型
- **Content**: 背景→问题→方法改进 三步逻辑链

#### Slide 05 - 工业背景

- **Layout**: 左文右图
- **Title**: 工业背景：多模态过程的产生
- **Content**: 制造策略变化、生产技术更新导致多模态过程；SCADA系统积累大量历史数据；模型难以适应新模态

#### Slide 06 - 现有方法局限

- **Layout**: 三列卡片对比
- **Title**: 现有三类方法及其局限
- **Content**: 多模型法（模型数量膨胀）、全局建模法（统计平均效应）、在线更新法（灾难性遗忘）

#### Slide 07 - 字典学习基础

- **Layout**: 左文右图
- **Title**: 字典学习（DL）基础
- **Content**: K-SVD初始化 + OMP稀疏编码 + 交替优化；目标函数 min ||X-DW||² s.t. ||w||₀≤T

#### Slide 08 - 灾难性遗忘

- **Layout**: 图文混排
- **Title**: "灾难性遗忘"现象
- **Content**: ODL方法随模型更新，对历史模态重建误差递增；论文Fig.2可视化

### Part 2: JMSDL 方法原理

#### Slide 09 - Part分隔页

- **Layout**: 章节分隔页
- **Title**: PART.02 JMSDL方法原理
- **Subtitle**: JMSDL Method Principles

#### Slide 10 - 核心思想

- **Layout**: 双栏对比
- **Title**: JMSDL核心思想
- **Content**: 模式匹配（mode-matching）+ 相似性保持（similarity-preserving）

#### Slide 11 - 目标函数

- **Layout**: 公式展示 + 说明
- **Title**: JMSDL目标函数
- **Content**: min ||Xn-DnW||² + λ₁tr(I-D₀ᵀDn) + λ₂||W||₁

#### Slide 12 - Dn更新推导

- **Layout**: 公式推导流程
- **Title**: Dₙ 更新：相似性保持
- **Content**: 相似性矩阵 → 正交对角化 → 闭式解 Dn=QMᵀ

#### Slide 13 - W更新

- **Layout**: 公式 + 流程
- **Title**: W 更新：OMP稀疏编码
- **Content**: 固定Dn，用OMP求解 min ||Xn-DnW||² + λ₂||W||₁

#### Slide 14 - 算法流程

- **Layout**: 流程图
- **Title**: JMSDL算法完整流程
- **Content**: Algorithm 1：初始化→Step1更新Dn→Step2-4分解B计算Q→Step5 Dn=QMᵀ→Step6归一化→Step7 OMP求W→迭代

#### Slide 15 - 在线监测

- **Layout**: 双栏（公式+流程）
- **Title**: 在线监测：IRE与KDE控制限
- **Content**: IRE = ||x-ˆx||²; KDE计算控制限Rtr; IRE>Rtr则判定故障

#### Slide 16 - 字典更新可视化

- **Layout**: 图片展示
- **Title**: 字典逐步更新过程
- **Content**: D₁→D₂→D₃→D₄ 逐步学习新模态；论文Fig.4/6

### Part 3: 实验验证

#### Slide 17 - Part分隔页

- **Layout**: 章节分隔页
- **Title**: PART.03 实验验证
- **Subtitle**: Experimental Verification

#### Slide 18 - 数值仿真设置

- **Layout**: 公式 + 说明
- **Title**: 数值仿真：数据生成系统
- **Content**: x = Aᵢs + e; 四模态数据; 4000训练+1000测试样本

#### Slide 19 - 参数敏感性

- **Layout**: 图表展示
- **Title**: λ₁敏感性分析与字典相似度
- **Content**: λ₁增大→ds增大; 字典Do-Dn热力图; 论文Fig.5/6

#### Slide 20 - 数据表示实验

- **Layout**: 对比图表
- **Title**: 数据表示：DL vs JMSDL
- **Content**: DL面临灾难性遗忘; JMSDL持续学习保持低MRE; 论文Fig.7/8

#### Slide 21 - 数值仿真监测

- **Layout**: 对比图表
- **Title**: 数值仿真监测结果对比
- **Content**: 五种方法(mPCA/DL/LCDL/ODL/JMSDL)的FAR/FDR对比; 论文Fig.9

#### Slide 22 - CSTH实验

- **Layout**: 图文混排
- **Title**: CSTH过程实验
- **Content**: 三模态CSTH过程; 字典表示效果; 监测结果对比; 论文Fig.10-12

#### Slide 23 - 焙烧过程实验

- **Layout**: 图文混排
- **Title**: 锌冶炼焙烧过程实验
- **Content**: 四工况焙烧过程; 25维变量; 监测效果对比; 论文Fig.13-16

### Part 4: 讨论与分析

#### Slide 24 - Part分隔页

- **Layout**: 章节分隔页
- **Title**: PART.04 讨论与分析
- **Subtitle**: Discussion and Analysis

#### Slide 25 - 超参数选择

- **Layout**: 表格 + 说明
- **Title**: 超参数选择策略
- **Content**: 字典大小、稀疏度T、λ₁的网格搜索策略

#### Slide 26 - 与ODL对比

- **Layout**: 双栏对比
- **Title**: JMSDL vs ODL：保持项消除遗忘
- **Content**: ODL无保持项→遗忘; JMSDL保持项→持续学习

#### Slide 27 - 与其他方法对比

- **Layout**: 对比表格
- **Title**: 与其他方法的优势分析
- **Content**: vs LCDL/mPCA/DL 各方法优劣对比

### Part 5: 总结与展望

#### Slide 28 - Part分隔页

- **Layout**: 章节分隔页
- **Title**: PART.05 总结与展望
- **Subtitle**: Conclusion and Future Work

#### Slide 29 - 贡献总结

- **Layout**: 三列卡片
- **Title**: 三大贡献
- **Content**: ①JMSDL方法 ②克服灾难性遗忘 ③持续学习框架

#### Slide 30 - 局限与展望

- **Layout**: 双栏
- **Title**: 局限性与未来工作
- **Content**: 监督方法局限; 更细粒度处理; 原子相似性差异

#### Slide 31 - 感谢页

- **Layout**: 居中
- **Title**: 感谢观看
- **Subtitle**: THANKS

---

## X. Speaker Notes Requirements

- **Filename**: match SVG name (e.g., `01_cover.md`)
- **Content**: script key points, timing cues, transition phrases
- **Total duration**: ~20-25 minutes
- **Notes style**: formal academic
- **Presentation purpose**: inform + report

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
8. `marker-start` / `marker-end` conditionally allowed
9. `clipPath` conditionally allowed only on `<image>` elements

### PPT Compatibility Rules:

- `<g opacity="...">` FORBIDDEN (set on each child element individually)
- Image transparency uses overlay mask layer
- Inline styles only; external CSS and `@font-face` FORBIDDEN
