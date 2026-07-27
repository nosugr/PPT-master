# JSSDL 论文复现汇报 - Design Spec

> Human-readable design narrative for JSSDL reproduction report PPT.

## I. Project Information

| Item | Value |
| ---- | ----- |
| **Project Name** | JSSDL 论文复现汇报 |
| **Canvas Format** | PPT 16:9 (1280 x 720) |
| **Page Count** | 18 |
| **Design Style** | 蓝色简约学术答辩 |
| **Target Audience** | 导师与评审专家（学术答辩） |
| **Use Case** | 论文复现工作汇报 |
| **Created Date** | 2026-05-15 |

---

## II. Canvas Specification

| Property | Value |
| -------- | ----- |
| **Format** | PPT 16:9 |
| **Dimensions** | 1280 x 720 px |
| **viewBox** | `0 0 1280 720` |
| **Margins** | left/right 64px, top/bottom 50px |
| **Content Area** | 1152 x 620 px |

---

## III. Visual Theme

### Theme Style

- **Style**: 蓝色简约学术答辩
- **Theme**: Light theme
- **Tone**: 专业、清晰、学术

### Color Scheme

| Role | HEX | Purpose |
| ---- | --- | ------- |
| **Background** | `#FFFFFF` | 页面背景 |
| **Secondary bg** | `#F0F4F8` | 卡片背景、章节色块 |
| **Primary** | `#324274` | 标题装饰、章节色块、强调线 |
| **Accent** | `#6096E6` | 数据高亮、图表强调 |
| **Secondary accent** | `#58B6E5` | 渐变辅助、装饰 |
| **Body text** | `#333333` | 正文文字 |
| **Secondary text** | `#666666` | 标注、说明 |
| **Tertiary text** | `#999999` | 页码、脚注 |
| **Border/divider** | `#D0D8E0` | 卡片边框、分隔线 |
| **Success** | `#56CA95` | 正向指标 |
| **Warning** | `#F18870` | 异常标记 |

---

## IV. Typography System

### Font Plan

| Role | Chinese | English | Fallback tail |
| ---- | ------- | ------- | ------------- |
| **Title** | Microsoft YaHei | Arial | sans-serif |
| **Body** | Microsoft YaHei | Arial | sans-serif |
| **Code** | — | Consolas, "Courier New" | monospace |

**Per-role font stacks**:

- Title: `"Microsoft YaHei", Arial, sans-serif`
- Body: `"Microsoft YaHei", Arial, sans-serif`
- Code: `Consolas, "Courier New", monospace`

### Font Size Hierarchy

**Baseline**: Body font size = 18px

| Purpose | Ratio to body | Size |
| ------- | ------------- | ---- |
| Cover title | 3.5x | 64px |
| Chapter opener | 2.5x | 48px |
| Page title | 2x | 36px |
| Subtitle | 1.5x | 28px |
| **Body content** | **1x** | **18px** |
| Annotation | 0.8x | 14px |
| Page number | 0.6x | 11px |

---

## V. Layout Principles

### Page Structure

- **Header area**: 50px — 标题 + 装饰线
- **Content area**: 570px — 主体内容
- **Footer area**: 50px — 页码 + 脚注

### Layout Pattern Library

| Pattern | Suitable Scenarios |
| ------- | ----------------- |
| Single column centered | 封面、总结、章节封面 |
| Asymmetric split (3:7) | 图文并排、图表+说明 |
| Full-bleed image | 数据热力图、监测曲线 |
| Two-column | 对比分析、双图展示 |
| Top-bottom split | 超宽图表 + 文字说明 |

---

## VI. Icon Usage Spec

- **Library**: `tabler-outline`
- **Stroke width**: 2
- **Inventory**: chart-bar, microscope, settings, report-analytics, math-function, check, alert-triangle, arrow-right

---

## VII. Visualization Reference List

本 deck 的图表均为用户提供的实验结果图片（PNG），不使用 charts/ 模板库中的可视化模板。所有数据可视化通过 `<image>` 标签嵌入。

---

## VIII. Image Resource List

| Filename | Purpose | Type | Status | no-crop |
| -------- | ------- | ---- | ------ | ------- |
| tep_train_correlation_heatmap.png | TEP 相关性热力图 | Diagram | Existing | yes |
| tep_train_standardized_heatmap.png | TEP 标准化热力图 | Diagram | Existing | yes |
| tep_train_top_variance_timeseries.png | TEP 高方差时序 | Diagram | Existing | yes |
| rpca_cleaning_arrows.png | RPCA 清理箭头图 | Diagram | Existing | yes |
| pca_rpca_projection_comparison.png | PCA/RPCA 投影对比 | Diagram | Existing | yes |
| exp1_D1_heatmap.png | D1 稀疏字典热力图 | Diagram | Existing | yes |
| exp1_D2_heatmap.png | D2 共享字典热力图 | Diagram | Existing | yes |
| exp1_P_heatmap.png | P 辅助矩阵热力图 | Diagram | Existing | yes |
| exp1_singular_values_boxplot.png | 奇异值下降图 | Diagram | Existing | yes |
| exp1_objective_curve.png | 目标函数收敛曲线 | Diagram | Existing | yes |
| effect_of_soft_threshold_on_rank_d2.png | tau 对 D2 秩的影响 | Diagram | Existing | yes |
| effect_tau_sparsity_d1_on_fdr_3d.png | FDR 3D 敏感性 | Diagram | Existing | yes |
| effect_tau_sparsity_d1_on_far_3d.png | FAR 3D 敏感性 | Diagram | Existing | yes |
| train_specific_heatmap.png | 特性成分热力图 | Diagram | Existing | yes |
| train_shared_heatmap.png | 共性成分热力图 | Diagram | Existing | yes |
| train_y_heatmap.png | 训练数据 Y 热力图 | Diagram | Existing | yes |
| test_heatmap.png | 测试集热力图 | Diagram | Existing | yes |
| exp1_pca_t2.png | PCA T2 监测曲线 | Diagram | Existing | yes |
| exp1_pca_spe.png | PCA SPE 监测曲线 | Diagram | Existing | yes |
| exp1_rpca_t2.png | RPCA rT2 监测曲线 | Diagram | Existing | yes |
| exp1_rpca_spe.png | RPCA rSPE 监测曲线 | Diagram | Existing | yes |
| exp1_dl_monitoring.png | DL DRE 监测曲线 | Diagram | Existing | yes |
| exp1_jssdl_monitoring.png | JSSDL JRE 监测曲线 | Diagram | Existing | yes |
| image17.png | ridge_X1 JSSDL 监测 | Diagram | Existing | yes |
| exp1_X1_train_vs_detection_boxplot_scale_diagnostic.png | OMP X1 系数诊断 | Diagram | Existing | yes |
| jssdl_lasso_monitoring.png | Lasso 监测曲线 | Diagram | Existing | yes |
| jssdl_lasso_x1_distribution.png | Lasso X1 分布 | Diagram | Existing | yes |

---

## IX. Content Outline

### Part 1: 封面与目录

#### Slide 01 - Cover

- **Layout**: 模板封面 (slide_01.svg 风格)
- **Title**: JSSDL 工业过程监测论文复现汇报
- **Subtitle**: 基于 Jointly Specific and Shared Dictionary Learning
- **Info**: 答辩人 / 导师 / 日期

#### Slide 02 - 目录

- **Layout**: 模板目录 (slide_02.svg 风格)
- **Title**: 目录
- **Content**:
  - 01 研究背景与问题定义
  - 02 基线模型及其不足
  - 03 JSSDL 模型原理与复现
  - 04 实验设计与结果展示
  - 05 复现问题与总结

### Part 2: 研究背景与问题定义

#### Slide 03 - 章节封面

- **Layout**: 模板章节封面 (slide_03.svg 风格)
- **Title**: 研究背景与问题定义
- **Subtitle**: Research Background and Problem Definition
- **Part**: PART.01

#### Slide 04 - 工业数据的共性与特性

- **Layout**: 左右分栏 (3:7)
- **Title**: 工业数据同时包含"共性"与"特性"
- **Content**:
  - 共性：跨样本反复出现的公共结构，强相关
  - 特性：工况切换导致的局部变化，稀疏性
  - 传统方法难以同时处理两类结构
- **Image**: tep_train_correlation_heatmap.png（右）

#### Slide 05 - TEP 数据可视化

- **Layout**: 上下分栏（两张图）
- **Title**: TEP 数据集中的共性与特性证据
- **Images**:
  - tep_train_standardized_heatmap.png（上）
  - tep_train_top_variance_timeseries.png（下）

### Part 3: 基线模型及其不足

#### Slide 06 - 章节封面

- **Layout**: 模板章节封面
- **Title**: 基线模型及其不足
- **Subtitle**: Baseline Models and Limitations
- **Part**: PART.02

#### Slide 07 - PCA 与 RPCA 原理

- **Layout**: 左右对比
- **Title**: PCA 的全局子空间假设 vs RPCA 的低秩-稀疏分解
- **Content**:
  - PCA：T2 + SPE，单一低维子空间
  - RPCA：X = L + S，剔除稀疏项后建模
  - 问题：RPCA 删除特性而非学习特性
- **Image**: rpca_cleaning_arrows.png

#### Slide 08 - 基线不足的定量证据

- **Layout**: 图 + 表格
- **Title**: PCA vs RPCA 投影空间对比
- **Image**: pca_rpca_projection_comparison.png
- **Table**: 方法 / FAR / FDR / 解读（PCA 10.3%/33.2%, RPCA 13.0%/48.7%, DL 16.8%/58.2%, JSSDL 10.5%/89.2%）

### Part 4: JSSDL 模型原理与复现

#### Slide 09 - 章节封面

- **Layout**: 模板章节封面
- **Title**: JSSDL 模型原理与复现实现
- **Subtitle**: JSSDL Model Principle and Reproduction
- **Part**: PART.03

#### Slide 10 - JSSDL 核心思想

- **Layout**: 公式 + 双图
- **Title**: 双字典联合建模：D1 表达特性，D2 表达共性
- **Content**:
  - Y ≈ D1 X1 + D2 X2
  - D1：L1 稀疏约束 → 稀疏特性原子
  - D2：核范数低秩约束 → 共享公共结构
- **Images**: exp1_D1_heatmap.png, exp1_D2_heatmap.png

#### Slide 11 - 优化过程与收敛

- **Layout**: 公式 + 图
- **Title**: 交替优化收敛到局部最优解
- **Content**:
  - 四步交替更新：D1 → P → D2 → X1/X2
  - P 通过软阈值牵引 D2 低秩
- **Images**: exp1_P_heatmap.png, exp1_singular_values_boxplot.png

#### Slide 12 - 参数敏感性分析

- **Layout**: 三图并排
- **Title**: 参数 τ 与 D1 稀疏度对检测性能的影响
- **Images**:
  - effect_of_soft_threshold_on_rank_d2.png
  - effect_tau_sparsity_d1_on_fdr_3d.png
  - effect_tau_sparsity_d1_on_far_3d.png

### Part 5: 实验设计与结果

#### Slide 13 - 章节封面

- **Layout**: 模板章节封面
- **Title**: 数值模拟实验与结果展示
- **Subtitle**: Numerical Simulation and Results
- **Part**: PART.04

#### Slide 14 - 数据生成设计

- **Layout**: 四图网格 (2x2)
- **Title**: 模拟数据构造：稀疏特性 + 低秩共性 + 噪声
- **Images**:
  - train_specific_heatmap.png
  - train_shared_heatmap.png
  - train_y_heatmap.png
  - test_heatmap.png

#### Slide 15 - 基线监测结果

- **Layout**: 四图网格 (2x2)
- **Title**: PCA 与 RPCA 监测曲线：漏检与误报并存
- **Images**:
  - exp1_pca_t2.png
  - exp1_pca_spe.png
  - exp1_rpca_t2.png
  - exp1_rpca_spe.png

#### Slide 16 - JSSDL 监测结果

- **Layout**: 左右对比
- **Title**: JSSDL vs DL：双字典结构显著提升故障检出
- **Images**:
  - exp1_dl_monitoring.png（左）
  - exp1_jssdl_monitoring.png（右）

### Part 6: 复现问题与总结

#### Slide 17 - 复现问题与改进

- **Layout**: 上下分栏
- **Title**: OMP 系数不稳定问题与 ridge_X1 改进
- **Content**:
  - 问题：OMP 求解导致少数 X1 系数过大
  - 尝试：Lasso 版本 FDR=100% 但 D2 秩=18
  - 方案：ridge_X1=0.05，FDR 79.6%→89.2%
- **Images**: exp1_X1_train_vs_detection_boxplot_scale_diagnostic.png

#### Slide 18 - 总结与致谢

- **Layout**: 模板结尾 (slide_19.svg 风格)
- **Title**: 感谢观看
- **Content**:
  - JSSDL 双字典结构优于 PCA/RPCA/DL
  - ridge_X1 正则提升复现稳定性
  - 后续：更稳定编码、TEP 故障集测试
- **Info**: 答辩人 / 导师

---

## X. Speaker Notes Requirements

- 总时长：约 15-20 分钟
- 风格：正式学术答辩
- 目的：汇报 + 说明

---

## XI. Technical Constraints Reminder

1. viewBox: `0 0 1280 720`
2. 背景使用 `<rect>` 元素
3. 文字换行使用 `<tspan>`（禁止 `<foreignObject>`）
4. 透明度使用 `fill-opacity` / `stroke-opacity`（禁止 `rgba()`）
5. 禁止：`mask`, `<style>`, `class`, `foreignObject`, `textPath`, `animate*`, `script`
