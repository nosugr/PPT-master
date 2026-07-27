# PPT Master 使用流程指南

## 什么是 PPT Master

PPT Master 是一个 AI 驱动的演示文稿生成系统。它将源文档（PDF、DOCX、网址、Markdown）转换为原生可编辑的 PPTX 文件——每个形状、文本框、图表都是真正的 DrawingML 元素，可以在 PowerPoint 中直接点击修改。

## 核心特点

- 真正的 PPT：每个元素都能在 PowerPoint 中编辑，不是图片拼接
- 数据不出本地：除与 AI 模型对话外，全流程在本地完成
- 不锁定平台：支持 Claude Code、Cursor、VS Code Copilot 等多种 AI IDE
- 成本透明：工具免费开源，唯一成本是 AI 模型用量

## 使用前准备

### 安装 Python

从 python.org 下载 Python 3.10+，安装时勾选 "Add to PATH"。

### 安装依赖

```bash
pip install -r requirements.txt
```

### 选择 AI IDE

PPT Master 需要一个具备 Agent 能力的 AI IDE 来驱动。推荐选择：
- Claude Code（CLI 或 IDE 扩展）
- Cursor
- VS Code + Copilot / Cline

## 核心使用流程

### 第一步：提供源材料

将 PDF、DOCX、图片等文件放入 projects/ 目录下，在 AI 对话框中告诉它使用哪些文件。也可以直接粘贴文字内容，或者只给一个话题让 AI 搜索资料。

### 第二步：AI 自动处理

AI 会按照以下流水线自动执行：

1. 源文件转 Markdown
2. 初始化项目目录
3. 策略师提出八项设计确认（页数、风格、配色等）
4. 用户确认设计方案
5. 获取图片资源（AI 生图或网络搜索）
6. 执行器逐页生成 SVG
7. 后处理和导出 PPTX

### 第三步：获取成品

最终 PPTX 文件保存在 exports/ 目录下，可以直接在 PowerPoint 中打开编辑。

## 可选功能

### 模板复刻

把喜欢的 .pptx 文件交给 AI，用 /create-template 复刻成可复用的模板。

### 动画支持

导出的 PPT 支持页间转场和页内元素入场动画，原生 OOXML 格式。

### 旁白与视频

可以用 TTS 生成语音旁白，嵌入 PPTX 后导出为 MP4 视频。

## 支持的输入格式

- PDF 文件
- DOCX / Word 文档
- XLSX / Excel 表格
- PPTX / PowerPoint 演示文稿
- 网页链接（包括微信公众号）
- Markdown 文件
- 纯文字描述

## 支持的输出格式

- PPT 16:9（标准宽屏）
- PPT 4:3（标准比例）
- 小红书卡片
- 朋友圈长图
- 等 10+ 种画布格式
