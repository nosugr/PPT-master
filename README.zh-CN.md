# PPT Master

[English](README.md)

PPT Master 是一个由 AI 驱动的演示文稿生成项目，提供 Web 界面、可复用模板和多角色生成流水线，可以将文档或主题 brief 转换为可编辑的 DrawingML PPTX 文件。

## 主要功能

- 提供项目、模板、设置和生成流程的 Web 界面
- 基于 FastAPI 的项目、模板、格式和流水线 API
- 基于 Next.js 的前端，支持英文、简体中文和繁体中文界面
- 提供可复用的版式模板、SVG 素材和演示案例
- 面向可编辑 PowerPoint 文件的生成与导出流程

## 项目结构

```text
frontend/   Next.js Web 前端
backend/    FastAPI API 和 PPTX 生成流水线
skills/     PPT 生成技能、脚本和模板
examples/   演示文稿案例输入和素材
projects/   项目工作区和源材料
```

## 环境要求

- Node.js 和 npm
- Python 和 pip
- 已为后端流程配置好的大语言模型服务/API

## 快速开始

```bash
git clone https://github.com/nosugr/PPT-master.git
cd PPT-master

# 安装根目录 JavaScript 工具、前端依赖和后端依赖
npm install
npm run install:all

# 复制环境变量模板，并根据实际环境填写配置
cp .env.example .env

# 同时启动前端和后端
npm run dev
```

启动后，Web 应用地址为 `http://localhost:3000`，API 地址为 `http://localhost:8000`。

Windows PowerShell 可使用以下命令复制环境变量模板：

```powershell
Copy-Item .env.example .env
```

## 常用命令

```bash
npm run dev              # 同时启动前端和后端
npm run dev:frontend    # 仅启动 Next.js 前端
npm run dev:backend     # 仅启动 FastAPI 后端

cd frontend
npm run typecheck       # TypeScript 类型检查
npm run build           # 生产构建
```

## 注意事项

- 不要提交本地依赖、虚拟环境、缓存或生成的构建产物。
- API 密钥和模型服务凭据应放在本地环境配置中，不要写入源码。
- `examples/` 和 `projects/` 目录包含参考材料及生成流程输入，并非每次部署都必需。

## 开源协议

本项目采用 MIT License，详见 [LICENSE](LICENSE)。
