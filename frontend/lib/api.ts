const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Projects
export interface Project {
  id: string;
  name: string;
  path: string;
  canvas_format: string;
  svg_count: number;
  has_spec: boolean;
  has_source: boolean;
  export_count: number;
  stage: string;
  created_at: number;
}

export interface ProjectStatus {
  id: string;
  name?: string;
  stage: string;
  svg_count: number;
  final_count: number;
  export_count: number;
  note_count: number;
  has_spec: boolean;
}

export const projects = {
  list: () => request<Project[]>("/api/projects"),
  create: (name: string, canvas_format: string) =>
    request<{ id: string; path: string }>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, canvas_format }),
    }),
  get: (id: string) => request<Project & { canvas_format: string; create_date: string }>(`/api/projects/${id}`),
  delete: (id: string) => request(`/api/projects/${id}`, { method: "DELETE" }),
  uploadSources: async (id: string, files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const res = await fetch(`${API_BASE}/api/projects/${id}/sources`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  importUrl: (id: string, url: string) =>
    request(`/api/projects/${id}/sources/url`, {
      method: "POST",
      body: JSON.stringify({ url }),
    }),
  listSlides: (id: string) =>
    request<{ name: string; filename: string; size: number }[]>(`/api/projects/${id}/slides`),
  getSlide: (id: string, name: string) =>
    request<{ name: string; svg: string }>(`/api/projects/${id}/slides/${name}`),
  listSources: (id: string) =>
    request<{ name: string; size: number; type: string }[]>(`/api/projects/${id}/sources`),
  listExports: (id: string) =>
    request<{ name: string; size: number; created: number }[]>(`/api/projects/${id}/exports`),
  status: (id: string) => request<ProjectStatus>(`/api/projects/${id}/status`),
  rename: (id: string, name: string) =>
    request<{ id: string; name: string }>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),
  duplicate: (id: string) =>
    request<{ id: string; name: string; path: string }>(`/api/projects/${id}/duplicate`, {
      method: "POST",
    }),
  deleteSlide: (projectId: string, slideName: string) =>
    request<{ deleted: string }>(`/api/projects/${projectId}/slides/${slideName}`, {
      method: "DELETE",
    }),
  getSlideNotes: (projectId: string, slideName: string) =>
    request<{ name: string; notes: string }>(`/api/projects/${projectId}/slides/${slideName}/notes`),
};

// Templates
export interface Template {
  id: string;
  summary: string;
  keywords: string[];
  svg_count: number;
  cover_svg: string | null;
  has_design_spec: boolean;
  source: "official" | "user";
}

export interface TemplateDetail extends Template {
  design_spec: string | null;
  svgs: { name: string; filename: string; size: number }[];
  assets: { name: string; size: number }[];
}

export const templates = {
  list: () => request<Template[]>("/api/templates"),
  get: (id: string) => request<TemplateDetail>(`/api/templates/${id}`),
  getSvg: (id: string, filename: string) =>
    request<{ filename: string; svg: string }>(`/api/templates/${id}/svg/${filename}`),
  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/templates/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },
  register: (stagingId: string) =>
    request<{ registered: string }>(`/api/templates/${stagingId}/register`, { method: "POST" }),
  delete: (id: string) =>
    request<{ deleted: string }>(`/api/templates/${id}`, { method: "DELETE" }),
};

// Pipeline
export interface GenerationStatus {
  status: "idle" | "running" | "completed" | "error";
  stage?: string;
  current_page?: number;
  total_pages?: number;
  message?: string;
  error?: string | null;
  started_at?: string;
  updated_at?: string;
}

export interface StrategistResult {
  status: string;
  confirmations: string;
  page_structure: string;
  design_spec: string;
  spec_lock: string;
  analysis_meta: {
    inferred_style?: string;
    inferred_page_count?: number;
    industry?: string;
    language?: string;
    analysis_reason?: string;
  };
}

export const pipeline = {
  finalize: (projectId: string, compress?: boolean) =>
    request<{ status: string; output: string }>(`/api/projects/${projectId}/finalize`, {
      method: "POST",
      body: JSON.stringify({ compress: compress ?? false }),
    }),
  splitNotes: (projectId: string) =>
    request<{ status: string; output: string }>(`/api/projects/${projectId}/split-notes`, {
      method: "POST",
    }),
  export: (projectId: string, opts?: { transition?: string; animation?: string; only?: string; export_path?: string }) =>
    request<{ status: string; output: string; export: { name: string; size: number } | null }>(
      `/api/projects/${projectId}/export`,
      { method: "POST", body: JSON.stringify(opts ?? {}) }
    ),
  qualityCheck: (projectId: string) =>
    request<{ status: string; output: string; errors: string[]; warnings: string[] }>(
      `/api/projects/${projectId}/quality-check`,
      { method: "POST" }
    ),
  generate: (projectId: string, opts?: { style?: string; page_count?: number; image_mode?: string; template_id?: string }) =>
    request<{ status: string; project_id: string }>(
      `/api/projects/${projectId}/generate`,
      { method: "POST", body: JSON.stringify(opts ?? {}) }
    ),
  generationStatus: (projectId: string) =>
    request<GenerationStatus>(`/api/projects/${projectId}/generation-status`),
  getDesignSpec: (projectId: string) =>
    request<{ content: string }>(`/api/projects/${projectId}/design-spec`),
  getSpecLock: (projectId: string) =>
    request<{ content: string }>(`/api/projects/${projectId}/spec-lock`),
  getQualityReport: (projectId: string) =>
    request<{ errors: string[]; stage?: string; message?: string }>(
      `/api/projects/${projectId}/quality-report`
    ),
  generateStrategist: (
    projectId: string,
    opts?: { style?: string; page_count?: number; template_id?: string }
  ) =>
    request<StrategistResult>(`/api/projects/${projectId}/generate/strategist`, {
      method: "POST",
      body: JSON.stringify(opts ?? {}),
    }),
  confirmAndGenerate: (
    projectId: string,
    opts: {
      confirmations?: string;
      page_structure?: string;
      style?: string;
      page_count?: number;
      image_mode?: string;
    }
  ) =>
    request<{ status: string; project_id: string; phase: string }>(
      `/api/projects/${projectId}/generate/confirm`,
      { method: "POST", body: JSON.stringify(opts) }
    ),
  generateExecutor: (
    projectId: string,
    opts?: { style?: string; page_count?: number; image_mode?: string }
  ) =>
    request<{ status: string; project_id: string; phase: string }>(
      `/api/projects/${projectId}/generate/executor`,
      { method: "POST", body: JSON.stringify(opts ?? {}) }
    ),
};

// Formats
export interface CanvasFormat {
  id: string;
  name: string;
  dimensions: string;
  aspect_ratio: string;
  use_case: string;
}

export const formats = {
  list: () => request<CanvasFormat[]>("/api/formats"),
};

// Settings
export interface SettingsField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  default?: string;
}

export interface SettingsProvider {
  name: string;
  description: string;
  tags: string[];
  env_key: string | null;
  env_value: string | null;
  fields: SettingsField[];
}

export interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  providers: string[];
}

export interface SettingsSchema {
  categories: SettingsCategory[];
  providers: Record<string, SettingsProvider>;
}

export interface SettingsData {
  exists: boolean;
  path?: string;
  values: Record<string, string>;
  raw_values?: Record<string, string>;
  image_backend: string;
  tts_provider: string;
  llm_provider: string;
}

export const settings = {
  schema: () => request<SettingsSchema>("/api/settings/schema"),
  get: () => request<SettingsData>("/api/settings"),
  update: (body: {
    selectors?: Record<string, string>;
    values?: Record<string, string>;
  }) => request<{ ok: boolean; path: string }>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(body),
  }),
  test: () => request<{ ok: boolean; model: string }>("/api/settings/test", { method: "POST" }),
  systemInfo: () => request<{
    python_version: string;
    projects_dir: string;
    default_export_path: string;
    disk_usage_bytes: number;
    disk_usage_human: string;
  }>("/api/settings/system-info"),
  updateDefaultExportPath: (path: string) =>
    request<{ ok: boolean; path: string }>("/api/settings/default-export-path", {
      method: "PUT",
      body: JSON.stringify({ path }),
    }),
  clearAllProjects: () => request<{ cleared: number }>("/api/settings/clear-all-projects", { method: "DELETE" }),
  resetEnv: () => request<{ ok: boolean }>("/api/settings/reset-env", { method: "DELETE" }),
};
