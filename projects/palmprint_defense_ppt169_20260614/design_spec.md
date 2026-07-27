# palmprint_defense - Design Spec

> Human-readable design narrative — rationale, audience, style, color choices, content outline. Read once by downstream roles for context.
>
> Machine-readable execution contract: `spec_lock.md` (color / typography / icon / image short form). Executor re-reads `spec_lock.md` before every SVG page to resist context-compression drift. Keep both in sync; on divergence, `spec_lock.md` wins.

## I. Project Information

| Item | Value |
| ---- | ----- |
| **Project Name** | palmprint_defense |
| **Canvas Format** | PPT 16:9 (1280×720) |
| **Page Count** | 36 |
| **Design Style** | B) General Consulting + 科技深蓝风（延续原 PPT 风格） |
| **Target Audience** | 答辩评委老师 + 同学；课程设计答辩场景 |
| **Use Case** | 课程设计答辩演示 |
| **Created Date** | 2026-06-14 |

---

## II. Canvas Specification

| Property | Value |
| -------- | ----- |
| **Format** | PPT 16:9 |
| **Dimensions** | 1280×720 |
| **viewBox** | `0 0 1280 720` |
| **Margins** | left/right 40px, top 50px, bottom 40px |
| **Content Area** | 1200×630 (x=40, y=50) |

---

## III. Visual Theme

### Theme Style

- **Style**: 科技深蓝 + 学术答辩
- **Theme**: Light theme（白色底色 + 深蓝装饰元素）
- **Tone**: 专业、严谨、科技感

### Color Scheme

> 严格复用原 PPT 提取的调色板，禁止全屏填充背景。

| Role | HEX | Purpose |
| ---- | --- | ------- |
| **Background** | `#FFFFFF` | 页面白色底色 |
| **Primary** | `#2F4275` | 标题装饰、左上/右下矩形、章节编号 |
| **Accent** | `#14378B` | 深蓝强调色、图标高亮、关键数据 |
| **Light accent** | `#AEBCDF` | 浅蓝装饰线条、卡片边框、分隔线 |
| **Body text** | `#232A38` | 主要正文文字 |
| **Secondary text** | `#505866` | 辅助说明文字、注释 |
| **White** | `#FFFFFF` | 卡片内文字、深色背景上的文字 |
| **Warning red** | `#BE3C3C` | 错误/失败/警告标记 |
| **Success green** | `#70AD47` | 成功/通过标记（取自主题色 accent6） |
| **Border/divider** | `#D0D7E0` | 卡片边框、分隔线 |

### Decorative Pattern (原 PPT 风格核心)

- **左上角深蓝矩形**: 位置 (0, 0)，尺寸约 350×92px，颜色 `#2F4275`，出现在 73% 的页面
- **右下角深蓝矩形**: 位置 (990, 568)，尺寸约 290×152px，颜色 `#14378B`，出现在 73% 的页面
- **标题区**: 中上部 (455, 8) 起，中文字号 34px Bold + 英文副标题
- **🚫 禁止**: 全屏填充背景（`<rect>` 覆盖整个 1280×720 作为背景色块）

### Gradient Scheme (仅用于局部装饰)

```xml
<!-- 标题区域渐变装饰条 -->
<linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%" stop-color="#2F4275"/>
  <stop offset="100%" stop-color="#14378B"/>
</linearGradient>
```

---

## IV. Typography System

### Font Plan

**Typography direction**: CJK 主导 + 学术风格（微软雅黑 + 汉仪旗黑）

| Role | Chinese | English | Fallback tail |
| ---- | ------- | ------- | ------------- |
| **Title** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |
| **Body** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |
| **Emphasis** | `"Microsoft YaHei"` | `Arial` | `sans-serif` |
| **Code** | — | `Consolas, "Courier New"` | `monospace` |

**Per-role font stacks** (CSS `font-family` strings):

- Title: `"Microsoft YaHei", "PingFang SC", Arial, sans-serif`
- Body: `"Microsoft YaHei", "PingFang SC", Arial, sans-serif`
- Emphasis: `"Microsoft YaHei", Arial, sans-serif`
- Code: `Consolas, "Courier New", monospace`

### Font Size Hierarchy

**Baseline**: Body font size = 18px（中等密度，适合答辩内容）

| Purpose | Ratio to body | px Value | Weight |
| ------- | ------------- | -------- | ------ |
| Cover title | 2.5x | 45px | Bold |
| Chapter title | 2.0x | 36px | Bold |
| Slide title | 1.9x | 34px | Bold |
| Subtitle | 1.55x | 28px | Regular |
| Section title | 1.33x | 24px | Bold |
| Heading | 1.11x | 20px | Bold |
| **Body content** | **1x** | **18px** | Regular |
| Body (compact) | 0.89x | 16px | Bold |
| Annotation | 0.78x | 14px | Regular |
| Page number | 0.67x | 12px | Regular |

---

## V. Layout Principles

### Page Structure

- **Header area**: 高度 92px (y=0→92)，深蓝矩形装饰 + 页面标题
- **Content area**: 高度 528px (y=92→620)，主要内容区域
- **Footer area**: 高度 100px (y=620→720)，右下深蓝装饰矩形 + 页码

### Layout Pattern Library

> 禁止全屏填充背景。所有页面使用白色底色 + 局部装饰元素。

| Pattern | Suitable Scenarios | 本项目使用页面 |
| ------- | ----------------- | ------------- |
| **Single column centered** | 封面、章节页、结束页 | P01, P03, P11, P25, P32, P36 |
| **Three-column cards** | 特性展示、并列要点 | P06, P07, P27 |
| **Four-quadrant** | 分类对比、四象限分析 | P07 |
| **Asymmetric split (3:7)** | 图文混排 | P04, P05, P14, P15 |
| **Top-bottom split** | 流程图 + 说明 | P08, P09, P13, P18, P26, P30 |
| **Z-pattern** | 问题解决方案 | P33, P34 |
| **Full-bleed + floating text** | 章节过渡页（深蓝底色，非全屏填充） | P03, P11, P25, P32 |

### Spacing Specification

**Universal**:

| Element | Value |
| ------- | ----- |
| Safe margin from canvas edge | 40px |
| Content block gap | 24px |
| Icon-text gap | 10px |
| Card gap | 20px |
| Card padding | 24px |
| Card border radius | 8px |

---

## VI. Icon Usage Specification

### Source

- **Built-in icon library**: `chunk-filled`（几何填充风格，与深蓝科技感匹配）
- **Usage method**: SVG placeholder `<use data-icon="chunk-filled/icon-name" .../>`

### Recommended Icon List

| Purpose | Icon Path | Page |
| ------- | --------- | ---- |
| 摄像头/采集 | `chunk-filled/camera` | P04, P14, P29 |
| 锁/门禁 | `chunk-filled/lock-closed` | P01, P08, P30 |
| 解锁 | `chunk-filled/lock-open` | P30 |
| 安全/防护 | `chunk-filled/shield-check` | P06, P07 |
| 用户 | `chunk-filled/user` | P06, P29 |
| 多用户 | `chunk-filled/users` | P06 |
| 芯片/硬件 | `chunk-filled/microchip` | P27 |
| 数据库 | `chunk-filled/database` | P10, P18 |
| 服务器 | `chunk-filled/server` | P08, P12 |
| 代码 | `chunk-filled/code` | P12 |
| 锁眼 | `chunk-filled/keyhole` | P07 |
| 眼睛/视觉 | `chunk-filled/eye` | P07, P14 |
| 链接/连接 | `chunk-filled/link` | P28 |
| 插头/接口 | `chunk-filled/plug` | P28 |
| 信号 | `chunk-filled/signal-good` | P28 |
| 图表 | `chunk-filled/chart-bar` | P21, P31 |
| 图层 | `chunk-filled/layers` | P08 |
| 检查 | `chunk-filled/circle-checkmark` | P20, P35 |
| 手势 | `chunk-filled/hand` | P06, P14 |
| 钥匙 | `chunk-filled/key` | P01 |
| 蓝牙 | `chunk-filled/bluetooth` | P28 |
| WiFi | `chunk-filled/wifi` | P28 |
| 显示器 | `chunk-filled/screencast` | P29 |
| 时钟 | `chunk-filled/clock` | P22 |

---

## VII. Visualization Reference List

**Read-audit**:

```
Catalog read: 70 templates / 10 categories

Per-page selection (one row per viz page):
  P04 comparison_table    | summary-quote: "Pick for 2-4 plans/products compared across many feature rows (dense matrix)."
  P05 comparison_columns  | summary-quote: "Pick for 2-4 pricing/service tier cards in side-by-side columns (marketing layout)."
  P08 layered_architecture| summary-quote: "Pick for 3-4 horizontal architecture layers (e.g. presentation/service/data), 2-4 module cards per layer."
  P09 process_flow        | summary-quote: "Pick for 3-8 sequential steps connected by simple arrows."
  P13 pipeline_with_stages| summary-quote: "Pick for 3-5 stage horizontal pipeline where each stage = title + 1-line description + output artifact, connected by directional arrows."
  P18 process_flow        | summary-quote: "Pick for 3-8 sequential steps connected by simple arrows."
  P26 layered_architecture| summary-quote: "Pick for 3-4 horizontal architecture layers (e.g. presentation/service/data), 2-4 module cards per layer."
  P28 client_server_flow  | summary-quote: "Pick for left-side client modules + right-side server modules with labeled bidirectional arrows showing key interactions."

Runners-up considered:
  icon_grid | rejected for P04: needs comparison table with feature rows, not parallel cards
  numbered_steps | rejected for P09: needs arrow connections between steps, not just numbered items
  hub_spoke | rejected for P26: hardware is layered architecture, not radial capability
  comparison_table | rejected for P05: algorithm comparison is more visual tier-style, not dense feature matrix
```

| Visualization Type | Reference Template | Used In |
| ------------------ | ------------------ | ------- |
| comparison_table | `templates/charts/comparison_table.svg` | P04 |
| comparison_columns | `templates/charts/comparison_columns.svg` | P05 |
| layered_architecture | `templates/charts/layered_architecture.svg` | P08, P26 |
| process_flow | `templates/charts/process_flow.svg` | P09, P18 |
| pipeline_with_stages | `templates/charts/pipeline_with_stages.svg` | P13 |
| client_server_flow | `templates/charts/client_server_flow.svg` | P28 |

---

## VIII. Image Resource List

| Filename | Dimensions | Ratio | Purpose | Type | Status | Acquire Via | Reference |
| -------- | --------- | ----- | ------- | ---- | ------ | ----------- | --------- |
| slide_04_image_01.png | — | — | 掌纹识别技术示意 | Illustration | Existing | user | 已有 |
| slide_04_image_02.png | — | — | 采集方式示意 | Illustration | Existing | user | 已有 |
| slide_04_image_03.png | — | — | 系统目标示意 | Illustration | Existing | user | 已有 |
| slide_04_image_04.png | — | — | 采集方式补充 | Illustration | Existing | user | 已有 |
| slide_05_image_05.png | — | — | 门禁应用场景 | Photography | Existing | user | 已有 |
| slide_05_image_06.jpg | — | — | 考勤应用场景 | Photography | Existing | user | 已有 |
| slide_05_image_07.jpg | — | — | 安防应用场景 | Photography | Existing | user | 已有 |
| slide_05_image_08.jpg | — | — | 金融应用场景 | Photography | Existing | user | 已有 |
| slide_05_image_09.png | — | — | 应用层价值补充 | Illustration | Existing | user | 已有 |
| slide_06_image_10.png | — | — | 技术优势配图 | Illustration | Existing | user | 已有 |
| slide_06_image_11.png | — | — | 普通摄像头 | Illustration | Existing | user | 已有 |
| slide_06_image_12.png | — | — | 非接触体验 | Illustration | Existing | user | 已有 |
| slide_06_image_13.png | — | — | 隐私保护 | Illustration | Existing | user | 已有 |
| slide_06_image_14.png | — | — | 纹理特征 | Illustration | Existing | user | 已有 |
| slide_07_image_15.png | — | — | 算法分类图 | Diagram | Existing | user | 已有 |
| slide_07_image_16.png | — | — | CompCode选择理由 | Illustration | Existing | user | 已有 |
| slide_08_image_17.png | — | — | 架构总览 | Diagram | Existing | user | 已有 |
| slide_08_image_18.png | — | — | 前端架构 | Diagram | Existing | user | 已有 |
| slide_08_image_19.png | — | — | 后端架构 | Diagram | Existing | user | 已有 |
| slide_08_image_20.jpg | — | — | 算法层 | Diagram | Existing | user | 已有 |
| slide_08_image_21.png | — | — | 硬件层 | Diagram | Existing | user | 已有 |
| slide_09_image_22.png | — | — | 系统设计图1 | Diagram | Existing | user | 已有 |
| slide_09_image_23.png | — | — | 系统设计图2 | Diagram | Existing | user | 已有 |
| slide_11_image_24.png | — | — | 软件架构图 | Diagram | Existing | user | 已有 |
| slide_11_image_25.png | — | — | 前端组件 | Diagram | Existing | user | 已有 |
| slide_11_image_26.png | — | — | 后端API | Diagram | Existing | user | 已有 |
| slide_12_image_27.png | — | — | 算法流程总览 | Diagram | Existing | user | 已有 |
| slide_12_image_28.png | — | — | 预处理链路 | Diagram | Existing | user | 已有 |
| slide_12_image_29.png | — | — | 匹配链路 | Diagram | Existing | user | 已有 |
| slide_12_image_30.png | — | — | 输出结果 | Diagram | Existing | user | 已有 |
| slide_13_image_31.png | — | — | CompCode原理 | Diagram | Existing | user | 已有 |
| slide_13_image_32.png | — | — | Gabor滤波 | Diagram | Existing | user | 已有 |
| slide_13_image_33.png | — | — | Shift Matching | Diagram | Existing | user | 已有 |
| slide_13_image_34.png | — | — | 掩码归一化 | Diagram | Existing | user | 已有 |
| slide_13_image_35.png | — | — | 阈值判决 | Diagram | Existing | user | 已有 |
| slide_14_image_36.png | — | — | MediaPipe检测 | Diagram | Existing | user | 已有 |
| slide_14_image_37.png | — | — | 关键点示意 | Diagram | Existing | user | 已有 |
| slide_14_image_38.png | — | — | 手掌区域 | Diagram | Existing | user | 已有 |
| slide_15_image_39.png | — | — | ROI提取 | Diagram | Existing | user | 已有 |
| slide_15_image_40.png | — | — | Zhang坐标系 | Diagram | Existing | user | 已有 |
| slide_15_image_41.png | — | — | ROI裁剪结果 | Diagram | Existing | user | 已有 |
| slide_16_image_42.png | — | — | CompCode编码 | Diagram | Existing | user | 已有 |
| slide_16_image_43.png | — | — | 编码结果 | Diagram | Existing | user | 已有 |
| slide_16_image_44.png | — | — | 编码对比 | Diagram | Existing | user | 已有 |
| slide_17_image_45.png | — | — | 模板存储 | Diagram | Existing | user | 已有 |
| slide_17_image_46.png | — | — | 匹配逻辑 | Diagram | Existing | user | 已有 |
| slide_17_image_47.png | — | — | 匹配结果 | Diagram | Existing | user | 已有 |
| slide_18_image_48.png | — | — | 数据集标定 | Diagram | Existing | user | 已有 |
| slide_18_image_49.png | — | — | 距离分布 | Diagram | Existing | user | 已有 |
| slide_18_image_50.png | — | — | ROC曲线 | Diagram | Existing | user | 已有 |
| slide_20_image_51.png | — | — | 硬件架构图 | Diagram | Existing | user | 已有 |
| slide_20_image_52.png | — | — | 硬件组件 | Photography | Existing | user | 已有 |
| slide_20_image_53.png | — | — | 硬件连接 | Photography | Existing | user | 已有 |
| slide_21_image_54.png | — | — | 继电器模块 | Photography | Existing | user | 已有 |
| slide_21_image_55.png | — | — | STM32主板 | Photography | Existing | user | 已有 |
| slide_21_image_56.png | — | — | 电磁锁 | Photography | Existing | user | 已有 |
| slide_21_image_57.png | — | — | LED指示灯 | Photography | Existing | user | 已有 |
| slide_21_image_58.png | — | — | 蜂鸣器 | Photography | Existing | user | 已有 |
| slide_22_image_59.png | — | — | 软件演示 | Screenshot | Existing | user | 已有 |
| slide_22_image_60.png | — | — | 注册页 | Screenshot | Existing | user | 已有 |
| slide_22_image_61.png | — | — | 验证页 | Screenshot | Existing | user | 已有 |
| slide_22_image_62.png | — | — | 日志页 | Screenshot | Existing | user | 已有 |
| slide_24_image_63.png | — | — | 问题解决方案 | Diagram | Existing | user | 已有 |
| slide_24_image_64.png | — | — | ROI不稳定 | Diagram | Existing | user | 已有 |
| slide_24_image_65.png | — | — | MediaPipe改进 | Diagram | Existing | user | 已有 |
| slide_24_image_66.png | — | — | 软硬件联调 | Diagram | Existing | user | 已有 |
| slide_24_image_67.png | — | — | 阈值调参 | Diagram | Existing | user | 已有 |
| slide_25_image_68.png | — | — | 总结配图 | Illustration | Existing | user | 已有 |
| slide_25_image_69.png | — | — | 已完成 | Illustration | Existing | user | 已有 |
| slide_25_image_70.png | — | — | 系统特点 | Illustration | Existing | user | 已有 |
| slide_25_image_71.png | — | — | 后续优化 | Illustration | Existing | user | 已有 |
| slide_26_image_72.png | — | — | 结束页装饰 | Illustration | Existing | user | 已有 |
| slide_26_image_73.png | — | — | 结束页装饰2 | Illustration | Existing | user | 已有 |

---

## IX. Content Outline

### Part 1: 项目背景与系统架构 (P01–P10)

#### P01 - 封面

- **Layout**: 单列居中 + 深蓝装饰
- **Title**: 掌纹识别门禁系统
- **Subtitle**: COURSE DESIGN DEFENSE
- **Info**: 从掌纹采集、特征编码、身份匹配到 STM32 控制开锁的完整系统实现
- **Members**: 小组成员：翁嘉程、罗志铭、李佳洋
- **Rhythm**: anchor

#### P02 - 目录

- **Layout**: 四列导航卡片
- **Title**: 目录 CONTENTS
- **Content**:
  - 01 项目背景与系统架构
  - 02 技术路线与算法原理
  - 03 硬件连接与结果演示
  - 04 不足与总结
- **Rhythm**: anchor

#### P03 - 章节页：项目背景

- **Layout**: 全屏深蓝底色（非白色填充）+ 居中文字
- **Title**: 01 项目背景与系统架构
- **Subtitle**: Background and Architecture
- **Desc**: 掌纹识别适用于非接触式身份认证，本系统目标是打通从掌纹采集到门锁控制的完整闭环
- **Rhythm**: anchor

#### P04 - 掌纹识别概念

- **Layout**: 左侧文字 + 右侧图片
- **Title**: 掌纹识别技术概述
- **Subtitle**: What is Palmprint Recognition
- **Visualization**: comparison_table（生物特征对比表）
- **Content**:
  - 定义：通过手掌主线、皱褶和细节纹理等特征进行身份认证的生物特征识别技术
  - 掌纹特征层次：主线（principal lines）、褶皱（wrinkles）、细小纹理（creases）
  - 生物特征对比：掌纹 vs 指纹 vs 人脸 vs 虹膜（采集方式、精度、成本、隐私）
  - 本系统使用普通 RGB 摄像头完成非接触采集
- **Images**: slide_04_image_01.png, slide_04_image_02.png
- **Rhythm**: dense

#### P05 - 主流算法分类

- **Layout**: 四列卡片（四类算法）
- **Title**: 掌纹识别主流方法
- **Subtitle**: Mainstream Algorithms
- **Visualization**: comparison_columns（四类算法对比）
- **Content**:
  - 线特征方法：提取主线、褶皱线，解释性强，对 ROI 对齐敏感
  - 子空间/统计方法：PCA、LDA、ICA 投影到低维空间，适合小规模数据
  - 编码类方法：PalmCode、CompCode、Ordinal Code，方向滤波 + 二值编码，实时性好
  - 深度学习方法：CNN、Siamese Network、Transformer，依赖大规模数据和算力
  - ✅ 本系统选择 CompCode：链路清晰、计算量低、适合课程设计原型
- **Images**: slide_07_image_15.png, slide_07_image_16.png
- **Rhythm**: dense

#### P06 - 应用场景

- **Layout**: 四列卡片 + 图片
- **Title**: 掌纹识别典型应用场景
- **Subtitle**: Application Scenarios
- **Content**:
  - 门禁通行：宿舍、实验室、办公区域的非接触身份核验
  - 考勤签到：课堂、会议、工位打卡等高频认证场景
  - 安防核验：金融柜台、自助终端、重点区域二次确认
  - 应用价值：减少接触、降低忘带卡/借卡风险，与日志系统联动形成可追溯记录
- **Images**: slide_05_image_05.png, slide_05_image_06.jpg, slide_05_image_07.jpg, slide_05_image_08.jpg
- **Rhythm**: dense

#### P07 - 为什么选择掌纹识别

- **Layout**: 2×2 四象限卡片
- **Title**: 为什么选择掌纹识别
- **Subtitle**: Why Palmprint Recognition
- **Content**:
  - 普通摄像头即可：无需指纹模组或虹膜采集设备，降低硬件成本和部署难度
  - 非接触体验好：手掌放置在摄像头前即可，卫生自然，适合高频通行
  - 隐私争议较小：不像人脸容易被远距离采集，用户感知更可控
  - 纹理特征丰富：掌纹面积大，主线/褶皱/细小纹理多层次特征，区分能力强
- **Images**: slide_06_image_10.png, slide_06_image_11.png, slide_06_image_12.png, slide_06_image_13.png, slide_06_image_14.png
- **Rhythm**: dense

#### P08 - 系统架构总览

- **Layout**: 分层架构图（三层）
- **Title**: 系统架构设计
- **Subtitle**: System Architecture Design
- **Visualization**: layered_architecture
- **Content**:
  - 前端交互层：Vue 3 + Naive UI，提供注册、验证和日志页面
  - 算法处理层：Flask API 编排 + ROI/Gabor/CompCode/匹配 + SQLite 存储
  - 硬件执行层：STM32 接收串口命令，控制继电器、电磁锁、LED 与蜂鸣器
- **Images**: slide_08_image_17.png, slide_08_image_18.png, slide_08_image_19.png, slide_08_image_20.jpg, slide_08_image_21.png
- **Rhythm**: dense

#### P09 - 系统数据流图

- **Layout**: 流程图（从左到右）
- **Title**: 系统数据流
- **Subtitle**: System Data Flow
- **Visualization**: process_flow
- **Content**:
  - 摄像头采集 → 手掌检测 (MediaPipe) → ROI 提取 (Zhang) → 预处理 (CLAHE)
  - → CompCode 编码 → 模板匹配 → 阈值判决 → 串口命令 → STM32 开锁
  - 全链路：采集、预处理、编码、匹配、日志记录、开锁反馈
- **Images**: slide_09_image_22.png, slide_09_image_23.png
- **Rhythm**: dense

#### P10 - 数据库设计

- **Layout**: 左侧 ER 图 + 右侧表结构说明
- **Title**: 数据库设计
- **Subtitle**: Database Design (SQLite)
- **Content**:
  - users 表：user_id, name, created_at
  - templates 表：template_id, user_id, compcode_template, mask_template, roi_snapshot
  - recognition_logs 表：log_id, user_id, distance, threshold, result, timestamp
  - 关系：users 1:N templates, users 1:N recognition_logs
- **Rhythm**: dense

### Part 2: 技术路线与算法原理 (P11–P24)

#### P11 - 章节页：技术路线

- **Layout**: 全屏深蓝底色 + 居中文字
- **Title**: 02 技术路线与算法原理
- **Subtitle**: Principles and Implementation
- **Desc**: 采用前后端分离与硬件抽象层设计，算法核心基于 Gabor + CompCode 完成编码和匹配
- **Rhythm**: anchor

#### P12 - 软件架构详解

- **Layout**: 左侧架构图 + 右侧说明
- **Title**: 软件架构
- **Subtitle**: Software Architecture
- **Visualization**: client_server_flow
- **Content**:
  - 前端：Vue 3 组件树（Register/Verify/Log 页面）、Vue Router 路由、Naive UI 组件库
  - 后端：Flask API 端点（/api/register, /api/verify, /api/logs）、蓝图模块化
  - 数据库：SQLAlchemy ORM + SQLite，模型定义
  - 前后端分离：RESTful API + JSON 数据交换
- **Images**: slide_11_image_24.png, slide_11_image_25.png, slide_11_image_26.png
- **Rhythm**: dense

#### P13 - 算法流程总览

- **Layout**: 双链路流程图（预处理 + 匹配）
- **Title**: 掌纹识别算法流程
- **Subtitle**: Algorithm Flow
- **Visualization**: pipeline_with_stages
- **Content**:
  - 预处理链路：原图 → 灰度化 → CLAHE 直方图均衡 → ROI 裁剪 128×128
  - 匹配链路：6 方向 Gabor 滤波 → CompCode 编码 → 掩码归一化汉明距离 → 阈值判决
  - 输出：用户身份、匹配距离、阈值判断结果，触发开锁或失败反馈
- **Images**: slide_12_image_27.png, slide_12_image_28.png, slide_12_image_29.png, slide_12_image_30.png
- **Rhythm**: dense

#### P14 - 手掌检测：MediaPipe

- **Layout**: 左侧说明 + 右侧图示
- **Title**: 手掌检测：MediaPipe
- **Subtitle**: Palm Detection with MediaPipe
- **Content**:
  - MediaPipe Hands 模型：21 个手部关键点实时检测
  - 关键点编号：0(手腕) → 4(拇指尖) → 8(食指尖) → ... → 20(小指尖)
  - 手掌区域定位：基于关键点 0, 5, 9, 13, 17 的凸包
  - 优势：抗光照变化、抗肤色差异、鲁棒性远超 HSV 分割
- **Images**: slide_14_image_36.png, slide_14_image_37.png, slide_14_image_38.png
- **Rhythm**: dense

#### P15 - ROI 提取与 Zhang 坐标系

- **Layout**: 左侧坐标系图 + 右侧 ROI 结果
- **Title**: ROI 提取与 Zhang 坐标系
- **Subtitle**: ROI Extraction and Zhang Coordinate System
- **Content**:
  - Zhang 坐标系定义：以关键点 0(手腕) 和 9(中指根部) 为基准建立坐标系
  - ROI 区域：坐标系中固定偏移区域，裁剪为 128×128 标准化尺寸
  - 裁剪目的：消除手掌位置/角度差异，确保编码一致性
  - 输出：128×128 灰度 ROI 图像
- **Images**: slide_15_image_39.png, slide_15_image_40.png, slide_15_image_41.png
- **Rhythm**: dense

#### P16 - 数据预处理

- **Layout**: 左右对比（处理前 vs 处理后）
- **Title**: 数据预处理
- **Subtitle**: Data Preprocessing
- **Content**:
  - 灰度化：RGB 三通道转单通道灰度图
  - CLAHE 直方图均衡化：自适应对比度增强，消除光照不均
  - 噪声滤除：高斯模糊平滑
  - 效果：提升后续 Gabor 滤波和编码的稳定性
- **Images**: slide_12_image_28.png（复用预处理链路图）
- **Rhythm**: dense

#### P17 - CompCode 竞争编码原理

- **Layout**: 中央图示 + 周围说明
- **Title**: CompCode 竞争编码
- **Subtitle**: Competitive Code
- **Content**:
  - 6 方向 Gabor 滤波器组：0°, 30°, 60°, 90°, 120°, 150°
  - 逐像素竞争：对每个像素，选择 Gabor 响应最强的方向
  - 3-bit 编码输出：6 个方向用 3 位二进制表示 (000~101)
  - 优势：计算量小、方向特征明确、适合实时场景
  - 公式：θ(x,y) = argmin_k {G_k * I(x,y)}，k ∈ {0,1,...,5}
- **Images**: slide_16_image_42.png, slide_16_image_43.png, slide_16_image_44.png
- **Rhythm**: dense

#### P18 - 模板存储与匹配逻辑

- **Layout**: 双流程图（注册 vs 验证）
- **Title**: 模板存储与匹配逻辑
- **Subtitle**: Template Storage and Matching Logic
- **Visualization**: process_flow
- **Content**:
  - 注册阶段：采集掌纹 → 预处理 → CompCode 编码 → 存入 SQLite templates 表
  - 验证阶段：采集 → 编码 → 遍历所有模板 → 计算汉明距离 → 取最小距离 → 阈值判决
  - 模板结构：compcode_template (编码) + mask_template (掩码) + roi_snapshot (ROI 快照)
  - 匹配输出：最近用户、匹配距离、是否通过
- **Images**: slide_17_image_45.png, slide_17_image_46.png, slide_17_image_47.png
- **Rhythm**: dense

#### P19 - Shift Matching 与掩码归一化

- **Layout**: 左侧 Shift Matching 图 + 右侧掩码说明
- **Title**: Shift Matching 与掩码归一化
- **Subtitle**: Shift Matching and Mask Normalization
- **Content**:
  - 问题：用户每次放置手掌位置不完全一致，ROI 存在平移
  - Shift Matching：在 ±6 像素范围内平移模板，分别计算距离，取最小值
  - 掩码归一化：标记有效像素区域（排除过暗/过曝/背景），只在有效区域计算汉明距离
  - 公式：d = Σ|xor(T1, T2) ∩ M| / Σ|M|，M 为有效掩码
- **Images**: slide_13_image_33.png, slide_13_image_34.png
- **Rhythm**: dense

#### P20 - 阈值判决与开锁触发

- **Layout**: 决策流程图
- **Title**: 阈值判决与开锁触发
- **Subtitle**: Threshold Decision and Unlock Trigger
- **Content**:
  - 判决逻辑：匹配距离 < 阈值 → 通过；距离 ≥ 阈值 → 拒绝
  - 通过路径：发送 UNLOCK 命令 → STM32 开锁 → 绿灯 + 单响 → 记录日志
  - 拒绝路径：发送 FAIL 命令 → 红灯 + 双响 → 记录日志
  - 阈值选择：基于 EER 分析，在 FAR 和 FRR 之间取平衡
- **Images**: slide_13_image_35.png
- **Rhythm**: dense

#### P21 - 数据集标定结果

- **Layout**: 左侧距离分布图 + 右侧指标
- **Title**: 数据集标定结果
- **Subtitle**: Dataset Calibration Results
- **Content**:
  - 真样本距离分布 vs 伪样本距离分布（直方图）
  - EER (Equal Error Rate)：FAR = FRR 时的错误率
  - FAR (False Accept Rate)：误接受率
  - FRR (False Reject Rate)：误拒绝率
  - ROC 曲线：不同阈值下的 FAR vs 1-FRR
- **Images**: slide_18_image_48.png, slide_18_image_49.png, slide_18_image_50.png
- **Rhythm**: dense

#### P22 - 算法复杂度与实时性

- **Layout**: 左侧对比表 + 右侧性能数据
- **Title**: 算法复杂度与实时性分析
- **Subtitle**: Complexity and Real-time Performance
- **Content**:
  - CompCode 编码耗时：~15ms (128×128 ROI)
  - 单次匹配耗时：~5ms (含 Shift Matching)
  - 总验证链路：~100ms (含摄像头采集 + 预处理)
  - 与深度学习对比：CNN 推理需 GPU，CompCode 仅需 CPU
  - 适合课程设计原型的实时验证场景
- **Rhythm**: dense

#### P23 - 端到端流程图

- **Layout**: 完整流程图（从采集到开锁）
- **Title**: 端到端算法流程
- **Subtitle**: End-to-End Algorithm Flow
- **Visualization**: pipeline_with_stages
- **Content**:
  - 摄像头抓帧 → 选最清晰帧 → MediaPipe 检测 → Zhang ROI 裁剪
  - → 灰度化 + CLAHE → 6 方向 Gabor → CompCode 编码
  - → 遍历模板 → Shift Matching → 掩码归一化距离 → 阈值判决
  - → 通过: UNLOCK / 拒绝: FAIL → 日志记录
- **Rhythm**: dense

#### P24 - 算法总结

- **Layout**: 五列要点卡片
- **Title**: 算法关键技术总结
- **Subtitle**: Key Algorithm Summary
- **Content**:
  - MediaPipe：鲁棒手掌检测，替代 HSV 分割
  - Zhang ROI：标准化裁剪，消除位置偏差
  - CompCode：6 方向竞争编码，计算量小
  - Shift Matching：±6px 平移搜索，提升同人匹配
  - 阈值判决：基于 EER 的平衡决策
- **Rhythm**: dense

### Part 3: 硬件连接与结果演示 (P25–P31)

#### P25 - 章节页：硬件连接

- **Layout**: 全屏深蓝底色 + 居中文字
- **Title**: 03 硬件连接与结果演示
- **Subtitle**: Hardware and Demonstration
- **Desc**: 前端负责交互展示，后端完成识别与控制指令下发，STM32 驱动电磁锁和反馈设备
- **Rhythm**: anchor

#### P26 - 硬件架构

- **Layout**: 分层架构图
- **Title**: 硬件架构
- **Subtitle**: Hardware Architecture
- **Visualization**: layered_architecture
- **Content**:
  - 感知层：USB 摄像头（掌纹图像采集）
  - 处理层：PC（算法运行 + Flask 后端）
  - 通信层：串口 UART（PC ↔ STM32）
  - 执行层：STM32F407 + 继电器 + 电磁锁 + LED + 蜂鸣器
- **Images**: slide_20_image_51.png, slide_20_image_52.png, slide_20_image_53.png
- **Rhythm**: dense

#### P27 - 硬件组件功能详解

- **Layout**: 三列卡片（主控 + 执行器 + 反馈）
- **Title**: 硬件组件功能详解
- **Subtitle**: Hardware Components
- **Content**:
  - STM32F407 主控：接收串口命令，GPIO 驱动继电器/LED/蜂鸣器
  - 继电器模块：控制 12V 电磁锁回路通断，光耦隔离
  - 12V 电磁锁：断电开门型，独立供电更安全
  - LED 指示灯：绿色(成功) / 红色(失败)
  - 蜂鸣器：单响(成功) / 双响(失败)
- **Images**: slide_21_image_54.png, slide_21_image_55.png, slide_21_image_56.png, slide_21_image_57.png, slide_21_image_58.png
- **Rhythm**: dense

#### P28 - 串口通信协议

- **Layout**: 左侧协议表 + 右侧架构图
- **Title**: 串口通信协议
- **Subtitle**: Serial Communication Protocol
- **Visualization**: client_server_flow
- **Content**:
  - ASCII 行协议：
    - `UNLOCK <ms>` — 开锁指定毫秒
    - `OK` — 成功反馈
    - `FAIL` — 失败反馈
    - `PING` — 健康检查
  - 波特率：115200, 8N1
  - 硬件抽象层：MockBridge（模拟）vs SerialBridge（真实串口）
  - 开发阶段用 MockBridge 先跑通流程，最后切换真实硬件
- **Rhythm**: dense

#### P29 - 前后端效果演示

- **Layout**: 三列截图 + 说明
- **Title**: 软件演示
- **Subtitle**: Software Demonstration
- **Content**:
  - 注册页：输入姓名 → 采集掌纹 → 显示质量评分 → 保存用户模板
  - 验证页：摄像头预览 → 点击验证 → 显示用户、距离、阈值和结果
  - 日志页：分页查看识别记录，追踪成功/失败验证过程
- **Images**: slide_22_image_59.png, slide_22_image_60.png, slide_22_image_61.png, slide_22_image_62.png
- **Rhythm**: dense

#### P30 - 完整验证流程演示

- **Layout**: 时序流程图（从左到右）
- **Title**: 完整验证流程
- **Subtitle**: End-to-End Verification Flow
- **Visualization**: process_flow
- **Content**:
  - 点击验证 → 抓取 6 帧 → 选最清晰帧 → MediaPipe 检测
  - → Zhang ROI 裁剪 → 预处理 → CompCode 编码
  - → 匹配最近模板 → 距离 < 阈值 → UNLOCK → 绿灯 + 单响
- **Images**: slide_22_image_59.png（复用）
- **Rhythm**: dense

#### P31 - 效果评估

- **Layout**: 左侧指标卡片 + 右侧图表
- **Title**: 效果评估
- **Subtitle**: Performance Evaluation
- **Content**:
  - 识别成功率：XX%（基于测试数据集）
  - 平均匹配耗时：XXms
  - EER / FAR / FRR 指标
  - 距离分布直方图
  - 评估指标：EER、FAR、FRR、ROC/DET 曲线、真伪距离分布
- **Images**: slide_18_image_49.png, slide_18_image_50.png（复用标定结果图）
- **Rhythm**: dense

### Part 4: 不足与总结 (P32–P36)

#### P32 - 章节页：不足与总结

- **Layout**: 全屏深蓝底色 + 居中文字
- **Title**: 04 不足与总结
- **Subtitle**: Limitations and Summary
- **Desc**: 系统已完成从算法验证到软硬件联调的闭环，后续可从准确率、安全性和嵌入式部署继续优化
- **Rhythm**: anchor

#### P33 - 算法不足

- **Layout**: 四行问题卡片（Z-pattern）
- **Title**: 算法不足
- **Subtitle**: Algorithm Limitations
- **Content**:
  - CompCode 方向编码粒度有限：仅 6 个方向，对相似纹理区分力不足
  - ROI 对光照敏感：CLAHE 无法完全消除极端光照影响
  - 阈值需手动调参：不同场景需重新标定，缺乏自适应机制
  - 缺乏活体检测：无法抵御照片/视频攻击
- **Images**: slide_24_image_63.png, slide_24_image_64.png
- **Rhythm**: dense

#### P34 - 系统不足

- **Layout**: 四行问题卡片（Z-pattern）
- **Title**: 系统不足
- **Subtitle**: System Limitations
- **Content**:
  - 硬件连接不稳定：串口可能断连，缺乏重连机制
  - 单用户串行识别：不支持多人并发，排队场景效率低
  - 电磁锁供电安全：12V 独立供电，断电后锁状态需明确
  - 摄像头分辨率限制：低分辨率影响 ROI 细节保留
- **Images**: slide_24_image_66.png, slide_24_image_67.png
- **Rhythm**: dense

#### P35 - 总结与展望

- **Layout**: 三列卡片（已完成 / 系统特点 / 后续优化）
- **Title**: 总结与展望
- **Subtitle**: Summary and Outlook
- **Content**:
  - 已完成：采集→预处理→编码→匹配→开锁闭环；Web 端支持注册、验证和日志
  - 系统特点：算法层零硬件依赖；硬件抽象层支持 Mock 与真实串口快速切换
  - 后续优化：引入 CNN 特征、活体检测、多人并发识别、嵌入式独立部署
  - 最终成果：从算法验证走向可演示的门禁系统原型
- **Images**: slide_25_image_68.png, slide_25_image_69.png, slide_25_image_70.png, slide_25_image_71.png
- **Rhythm**: dense

#### P36 - 结束页

- **Layout**: 单列居中
- **Title**: 谢谢观看
- **Subtitle**: THANK YOU
- **Desc**: 掌纹识别门禁系统答辩结束，欢迎老师批评指正
- **Images**: slide_26_image_72.png, slide_26_image_73.png
- **Rhythm**: anchor

---

## X. Speaker Notes Requirements

- **Filename**: 匹配 SVG 名称（如 `P01_cover.md` → `notes/P01.md`）
- **Content**: 答辩演讲要点、时间控制、过渡语
- **Style**: 正式答辩风格，结论先行
- **Duration**: 总时长约 15-20 分钟

---

## XI. Technical Constraints Reminder

### SVG Generation Must Follow:

1. viewBox: `0 0 1280 720`
2. Background uses `<rect>` elements（白色底色，非全屏深蓝填充）
3. Text wrapping uses `<tspan>` (`<foreignObject>` FORBIDDEN)
4. Transparency uses `fill-opacity` / `stroke-opacity`; `rgba()` FORBIDDEN
5. FORBIDDEN: `mask`, `<style>`, `class`, `foreignObject`
6. FORBIDDEN: `textPath`, `animate*`, `script`
7. Text characters: write typography & symbols as raw Unicode
8. 🚫 **禁止全屏填充背景**：不得使用 `<rect>` 覆盖整个 1280×720 作为背景色块

### PPT Compatibility Rules:

- `<g opacity="...">` FORBIDDEN (group opacity); set on each child element individually
- Image transparency uses overlay mask layer
- Inline styles only; external CSS and `@font-face` FORBIDDEN
