# PPT Master

[简体中文](README.zh-CN.md)

PPT Master is an AI-powered presentation generator with a web interface, reusable templates, and a multi-role generation pipeline. It turns documents or topic briefs into editable DrawingML PPTX files.

## Highlights

- Web UI for projects, templates, settings, and generation workflows
- FastAPI backend with project, template, format, and pipeline APIs
- Next.js frontend with English, Simplified Chinese, and Traditional Chinese locales
- Reusable layout templates, SVG assets, and presentation examples
- Export-oriented workflows for editable PowerPoint files

## Architecture

```text
frontend/   Next.js web application
backend/    FastAPI API and PPTX generation pipeline
skills/     PPT generation skills, scripts, and templates
examples/   Example presentation inputs and assets
projects/   Project workspaces and source materials
```

## Requirements

- Node.js with npm
- Python with pip
- An LLM provider/API configured for the backend workflow

## Quick start

```bash
git clone https://github.com/nosugr/PPT-master.git
cd PPT-master

# Install the root JavaScript tools, frontend packages, and backend packages
npm install
npm run install:all

# Copy the environment template and fill in the values required by your setup
cp .env.example .env

# Start the frontend and backend together
npm run dev
```

The web application runs at `http://localhost:3000`. The API runs at `http://localhost:8000`.

On Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env
```

## Useful commands

```bash
npm run dev              # Start frontend and backend
npm run dev:frontend    # Start only the Next.js frontend
npm run dev:backend     # Start only the FastAPI backend

cd frontend
npm run typecheck       # TypeScript validation
npm run build           # Production build
```

## Notes

- Do not commit local dependencies, virtual environments, caches, or generated build output.
- Keep API keys and provider credentials in local environment configuration, not in source files.
- The `examples/` and `projects/` directories contain reference materials and generated-workflow inputs; they are not required for every deployment.

## License

MIT License. See [LICENSE](LICENSE).
